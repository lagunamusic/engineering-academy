import {
  LEVEL_LABEL,
  type CapabilityLevel,
} from "@/lib/domain/types";
import type { CapabilityState, ModuleView } from "@/lib/builder/state";

type Pos = { x: number; y: number };

const CLUSTER_W = 600;
const CLUSTER_H = 300;
const R = 34;

// Skill Tree: um cluster por módulo. Gate no topo (raiz), demais capacidades
// como ramos embaixo. Cada nó reflete intensidade/arrefecimento do Builder.
export function SkillTree({
  modules,
  capabilities,
}: {
  modules: ModuleView[];
  capabilities: Record<string, CapabilityState>;
}) {
  return (
    <div className="space-y-10">
      {modules.map((m) => (
        <ModuleCluster key={m.id} module={m} capabilities={capabilities} />
      ))}
    </div>
  );
}

function ModuleCluster({
  module,
  capabilities,
}: {
  module: ModuleView;
  capabilities: Record<string, CapabilityState>;
}) {
  const gateId = module.gateCapability;
  const satellites = module.capabilities.filter((c) => c.id !== gateId);

  const gatePos: Pos = { x: CLUSTER_W / 2, y: 70 };
  const satPositions: Pos[] = satellites.map((_, i) => {
    const span = CLUSTER_W - 160;
    const step = satellites.length > 1 ? span / (satellites.length - 1) : 0;
    const x = satellites.length > 1 ? 80 + i * step : CLUSTER_W / 2;
    return { x, y: 220 };
  });

  return (
    <div>
      <p className="mono mb-2 text-xs tracking-[0.2em] text-muted">
        CYCLE {module.cycle} · MÓDULO {String(module.order).padStart(2, "0")}
      </p>
      <svg
        viewBox={`0 0 ${CLUSTER_W} ${CLUSTER_H}`}
        className="w-full"
        role="img"
        aria-label={`Capacidades do módulo ${module.title}`}
      >
        {/* Arestas gate -> satélites */}
        {satPositions.map((p, i) => (
          <line
            key={i}
            x1={gatePos.x}
            y1={gatePos.y}
            x2={p.x}
            y2={p.y}
            stroke="var(--color-border)"
            strokeWidth={1.5}
          />
        ))}

        {/* Nó do gate */}
        <Node
          pos={gatePos}
          capId={gateId}
          state={capabilities[gateId]}
          isGate
          index={0}
        />

        {/* Nós satélites */}
        {satellites.map((c, i) => (
          <Node
            key={c.id}
            pos={satPositions[i]}
            capId={c.id}
            state={capabilities[c.id]}
            isGate={false}
            index={i + 1}
          />
        ))}
      </svg>
    </div>
  );
}

function Node({
  pos,
  capId,
  state,
  isGate,
  index,
}: {
  pos: Pos;
  capId: string;
  state?: CapabilityState;
  isGate: boolean;
  index: number;
}) {
  const level: CapabilityLevel = state?.level ?? "none";
  const intensity = state?.intensity ?? 0;
  const cooled = state?.cooled ?? false;

  const fillOpacity = Math.max(0.08, intensity / 100);
  const glow = intensity >= 75 && !cooled;
  const fill = cooled ? "var(--color-cooled)" : "var(--color-ember)";
  const stroke = cooled
    ? "var(--color-cooled)"
    : intensity > 0
      ? "var(--color-ember)"
      : "var(--color-border)";

  return (
    <g
      className="animate-bounce-scale"
      style={{
        transformBox: "fill-box",
        transformOrigin: "center",
        animationDelay: `${index * 0.09}s`,
      }}
    >
      {/* halo de glow pros níveis altos */}
      {glow && (
        <circle
          cx={pos.x}
          cy={pos.y}
          r={R + 8}
          fill="var(--color-ember)"
          opacity={0.18}
        />
      )}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={isGate ? R + 4 : R}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={isGate ? 2 : 1.5}
      />
      {isGate && (
        <text
          x={pos.x}
          y={pos.y - R - 12}
          textAnchor="middle"
          className="mono"
          fontSize={10}
          fill="var(--color-ember)"
        >
          GATE
        </text>
      )}
      {/* nível dentro do nó */}
      <text
        x={pos.x}
        y={pos.y + 4}
        textAnchor="middle"
        className="mono"
        fontSize={11}
        fill="var(--color-fg)"
      >
        {LEVEL_LABEL[level]}
      </text>
      {/* nome da capacidade embaixo */}
      <text
        x={pos.x}
        y={pos.y + R + 20}
        textAnchor="middle"
        className="mono"
        fontSize={11}
        fill="var(--color-muted)"
      >
        {capId}
      </text>
      {cooled && (
        <text
          x={pos.x}
          y={pos.y + R + 36}
          textAnchor="middle"
          className="mono"
          fontSize={9}
          fill="var(--color-cooled)"
        >
          arrefecida · reforço
        </text>
      )}
    </g>
  );
}
