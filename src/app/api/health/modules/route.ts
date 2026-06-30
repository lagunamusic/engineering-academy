import { NextResponse } from "next/server";
import { loadAllModules } from "@/lib/modules/loader";

// Healthcheck do loader: confirma que os módulos em docs/academy/ parseiam e
// validam contra o schema. Não expõe dado de Builder — só o conteúdo público
// do currículo. Útil em dev pra pegar módulo malformado cedo.
export async function GET() {
  // Só em dev: a rubrica e os prompts do AI Guide não devem vazar em produção
  // (ajudaria a burlar a avaliação).
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  try {
    const modules = await loadAllModules();
    return NextResponse.json({
      ok: true,
      count: modules.length,
      modules: modules.map((m) => ({
        id: m.frontmatter.id,
        title: m.frontmatter.title,
        cycle: m.frontmatter.cycle,
        order: m.frontmatter.order,
        gate: m.frontmatter.gate,
        capabilities: m.frontmatter.capabilities,
        sectionKeys: Object.keys(m.sections),
        hasEvaluation: m.evaluation.capabilities.length > 0,
        aiPromptKeys: Object.keys(m.aiGuidePrompts),
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
