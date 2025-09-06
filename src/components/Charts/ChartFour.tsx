/* ------------------------------------------------------------------ */
/*  ChartFour.tsx                                                     */
/* ------------------------------------------------------------------ */
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import ReactApexChart from "react-apexcharts";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { exportToXLSX } from "@/utils/exportToExcel";
import PayloadDayModal from "@/components/PayloadDayModal";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";
import DefaultSelectOption from "@/components/SelectOption/DefaultSelectOption";
import { Input } from "../FormElements/Input";
import { UserService } from "@/services/userService";

/* ------------------------------------------------------------------ */
/*  TYPE DEFINITIONS                                                  */
/* ------------------------------------------------------------------ */
interface FTTHPayload {
  Date: string;
  Value: number;     // Charged traffic   (≈ 30 TB) — axis 0
  Value2: number;    // Actual traffic    (≈ 30 TB) — axis 0
  ValueUp: number;   // Upload traffic    (≈ 10 GB) — axis 1
  ValueDown: number; // Download traffic  (≈ 10 GB) — axis 1
}

interface ChartFourProps {
  exportid?: string;
  header: string;
  defaultCity: string;
}

/* ------------------------------------------------------------------ */
/*  DATA FETCH (client-side)                                          */
/* ------------------------------------------------------------------ */
async function fetchFTTHPayload(
  token: string,
  city: string = "all",
): Promise<FTTHPayload[]> {
  const data = JSON.stringify({ StartDay: 1, EndDay: 30, City: city });

  const config = {
    method: "post",
    url: `/api/FTTHGetPayloadPerDayV2`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data,
  };

  try {
    const res = await axios.request<FTTHPayload[]>(config);

    if (res.data?.length === 0 && city !== "all") {
      console.warn(`No data for “${city}”. Falling back to “all”.`);
      return fetchFTTHPayload(token, "all");
    }
    return res.data;
  } catch (err) {
    console.error("Error fetching FTTH payload:", err);
    throw new Error("Failed to fetch FTTH payload data");
  }
}

