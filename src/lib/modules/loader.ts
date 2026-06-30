// Loader de módulos — lê docs/academy/**/module-*.md, valida contra o schema,
// e devolve módulos tipados. SÓ roda no servidor (usa node:fs). Nunca importe
// isto em componente client.

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load as loadYaml } from "js-yaml";
import {
  aiGuidePromptsBlockSchema,
  evaluationBlockSchema,
  frontmatterSchema,
  type LoadedModule,
} from "./schema";

const ACADEMY_DIR = path.join(process.cwd(), "docs", "academy");

// Erro tipado pra falhas de validação — mensagem clara, não stack obscuro.
export class ModuleLoadError extends Error {
  constructor(
    public readonly file: string,
    message: string,
  ) {
    super(`[módulo ${file}] ${message}`);
    this.name = "ModuleLoadError";
  }
}

function slugify(heading: string): string {
  return heading
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira acentos (marcas combinantes)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Quebra o corpo markdown em seções por heading "## ".
function extractSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  let currentKey: string | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (currentKey) sections[currentKey] = buffer.join("\n").trim();
    buffer = [];
  };
  for (const line of body.split("\n")) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      flush();
      currentKey = slugify(m[1]);
    } else if (currentKey !== null) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

// Extrai todos os blocos ```yaml do corpo e devolve os objetos parseados.
function extractYamlBlocks(body: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /```ya?ml\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    blocks.push(loadYaml(match[1]));
  }
  return blocks;
}

function findBlockWithKey<T>(blocks: unknown[], key: string): T | undefined {
  return blocks.find(
    (b): b is T =>
      typeof b === "object" && b !== null && key in (b as object),
  ) as T | undefined;
}

// Parseia + valida UM arquivo de módulo. Lança ModuleLoadError se quebrar.
export function parseModuleFile(fileName: string, source: string): LoadedModule {
  const { data, content } = matter(source);

  const fm = frontmatterSchema.safeParse(data);
  if (!fm.success) {
    throw new ModuleLoadError(
      fileName,
      `frontmatter inválido: ${fm.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const yamlBlocks = extractYamlBlocks(content);

  const evalRaw = findBlockWithKey(yamlBlocks, "evaluation");
  const evalParsed = evaluationBlockSchema.safeParse(evalRaw);
  if (!evalParsed.success) {
    throw new ModuleLoadError(
      fileName,
      `bloco 'evaluation' inválido ou ausente: ${evalParsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const promptsRaw = findBlockWithKey(yamlBlocks, "ai_guide_prompts");
  const promptsParsed = aiGuidePromptsBlockSchema.safeParse(promptsRaw);
  if (!promptsParsed.success) {
    throw new ModuleLoadError(
      fileName,
      `bloco 'ai_guide_prompts' inválido ou ausente: ${promptsParsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }

  // Trava de coerência: o gate do frontmatter tem que casar com o da avaliação.
  if (
    fm.data.gate.capability !== evalParsed.data.evaluation.gate.capability ||
    fm.data.gate.min_level !== evalParsed.data.evaluation.gate.min_level
  ) {
    throw new ModuleLoadError(
      fileName,
      "o gate do frontmatter não bate com o gate do bloco de avaliação.",
    );
  }

  return {
    frontmatter: fm.data,
    evaluation: evalParsed.data.evaluation,
    aiGuidePrompts: promptsParsed.data.ai_guide_prompts,
    sections: extractSections(content),
    rawBody: content,
  };
}

// Acha recursivamente todos os arquivos module-*.md em docs/academy/.
async function findModuleFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out; // pasta não existe ainda
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await findModuleFiles(full)));
    } else if (/^module-.*\.md$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

let _cache: LoadedModule[] | null = null;

// Carrega e valida TODOS os módulos. Ordena por cycle, depois order.
export async function loadAllModules(): Promise<LoadedModule[]> {
  if (_cache && process.env.NODE_ENV === "production") return _cache;

  const files = await findModuleFiles(ACADEMY_DIR);
  const modules: LoadedModule[] = [];
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    modules.push(parseModuleFile(path.basename(file), source));
  }

  modules.sort(
    (a, b) =>
      a.frontmatter.cycle - b.frontmatter.cycle ||
      a.frontmatter.order - b.frontmatter.order,
  );

  _cache = modules;
  return modules;
}

export async function getModuleById(id: string): Promise<LoadedModule | null> {
  const all = await loadAllModules();
  return all.find((m) => m.frontmatter.id === id) ?? null;
}
