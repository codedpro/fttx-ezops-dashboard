"use client";

import React, { useState, useEffect } from "react";
import FTTXProgressCards from "./FTTXProgressCards";
import Excavation from "./Excavation";
import ProgressTable from "./ProgressTable";
import WeeklyProgressChart from "./WeeklyProgressChart";
import Cookies from "js-cookie";
interface ProgressSlice {
  [key: string]: {
    Inhouse: string;
    FTK: string;
    ServCo: string;
    FCP: string;
  };
}

interface FiberShootOrExcavationEntity {
  TotalDistance: string;
  Irancell: {
    Plan: number;
    Actual: number;
    Weekly: number;
    WeeklyData: Record<string, number>;
  };
  FCP: {
    Plan: number;
    Actual: number;
    Weekly: number;
    WeeklyData: Record<string, number>;
  };
}

interface FATInstallationEntity {
  TotalCount: number;
  Irancell: {
    Plan: number;
    Actual: number;
    Weekly: number;
  };
  FCP: {
    Plan: number;
    Actual: number;
    Weekly: number;
  };
}

interface DeploymentEntity {
  Cities: number;
  Households: number;
  Percentage: string;
  AdditionalCities?: number;
}

interface ApiResponse {
  Progress: ProgressSlice;
  FiberShoot: FiberShootOrExcavationEntity;
  FATInstallation: FATInstallationEntity;
  Excavation: FiberShootOrExcavationEntity;
  Deployment: Record<string, DeploymentEntity>;
}

interface FTTXProgressProps {
  region: string;
  /** Optional override for the `as_of` query param (YYYY-MM-DD). */
  asOf?: string;
}

const FTTXProgress: React.FC<FTTXProgressProps> = ({ region, asOf }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    setError(null);

    const fetchData = async () => { 
      try {
        const baseUrl = process.env.NEXT_PUBLIC_LNM_API_URL;
        const dateParam = "2025-04-21" ?? new Date().toISOString().slice(0, 10);
        const res = await fetch(
          `${baseUrl}/IranMapDashboardSummary`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${Cookies.get("AccessToken") ?? ""}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json: ApiResponse = await res.json();
        console.log(json)
        setData(json);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asOf]);

  if (loading) {
    return <div className="text-center py-8">Loading FTTX progress…</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading data: {error}
      </div>
    );
  }

  if (!data) {
    return null; // or some placeholder
  }

  return (
    <div>
      <h2 className="text-4xl mb-8 text-center font-bold text-gray-800 dark:text-gray-100">
        FTTX Progress of {region}
      </h2>

      {/* Summary Cards for FiberShoot, FATInstallation & Excavation */}
      <FTTXProgressCards data={data} />

      <div className="grid grid-cols-12 gap-4">
        {/* Excavation details */}
        <div className="col-span-12">
          <Excavation  data={data} />
        </div>

        {/* Weekly line chart (you can adjust props as your chart expects) */}
        <div className="col-span-12 mt-4">
          <WeeklyProgressChart
            fiberShoot={data.FiberShoot}
            excavation={data.Excavation}
          />
        </div>

        {/* Tabular breakdown */}
        <div className="col-span-12 mt-4">
          <ProgressTable data={data.Progress} />
        </div>
      </div>
    </div>
  );
};

export default FTTXProgress;
