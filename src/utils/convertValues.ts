export function convertValuesToHighUnit(values: number[]): {
  convertedValues: number[];
  unitSuffix: string;
} {
  if (values.length === 0) return { convertedValues: [], unitSuffix: "MB" };

  const maxVal = Math.max(...values);

  // Define thresholds in MB
  const MB_IN_GB = 1024; // 1 GB = 1024 MB
  const MB_IN_TB = 1024 * MB_IN_GB; // 1 TB = 1,048,576 MB
  const MB_IN_PB = 1024 * MB_IN_TB; // 1 PB = 1,073,741,824 MB
  const MB_IN_EB = 1024 * MB_IN_PB; // 1 EB = 1,099,511,627,776 MB
  const MB_IN_ZB = 1024 * MB_IN_EB; // 1 ZB
  const MB_IN_YB = 1024 * MB_IN_ZB; // 1 YB
  const MB_IN_BB = 1024 * MB_IN_YB; // 1 BB (approx. brontobyte scale)

  let unit = "MB";
  let divisor = 1;

  if (maxVal >= MB_IN_BB) {
    unit = "BB";
    divisor = MB_IN_BB;
  } else if (maxVal >= MB_IN_YB) {
    unit = "YB";
    divisor = MB_IN_YB;
  } else if (maxVal >= MB_IN_ZB) {
    unit = "ZB";
    divisor = MB_IN_ZB;
  } else if (maxVal >= MB_IN_EB) {
    unit = "EB";
    divisor = MB_IN_EB;
  } else if (maxVal >= MB_IN_PB) {
    unit = "PB";
    divisor = MB_IN_PB;
  } else if (maxVal >= MB_IN_TB) {
    unit = "TB";
    divisor = MB_IN_TB;
  } else if (maxVal >= MB_IN_GB) {
    unit = "GB";
    divisor = MB_IN_GB;
  }

  const convertedValues = values.map((val) => val / divisor);
  return { convertedValues, unitSuffix: unit };
}
