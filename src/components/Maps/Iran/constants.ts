import * as am5 from "@amcharts/amcharts5";

/** Primary highlight color for the map. */
export const PRIMARY_COLOR = 0xffcc01;

/** Returns white in dark mode or black in light mode for normal province fill. */
export function getNormalFill(): am5.Color {
  return am5.color(
    document.documentElement.classList.contains("dark") ? 0xffffff : 0x000000
  );
}
