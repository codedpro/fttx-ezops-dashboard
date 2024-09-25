import { useState } from "react";
import { FaLightbulb } from "react-icons/fa";

interface TableThreeProps {
  data: any[];
  columns: { key: string; label: string }[];
  header: string;
  emoji: string;
}

const TableFour: React.FC<TableThreeProps> = ({
  data,
  columns,
  header,
  emoji,
}) => {
  const [visibleRows, setVisibleRows] = useState(10);
  const [loading, setLoading] = useState(false);

  const filteredColumns = columns.filter(
    (col) => col.key !== "ID" && col.key !== "FTTH_ID" && col.key !== "User_ID"
  );

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleRows((prevVisibleRows) => prevVisibleRows + 100);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white  p-4 shadow-1 dark:border-[#1F2B37] dark:bg-[#122031] dark:shadow-card sm:p-7.5  hover:shadow-lg">
      <h3 className="text-xl font-bold mb-4 dark:text-[#E2E8F0]">
        <span className="mr-2">{emoji}</span>
        {header}
      </h3>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC]  text-left dark:bg-[#1A2735] dark:border-b dark:border-[#1F2B37]">
              {filteredColumns.map((col) => (
                <th
                  key={col.key}
                  className="min-w-[150px] px-6 py-4 font-semibold text-center text-dark dark:text-[#E2E8F0] border-b text-nowrap border-[#eee] dark:border-[#2F3A47] text-xs md:text-sm lg:text-base transition-all hover:text-primary"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, visibleRows).map((item, index) => (
              <tr
                key={index}
                className="hover:bg-[#F1F5F9]  dark:hover:bg-[#1C2C3A] transition-colors"
              >
                {filteredColumns.map((col) => (
                  <td
                    key={col.key}
                    className={`border-[#eee] px-6 py-4 dark:border-[#1F2B37] ${
                      index === visibleRows - 1 ? "border-b-0" : "border-b"
                    }`}
                  >
                    <div className="text-dark text-center dark:text-[#E2E8F0] text-xs md:text-sm lg:text-base flex items-center justify-center space-x-2">
                      <p className="text-ellipsis text-nowrap overflow-hidden">
                        {item[col.key]}
                      </p>{" "}
                      {col.key === "Sub_Service" && (
                        <FaLightbulb className="text-yellow-400" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleRows < data.length && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            className={`px-4 py-2 text-white bg-primary hover:bg-primary-dark rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TableFour;
