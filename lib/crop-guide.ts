export type CropRead = {
  tone: "ready" | "wide" | "short";
  title: string;
  text: string;
};

/** Sahiwal reads coronal, midbody, and apical thirds. The box should hold all three and little else. */
export function cropRead(box: { w: number; h: number }): CropRead {
  if (box.h < 0.42) {
    return {
      tone: "short",
      title: "A third is likely cut off",
      text: "Sahiwal reads the coronal, middle, and apical thirds. Stretch the box until the collar and the apex are both inside.",
    };
  }
  if (box.h > 0 && box.w / box.h > 0.78) {
    return {
      tone: "wide",
      title: "The box is wide for one fixture",
      text: "A neighbor or the crown may be inside. Narrow it to the implant. A wide crop makes a healing abutment look like a tulip flange.",
    };
  }
  return {
    tone: "ready",
    title: "Three bands in the box",
    text: "Collar at the top, threads in the middle, apex at the bottom. That is the order used in the 2002 radiographic tables.",
  };
}
