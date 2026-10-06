"use client";

import { useId } from "react";
import { buildOutline, outlinePath, VB_H, VB_W } from "@/lib/silhouette";
import {
  annotationFrame,
  BODY_FILL,
  connectionBox,
  FILM_BRASS,
  RUST,
} from "@/lib/schematic-layout";
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
  const frame = annotationFrame(outline, guides);
  const cx = VB_W / 2;
  const d = outlinePath(outline.points);
  const clipId = `sil-${useId().replace(/:/g, "")}`;
  const seat = connectionBox(profile.connection, cx, outline.topY);

  return (
    <svg viewBox={`0 0 ${frame.width} ${VB_H}`} role="img" aria-label={title} className={className}>
      <rect width={frame.width} height={VB_H} fill="#12110e" />
      <path d={d} fill={BODY_FILL} stroke="#1c1814" strokeWidth="1.2" />
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      {seat.internal ? (
        <g clipPath={`url(#${clipId})}>
          <ConnectionMark profile={profile} cx={cx} top={outline.topY} />
        </g>
      ) : (
        <ExternalHex cx={cx} top={outline.topY} />
      )}
      <line
        x1="8"
        x2={guides ? frame.bone.x - 4 : frame.width - 8}
        y1={outline.boneY}
        y2={outline.boneY}
        stroke="#1c1814"
        strokeWidth="2.6"
        strokeDasharray="3 4"
      />
      <line
        x1="8"
        x2={guides ? frame.bone.x - 4 : frame.width - 8}
        y1={outline.boneY}
        y2={outline.boneY}
        stroke={FILM_BRASS}
        strokeWidth="1.15"
        strokeDasharray="3 4"
      />
      {guides ? (
        <g>
          <line
            x1={frame.maxX + 2}
            x2={frame.bone.x - 2}
            y1={outline.boneY}
            y2={outline.boneY}
            stroke={FILM_BRASS}
            strokeWidth="0.8"
          />
          <text
            x={frame.bone.x}
            y={outline.boneY + 3}
            fill={FILM_BRASS}
            fontSize="8"
            fontFamily="ui-monospace, monospace"
          >
            bone line
          </text>
        </g>
      ) : null}
      <g>
        <rect x={frame.tag.x} y={frame.tag.y} width={frame.tag.w} height={frame.tag.h} fill="#12110e" stroke={FILM_BRASS} strokeWidth="0.6" />
        <text
          x={frame.tag.x + 4}
          y={frame.tag.y + 9}
          fill={FILM_BRASS}
          fontSize="7"
          fontFamily="ui-monospace, monospace"
        >
          SCHEMATIC
        </text>
      </g>
    </svg>
  );
}

function ExternalHex({ cx, top }: { cx: number; top: number }) {
  const box = connectionBox("ext-hex", cx, top);
  return <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={BODY_FILL} stroke={RUST} strokeWidth="1.1" />;
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
  const stroke = RUST;
  if (profile.connection === "int-hex") {
    return (
      <polygon
        points={`${cx - 5},${top + 11} ${cx - 5},${top + 17} ${cx},${top + 20} ${cx + 5},${top + 17} ${cx + 5},${top + 11} ${cx},${top + 8}`}
        fill={BODY_FILL}
        stroke={stroke}
        strokeWidth="1.1"
      />
    );
  }
  if (profile.connection === "octagon") {
    return (
      <polygon
        points={`${cx - 4},${top + 9} ${cx - 6},${top + 12} ${cx - 6},${top + 17} ${cx - 4},${top + 20} ${cx + 4},${top + 20} ${cx + 6},${top + 17} ${cx + 6},${top + 12} ${cx + 4},${top + 9}`}
        fill={BODY_FILL}
        stroke={stroke}
        strokeWidth="1.1"
      />
    );
  }
  if (profile.connection === "tube") {
    return (
      <g fill="none" stroke={stroke} strokeWidth="1.15">
        <line x1={cx - 4} y1={top + 10} x2={cx - 4} y2={top + 28} />
        <line x1={cx + 4} y1={top + 10} x2={cx + 4} y2={top + 28} />
      </g>
    );
  }
  if (profile.connection === "subcrestal") {
    return <path d={`M${cx - 6} ${top + 8} L${cx} ${top + 36} L${cx + 6} ${top + 8}`} fill={BODY_FILL} stroke={stroke} strokeWidth="1.15" />;
  }
  return <path d={`M${cx - 6} ${top + 8} L${cx} ${top + 22} L${cx + 6} ${top + 8}`} fill={BODY_FILL} stroke={stroke} strokeWidth="1.15" />;
}
