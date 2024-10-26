import axios from "axios";
import { ModemDetails } from "@/types/ModemDetails";
import qs from "qs";

import { ExportItemType, ExportData } from "@/types/exports";
export const fetchModemDetails = async (
  id: string,
  token: string
): Promise<ModemDetails> => {
  const data = qs.stringify({
    FTTH_ID: id,
  });

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/ModemDetails`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.error("Error fetching modem details:", error);
    throw new Error("Failed to fetch modem details");
  }
};

export const performHardRefresh = async (modemId: string) => {
  /*  const response = await fetch(
    `https://your-api.com/refresh-modem/${modemId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to refresh modem data");
  }
 */
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return true;
};

export const fetchFTTHDashboard = async (token: string) => {
  const config = {
    method: "get",
    url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboard`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error fetching FTTH dashboard data:", error);
    throw new Error("Failed to fetch FTTH dashboard data");
  }
};

export const fetchFTTHDailyChartData = async (token: string) => {
  try {
    const data = JSON.stringify({
      start: 0,
      end: 30,
    });

    const config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/GetFTTHDashboardUTDailyChart`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch daily chart data:", error);
    throw error;
  }
};

export const fetchFTTHDynamicExportList = async (
  token: string
): Promise<ExportData> => {
  const config = {
    method: "get",
    url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDynamicExportList`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.request(config);
    const exportsData: ExportItemType[] = response.data;

    const categories: ExportData = exportsData.reduce<ExportData>(
      (acc, exp) => {
        if (!acc[exp.category]) {
          acc[exp.category] = [];
        }
        acc[exp.category].push(exp);
        return acc;
      },
      {}
    );

    return categories;
  } catch (error) {
    console.error("Error fetching FTTH export list data:", error);
    throw new Error("Failed to fetch FTTH export list data");
  }
};
