import React from "react";

const colorRanges = [
  { color: "green", countRange: "3-8" },
  { color: "orange", countRange: "8-15" },
  { color: "red", countRange: "16-25" },
];

const LegendPanel: React.FC = () => {
  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-white bg-opacity-80 dark:bg-[#1F2937] dark:bg-opacity-60 rounded-lg shadow-lg">
      <h3 className="font-bold text-base mb-2 dark:text-white">
        FAT Area Colors
      </h3>
      {colorRanges.map((range) => (
        <div key={range.color} className="flex items-center mb-2">
          <div
            className="w-6 h-6 rounded-full mr-2"
            style={{ backgroundColor: range.color }}
          ></div>
          <span className="text-sm font-medium dark:text-gray-200">
            {range.countRange}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LegendPanel;
