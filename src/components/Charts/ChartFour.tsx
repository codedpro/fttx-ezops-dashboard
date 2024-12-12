"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactApexChart from "react-apexcharts";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { exportToXLSX } from "@/utils/exportToExcel";
import PayloadDayModal from "@/components/PayloadDayModal";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";
import DefaultSelectOption from "@/components/SelectOption/DefaultSelectOption";
import { Input } from "../FormElements/Input";

interface ChartFourProps {
  dailyData: {
    Date: string;
    Value: number;
  }[];
  exportid?: string;
  header: string;
  defaultCity: string;
}

const ChartFour: React.FC<ChartFourProps> = ({
  dailyData,
  exportid,
  header,
  defaultCity,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<string>("Week");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const { cities } = useFTTHCitiesStore((state) => ({
    cities: state.cities,
    isLoading: state.isLoading,
    error: state.error,
  }));

  useEffect(() => {
    const queryCity = searchParams.get("PayloadCity");
    const initialCity = queryCity || defaultCity;

    const matchedCity = cities.find((city) => city.Name === initialCity);
    if (matchedCity) {
      setSelectedCity(initialCity);
      setSearchTerm(matchedCity.Full_Name);
    } else {
      setSelectedCity("all");
      setSearchTerm("");
    }

    setIsSearching(false);
  }, [cities, defaultCity, searchParams]);

  const handleCityChange = (value: string) => {
    const selected = cities.find((city) => city.Full_Name === value);
    const params = new URLSearchParams(searchParams.toString());

    if (!value.trim()) {
      params.delete("PayloadCity");
      setSelectedCity("all");
      setSearchTerm("");
    } else {
      const newCity = selected?.Name || "all";
      setSelectedCity(newCity);
      params.set("PayloadCity", newCity);
      setIsSearching(true);
    }

    router.replace(`?${params.toString()}`);
  };

  const sortedData = useMemo(
    () =>
      [...dailyData].sort(
        (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
      ),
    [dailyData]
  );

  const filteredData = useMemo(
    () => sortedData.slice(-1 * (filter === "Week" ? 7 : 30)),
    [sortedData, filter]
  );

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const formatDateForModal = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const dates = useMemo(
    () => filteredData.map((item) => formatDateForDisplay(item.Date)),
    [filteredData]
  );

  const series = useMemo(
    () => [
      {
        name: "Network Payload",
        data: filteredData.map((item) => ({
          x: formatDateForDisplay(item.Date),
          y: item.Value,
        })),
      },
    ],
    [filteredData]
  );

  const options = useMemo(() => {
    return {
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
      },
      colors: ["#feca00", "#fff18a"],
      chart: {
        fontFamily: "Satoshi, sans-serif",
        height: 310,
        type: "area",
        toolbar: { show: false },
        events: {
          markerClick: (
            event: any,
            chartContext: any,
            { seriesIndex, dataPointIndex }: any
          ) => {
            const selectedData = series[seriesIndex].data[dataPointIndex];
            if (selectedData && selectedData.x) {
              const originalDate = filteredData[dataPointIndex].Date;
              const formattedDate = formatDateForModal(originalDate);
              setSelectedDay(formattedDate);
              setIsModalOpen(true);
            } else {
              console.error("Selected data point is invalid:", selectedData);
            }
          },
        },
      },
      fill: { gradient: { opacityFrom: 0.55, opacityTo: 0 } },
      stroke: { curve: "smooth", width: 2 },
      grid: {
        strokeDashArray: 5,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: "category",
        categories: dates,
        labels: { style: { fontSize: "20px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => {
            const units = ["MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
            let unitIndex = 0;
            while (value >= 1000 && unitIndex < units.length - 1) {
              value /= 1000;
              unitIndex++;
            }
            return `${value.toFixed(2)} ${units[unitIndex]}`;
          },
        },
        title: { style: { fontSize: "0px" } },
      },
    };
  }, [dates, series, filteredData]);

  const handleDownload = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const exportData = filteredData.map((item) => ({
      Date: item.Date.split("T")[0],
      Value: item.Value,
    }));
    exportToXLSX(exportData, `Filtered_Data_${filter}`);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDay(null);
  }, []);

  const filteredCities = useMemo(
    () =>
      cities.filter((city) =>
        city.Full_Name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [cities, searchTerm]
  );

  const matchedCity = cities.find((c) => c.Name === selectedCity);
  const shouldShowSuggestions =
    searchTerm.trim().length > 0 &&
    (!matchedCity || searchTerm !== matchedCity.Full_Name);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTerm.trim().length === 0) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("PayloadCity");
        setSelectedCity("all");
        router.replace(`?${params.toString()}`);
      } else if (filteredCities.length > 0) {
        const firstCity = filteredCities[0];
        handleCityChange(firstCity.Full_Name);
        setSearchTerm(firstCity.Full_Name);
        setIsSearching(true);
      }
    }
  };

  return (
    <div className="col-span-12 rounded-[10px] bg-white dark:bg-gray-dark px-7.5 pb-12.5 pt-7.5 shadow-1 dark:shadow-card xl:col-span-7">
      <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            {header} {matchedCity?.Full_Name}
          </h4>
        </div>
        <div className="relative flex flex-col gap-2.5 sm:flex-row sm:items-center w-full sm:w-auto">
          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Filter by:
          </p>
          <DefaultSelectOption
            options={["Week", "Month"]}
            onChange={(value: string) => setFilter(value)}
            defaultValue={filter}
          />

          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {shouldShowSuggestions && filteredCities.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white dark:bg-gray-dark border dark:border-dark-3 mt-1 max-h-40 w-full overflow-auto rounded-md shadow-lg z-30 text-black dark:text-white">
                {filteredCities.map((city) => (
                  <li
                    key={city.Name}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-dark-2 cursor-pointer"
                    onClick={() => {
                      handleCityChange(city.Full_Name);
                      setSearchTerm(city.Full_Name);
                      setIsSearching(true);
                    }}
                  >
                    {city.Full_Name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-primaryhover"
            onClick={handleDownload}
            title="Download"
          >
            <FaCloudDownloadAlt size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div>
        <div className="-ml-4 -mr-5">
          {isSearching ? (
            <div className="flex justify-center items-center h-32">
              <svg
                className="animate-spin h-10 w-10 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
          ) : (
            <ReactApexChart
              options={options as ApexCharts.ApexOptions}
              series={series}
              type="area"
              height={310}
            />
          )}
        </div>
      </div>

      {isModalOpen && selectedDay && (
        <PayloadDayModal date={selectedDay} onClose={handleCloseModal} city={matchedCity?.Name ?? "all"} />
      )}
    </div>
  );
};

export default ChartFour;
