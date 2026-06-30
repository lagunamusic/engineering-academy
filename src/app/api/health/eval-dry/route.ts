import { NextResponse } from "next/server";
import { getModuleById } from "@/lib/modules/loader";
import { resolveObjectiveEvidence } from "@/lib/ai/objective";

// DEV-ONLY. Roda só o resolvedor objetivo (sem IA, sem banco) contra um texto,
// pra tunar as heurísticas. Não expõe nada sensível além disso.
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const body = (await request.json().catch(() => null)) as {
    moduleId?: string;
    content?: string;
  } | null;
  if (!body?.content) {
    return NextResponse.json({ error: "content obrigatório" }, { status: 400 });
  }
  const mod = await getModuleById(body.moduleId ?? "module-01");
  if (!mod) {
    return NextResponse.json({ error: "módulo não encontrado" }, { status: 404 });
  }
  const objective = resolveObjectiveEvidence(mod.evaluation, body.content);
  return NextResponse.json({ objective });
}
