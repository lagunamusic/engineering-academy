import "server-only";

import type Anthropic from "@anthropic-ai/sdk";
import type { LoadedModule } from "@/lib/modules/schema";
import { meetsLevel } from "@/lib/domain/types";
import { getAnthropic, MODELS } from "./anthropic";
import {
  evaluationContractSchema,
  extractJson,
  type EvaluationContract,
} from "./contract";
import { resolveObjectiveEvidence } from "./objective";
import {
  buildEvaluationSystem,
  buildEvaluationUserMessage,
} from "./prompts";

type Msg = { role: "user" | "assistant"; content: string };

async function callModel(
  model: string,
  systemText: string,
  messages: Msg[],
  temperature: number,
): Promise<string> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model,
    max_tokens: 1200,
    temperature,
    // Cache do system (rubrica + instruções fixas): barato em chamadas repetidas.
    system: [
      {
        type: "text",
        text: systemText,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// Força determinismo no resultado: o que é regra é regra, a IA não sobrescreve.
function enforce(
  parsed: EvaluationContract,
  mod: LoadedModule,
  objectiveEvidence: Record<string, boolean | number>,
): EvaluationContract {
  const gate = mod.evaluation.gate;
  const allowedLeaks = new Set(mod.frontmatter.leak_tags);

  const capabilities = parsed.capabilities.map((c) => ({
    ...c,
    // Os valores objetivos vêm da regra, sempre. A IA não os altera.
    evidence: { ...c.evidence, ...objectiveEvidence },
  }));

  // A capability do gate, avaliada pela IA.
  const gateCap = capabilities.find((c) => c.id === gate.capability);
  const gatePassed = gateCap
    ? meetsLevel(gateCap.level, gate.min_level)
    : false;

  return {
    ...parsed,
    rubric_version: mod.frontmatter.rubric_version,
    capabilities,
    gate_passed: gatePassed, // calculado por regra, não pela palavra da IA
    leak_tags: parsed.leak_tags.filter((t) => allowedLeaks.has(t)),
    // Coerência: se passou, não há gap nem próxima micro-missão.
    blocking_gap: gatePassed ? null : parsed.blocking_gap,
    next_micro_mission: gatePassed ? null : parsed.next_micro_mission,
  };
}

export type EvaluateArgs = {
  mod: LoadedModule;
  missionTitle: string;
  submission: string;
  isGate: boolean;
};

export async function evaluateSubmission(
  args: EvaluateArgs,
): Promise<EvaluationContract> {
  const objectiveEvidence = resolveObjectiveEvidence(
    args.mod.evaluation,
    args.submission,
  );
  const systemText = buildEvaluationSystem(args.mod);
  const userMsg = buildEvaluationUserMessage({
    missionTitle: args.missionTitle,
    submission: args.submission,
    objectiveEvidence,
  });
  // Gate e Boss: Sonnet, temperatura baixa. Rotineiro: Haiku.
  const model = args.isGate ? MODELS.gate : MODELS.routine;

  let messages: Msg[] = [{ role: "user", content: userMsg }];
  let lastErr: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callModel(model, systemText, messages, 0);
    try {
      const parsed = evaluationContractSchema.parse(extractJson(text));
      return enforce(parsed, args.mod, objectiveEvidence);
    } catch (err) {
      lastErr = err;
      messages = [
        { role: "user", content: userMsg },
        { role: "assistant", content: text },
        {
          role: "user",
          content: `Sua resposta não validou no contrato (${
            err instanceof Error ? err.message : String(err)
          }). Retorne SOMENTE o objeto JSON exato do contrato, sem nenhum texto fora dele.`,
        },
      ];
    }
  }

  throw new Error(
    `A avaliação não retornou JSON válido após 2 tentativas. Último erro: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}
