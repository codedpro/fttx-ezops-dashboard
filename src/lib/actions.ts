import axios from "axios";
import { ModemDetails, ModemPacketDetails } from "@/types/ModemDetails";
import qs from "qs";
import { ExportItemType, ExportData } from "@/types/exports";
import { FTTHACS } from "@/types/FTTHACS";
import { TableData } from "@/types/SalesDetails";

interface FTTHPayload {
  Date: string;
  Value: number;
}

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
    url: `${process.env.FTTXBACKEND}/ModemDetails`,
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

export const fetchModemPacketRemaining = async (
  id: string,
  token: string
): Promise<ModemPacketDetails[] | null> => {
  const data = JSON.stringify({
    FTTH_ID: id,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${process.env.FTTXBACKEND}/getftthuserremainingtraffic`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data
   // return response.data;
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

export const fetchFTTHPayload = async (
  token: string,
  city: string = "all"
): Promise<FTTHPayload[]> => {
  const data = JSON.stringify({
    "StartDay": 1,
    "EndDay": 30,
    "City": "All"
  });
  

  const config = {
    method: "post",
    url: `${process.env.FTTXBACKEND}/FTTHGetPayloadPerDayV2`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  try {
    const response = await axios.request<FTTHPayload[]>({ ...config });
    if (response.data?.length === 0 && city !== "all") {
      console.warn(`No data found for city "${city}". Falling back to "all".`);
      return await fetchFTTHPayload(token, "all");
    }
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching FTTH dashboard data:", error);
    throw new Error("Failed to fetch FTTH dashboard data");
  }
};

export const fetchFTTHDashboard = async (token: string) => {
  const config = {
    method: "get",
    url: `${process.env.FTTXBACKEND}/FTTHDashboard`,
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
      url: `${process.env.FTTXBACKEND}/GetFTTHDashboardUTDailyChart`,
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
    url: `${process.env.FTTXBACKEND}/FTTHDynamicExportList`,
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

export const fetchFTTHACS = async (token: string): Promise<FTTHACS[]> => {
  const config = {
    method: "get",
    url: `${process.env.FTTXBACKEND}/FTTHACS`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.request(config);

    return response.data as FTTHACS[];
  } catch (error) {
    throw new Error("Failed to fetch FTTH ACS data");
  }
};

export const fetchFTTHSalesDetails = async (
  token: string
): Promise<TableData[]> => {
  const config = {
    method: "get",
    url: `${process.env.FTTXBACKEND}/GetFTTHDashboardSalesDetails`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.request(config);
    return response.data as TableData[];
  } catch (error) {
    throw new Error("Failed to fetch FTTH ACS data");
  }
};

export const fetchFTTHGetPayloadUseDaily = async (
  token: string,
  date: string
) => {
  const config = {
    method: "post",
    url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHGetPayloadUseDaily`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: date,
  };

  try {
    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.error("Error fetching FTTH dashboard data:", error);
    throw new Error("Failed to fetch FTTH dashboard data");
  }
};