/* ================================================================== */
/*  COMPONENT                                                         */
/* ================================================================== */
const ChartFour: React.FC<ChartFourProps> = ({
  exportid,
  header,
  defaultCity,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ----------------------------  STATE  --------------------------- */
  const [filter, setFilter]         = useState<"Week" | "Month">("Month");
  const [selectedCity, setCity]     = useState<string>("all");
  const [searchTerm, setSearch]     = useState<string>("");
  const [selectedDay, setDay]       = useState<string | null>(null);
  const [isModalOpen, setModal]     = useState<boolean>(false);
  const [isSearching, setBusy]      = useState<boolean>(false);
  const [payload, setPayload]       = useState<FTTHPayload[] | null>(null);
  const [errorMsg, setError]        = useState<string | null>(null);

  const { cities } = useFTTHCitiesStore((s) => ({
    cities: s.cities,
    isLoading: s.isLoading,
    error:     s.error,
  }));

  /* -----------------  INITIAL CITY FROM URL  ---------------------- */
  useEffect(() => {
    const queryCity   = searchParams.get("PayloadCity");
    const initialCity = queryCity || defaultCity;

    const match = cities.find((c) => c.Name === initialCity);
    if (match) {
      setCity(initialCity);
      setSearch(match.Full_Name);
    } else {
      setCity("all");
      setSearch("");
    }
    setBusy(false);
  }, [cities, defaultCity, searchParams]);

  /* -----------------------------  DATA  --------------------------- */
  useEffect(() => {
    const load = async () => {
      setBusy(true);
      setError(null);

      try {
        const token = new UserService().getToken();
        if (!token) throw new Error("No AccessToken found.");

        setPayload(await fetchFTTHPayload(token, selectedCity));
      } catch (e: any) {
        setError(e.message || "Failed to fetch payload data");
        setPayload(null);
      } finally {
        setBusy(false);
      }
    };

    if (selectedCity) load();
  }, [selectedCity]);

  /* ---------------------------  FILTERS  -------------------------- */
  const sorted = useMemo(
    () =>
      payload
        ? [...payload].sort(
            (a, b) =>
              new Date(a.Date).getTime() - new Date(b.Date).getTime()
          )
        : [],
    [payload]
  );

  const filtered = useMemo(() => {
    const lastN = filter === "Week" ? 7 : 30;
    return sorted.slice(-lastN);
  }, [sorted, filter]);

  /* -------------------------  HELPERS  ---------------------------- */
  const labelDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

  const modalDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${`0${dt.getMonth() + 1}`.slice(-2)}-${`0${dt.getDate()}`.slice(-2)}`;
  };

  // Formatters with correct base for our data shape
  // Daily traffic values are provided in GB; format GB->TB->PB...
  const humanUnitsFromGB = (v: number) => {
    const u = ["GB", "TB", "PB", "EB", "ZB", "YB"] as const;
    let i = 0;
    while (v >= 1000 && i < u.length - 1) {
      v /= 1000;
      i++;
    }
    return `${v.toFixed(2)} ${u[i]}`;
  };
  // Throughput peaks are provided in Gbps; format Gbps->Tbps->Pbps...
  const humanUnitsGbps = (v: number) => {
    const u = ["Gbps", "Tbps", "Pbps", "Ebps", "Zbps", "Ybps"] as const;
    let i = 0;
    while (v >= 1000 && i < u.length - 1) {
      v /= 1000;
      i++;
    }
    return `${v.toFixed(2)} ${u[i]}`;
  };
  
  /* ----------------------------  SERIES  -------------------------- */
  const series = useMemo(
    () => [
      {
        name: "Charged Traffic Usage", // TB-scale
        type: "area",
        yAxisIndex: 0,
        data: filtered.map((p) => ({
          x: labelDate(p.Date),
          y: p.Value,
        })),
      },
      {
        name: "Actual Traffic Usage", // TB-scale
        type: "area",
        yAxisIndex: 0,
        data: filtered.map((p) => ({
          x: labelDate(p.Date),
          y: p.Value2,
        })),
      },
      {
        name: "Throughput peak uplink (Gbps)", // Gbps-scale
        type: "line",
        yAxisIndex: 1,
        data: filtered.map((p) => ({
          x: labelDate(p.Date),
          y: p.ValueUp,
        })),
      },
      {
        name: "Throughput peak downlink (Gbps)", // Gbps-scale
        type: "line",
        yAxisIndex: 1,
        data: filtered.map((p) => ({
          x: labelDate(p.Date),
          y: p.ValueDown,
        })),
      },
    ],
    [filtered]
  );

  /* ---------------------------  OPTIONS  -------------------------- */
  const options = useMemo(
    () => ({
      chart: {
        fontFamily: "Satoshi, sans-serif",
        height: 310,
        type: "area",
        toolbar: { show: false },
        events: {
          markerClick: (_e: any, _ctx: any, { dataPointIndex }: any) => {
            const d = filtered[dataPointIndex]?.Date;
            if (d) {
              setDay(modalDate(d));
              setModal(true);
            }
          },
        },
      },
      
      colors: ["#00CFFF", "#FFD700", "#AA55FF", "#00FFAA"],

      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
      },
      /* ↑↑↑ no change above ↑↑↑ */

      /* ↓↓↓ updated fill & stroke below ↓↓↓ */
      fill: {
        type: ["gradient", "gradient", "solid", "solid"],
        gradient: {
          opacityFrom: 0.3,  // ⬅ lower area fill opacity
          opacityTo: 0,
        },
        opacity: [0.3, 0.3, 0.5, 0.5], // ⬅ area = light fill, lines = full solid
      },
      stroke: {
        curve: "smooth",
        width: [3, 3, 4, 4],  // ⬅ thicker lines for throughput
      },
      /* ↑↑↑ end fill & stroke updates ↑↑↑ */

      grid: {
        strokeDashArray: 5,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
          
    tooltip: {
      y: {
        formatter: (val: number, { seriesIndex }: any) => {
          return seriesIndex === 2 || seriesIndex === 3
            ? humanUnitsGbps(val)
            : humanUnitsFromGB(val);
        },
      },
    },
      xaxis: {
        type: "category",
        categories: filtered.map((p) => labelDate(p.Date)),
        labels: { style: { fontSize: "20px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: [
        {
          // Left axis for both payload series
          seriesName: "Charged Traffic Usage",
          labels: { formatter: humanUnitsFromGB },
          title: { text: "Daily Traffic (GB/TB/PB)", style: { fontSize: "12px" } },
        },
        {
          // Hide duplicate left axis for Actual (shares same units)
          seriesName: "Actual Traffic Usage",
          show: false,
          labels: { formatter: humanUnitsFromGB },
          title: { text: "", style: { fontSize: "0px" } },
        },
        {
          // Right axis for throughput uplink
          seriesName: "Throughput peak uplink (Gbps)",
          opposite: true,
          labels: { formatter: humanUnitsGbps },
          title: { text: "Peak Throughput (Gbps/Tbps)", style: { fontSize: "12px" } },
        },
        {
          // Hide duplicate right axis for throughput downlink (same units)
          seriesName: "Throughput peak downlink (Gbps)",
          opposite: true,
          show: false,
          labels: { formatter: humanUnitsGbps },
          title: { text: "", style: { fontSize: "0px" } },
        },
      ],
    }),
    [filtered]
  );

  /* -----------------------  DOWNLOAD XLSX  ------------------------ */
  const handleDownload = () => {
    if (!filtered.length) {
      alert("No data to export.");
      return;
    }
    exportToXLSX(
      filtered.map((p) => ({
        Date:     p.Date.split("T")[0],
        Charged:  p.Value,
        Actual:   p.Value2,
        Upload:   p.ValueUp,
        Download: p.ValueDown,
      })),
      `Filtered_Data_${filter}`
    );
  };

  /* --------------------  CITY SELECTION & SEARCH  ----------------- */
  const changeCity = (val: string) => {
    const found = cities.find((c) => c.Full_Name === val);
    const params = new URLSearchParams(searchParams.toString());

    if (!val.trim()) {
      params.delete("PayloadCity");
      setCity("all");
      setSearch("");
    } else {
      const city = found?.Name || "all";
      setCity(city);
      params.set("PayloadCity", city);
    }
    router.replace(`?${params.toString()}`);
  };

  const matched = cities.find((c) => c.Name === selectedCity);
  const suggestions = useMemo(
    () =>
      cities.filter((c) =>
        c.Full_Name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [cities, searchTerm]
  );
  const showSuggest =
    !!searchTerm.trim() &&
    (!matched || searchTerm !== matched.Full_Name);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (!searchTerm.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("PayloadCity");
      setCity("all");
      router.replace(`?${params.toString()}`);
    } else if (suggestions.length) {
      const first = suggestions[0];
      changeCity(first.Full_Name);
      setSearch(first.Full_Name);
    }
  };

  /* -----------------------------  UI  ----------------------------- */
  return (
    <div className="col-span-12 rounded-[10px] bg-white dark:bg-gray-dark px-7.5 pb-12.5 pt-7.5 shadow-1 dark:shadow-card xl:col-span-7">
      {/* HEADER + FILTERS */}
      <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
          {header} {matched?.Full_Name}
        </h4>
        <div className="relative flex flex-col gap-2.5 sm:flex-row sm:items-center w-full sm:w-auto">
          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Filter by:
          </p>
          <DefaultSelectOption
            options={["Week", "Month"]}
            onChange={(v: any) => setFilter(v as "Week" | "Month")}
            defaultValue={filter}
          />
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search city..."
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {showSuggest && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bg-white dark:bg-gray-dark border dark:border-dark-3 mt-1 max-h-40 w-full overflow-auto rounded-md shadow-lg z-30 text-black dark:text-white">
                {suggestions.map((c) => (
                  <li
                    key={c.Name}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-dark-2 cursor-pointer"
                    onClick={() => {
                      changeCity(c.Full_Name);
                      setSearch(c.Full_Name);
                    }}
                  >
                    {c.Full_Name}
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

      {/* CHART */}
      <div>
        {errorMsg ? (
          <div className="text-red-600 font-medium">{errorMsg}</div>
        ) : isSearching ? (
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
        ) : payload && payload.length ? (
          <ReactApexChart
            options={options as ApexCharts.ApexOptions}
            series={series}
            type="area"
            height={310}
          />
        ) : (
          <div className="mt-4 text-center text-gray-500">
            No payload data available.
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && selectedDay && (
        <PayloadDayModal
          date={selectedDay}
          onClose={() => {
            setModal(false);
            setDay(null);
          }}
          city={matched?.Name ?? "all"}
        />
      )}
    </div>
  );
};

export default ChartFour;
