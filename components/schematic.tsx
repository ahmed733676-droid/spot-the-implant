import { buildOutline, outlinePath, VB_H, VB_W } from "@/lib/silhouette";
import type { SchematicProfile } from "@/lib/types";

export function FixtureSchematic({
  profile,
  className,
  title = "Schematic fixture silhouette, not a radiograph",
  guides = false,
}: {
  profile: SchematicProfile;
  className?: string;
  title?: string;
  guides?: boolean;
}) {
  const outline = buildOutline(profile);
  const cx = VB_W / 2;
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={title} className={className}>
      <rect width={VB_W} height={VB_H} fill="#12110e" />
      <line
        x1="18"
        x2={VB_W - 18}
        y1={outline.boneY}
        y2={outline.boneY}
        stroke="#e7ff57"
        strokeOpacity="0.45"
        strokeDasharray="3 4"
        strokeWidth="1"
      />
      <path d={outlinePath(outline.points)} fill="#f3eadc" stroke="#1c1814" strokeWidth="1.2" />
      <ConnectionMark profile={profile} cx={cx} top={outline.topY} />
      {guides ? (
        <text x="12" y={outline.boneY - 6} fill="#e7ff57" fontSize="9" fontFamily="ui-monospace, monospace">
          bone line
        </text>
      ) : null}
      <text x="10" y="16" fill="#e7ff57" fontSize="8" fontFamily="ui-monospace, monospace" letterSpacing="0.4">
        SCHEMATIC
      </text>
    </svg>
  );
}

function ConnectionMark({
  profile,
  cx,
  top,
}: {
  profile: SchematicProfile;
  cx: number;
  top: number;
}) {
  const stroke = "#5c4630";
  if (profile.connection === "ext-hex") {
    return <rect x={cx - 7} y={top - 12} width="14" height="12" fill="#f3eadc" stroke={stroke} />;
  }
  if (profile.connection === "int-hex") {
    return <polygon points={`${cx - 6},${top + 8} ${cx - 6},${top + 16} ${cx},${top + 20} ${cx + 6},${top + 16} ${cx + 6},${top + 8} ${cx},${top + 4}`} fill="none" stroke={stroke} strokeWidth="1.2" />;
  }
  if (profile.connection === "octagon") {
    return <polygon points={`${cx - 5},${top + 8} ${cx - 7},${top + 12} ${cx - 7},${top + 18} ${cx - 5},${top + 22} ${cx + 5},${top + 22} ${cx + 7},${top + 18} ${cx + 7},${top + 12} ${cx + 5},${top + 8}`} fill="none" stroke={stroke} strokeWidth="1.2" />;
  }
  if (profile.connection === "tube") {
    return (
      <g fill="none" stroke={stroke} strokeWidth="1.2">
        <line x1={cx - 5} y1={top + 6} x2={cx - 5} y2={top + 28} />
        <line x1={cx + 5} y1={top + 6} x2={cx + 5} y2={top + 28} />
      </g>
    );
  }
  if (profile.connection === "subcrestal") {
    return <path d={`M${cx - 8} ${top + 6} L${cx} ${top + 42} L${cx + 8} ${top + 6}`} fill="none" stroke={stroke} strokeWidth="1.3" />;
  }
  return <path d={`M${cx - 8} ${top + 6} L${cx} ${top + 24} L${cx + 8} ${top + 6}`} fill="none" stroke={stroke} strokeWidth="1.3" />;
}
