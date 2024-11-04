import React from "react";

interface DataItem {
  label: string;
  value: string | number | null;
  status?: boolean;
}

interface DataGridProps {
  title: string;
  data: DataItem[];
  className: string;
  emoji: string;
}

const DataGrid: React.FC<DataGridProps> = ({
  title,
  data,
  className,
  emoji,
}) => {
  const getIconColor = (
    status?: string | number | null,
    label?: string | number | null
  ) => {
    if (
      status === "Online" ||
      status === "Not Expired" ||
      status === "False" ||
      (label === "RX Power" &&
        typeof status === "number" &&
        status <= -8 &&
        status >= -28)
    ) {
      return "bg-green-500";
    }
    if (
      status === "Offline" ||
      (status === "True" &&
        label === "RX Power" &&
        typeof status === "number" &&
        status > -8 &&
        status < -28)
    ) {
      return "bg-red-500";
    }
    if (status === "Expired") {
      return "bg-yellow-500";
    }

    return "bg-gray-500";
  };

  return (
    <div className="bg-white dark:bg-gray-dark shadow-lg rounded-lg p-8  w-full">
      <h2 className="text-2xl font-bold mb-6 dark:text-[#E2E8F0] flex items-center">
        <span className="text-primary text-3xl mr-2">{emoji}</span> {title}
      </h2>

      <div className={className}>
        {data.map(({ label, value, status }, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1b2a3c]  bg-grid-black/[0.01] dark:bg-grid-white/[0.01]  p-5 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
          >
            <p className="text-xs dark:text-gray-400 mb-1">{label}</p>
            <p
              className={`font-semibold text-sm dark:text-[#E2E8F0] ${
                status
                  ? `inline-block px-2 py-1 rounded text-sm ${getIconColor(value, label)}`
                  : ""
              }`}
            >
              {value || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataGrid;
