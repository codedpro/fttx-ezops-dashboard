import { ModemDetails, ModemPacketDetails } from "@/types/ModemDetails";
import { ExportItemType, ExportData } from "@/types/exports";
import { FTTHACS } from "@/types/FTTHACS";
import { TableData } from "@/types/SalesDetails";
import {
  mockFTTHPayload,
  mockFTTHDashboard,
  mockUTDailyChart,
  mockExportList,
  mockFTTHACS,
  mockFTTHSalesDetails,
  mockModemDetails,
  mockModemPacketRemaining,
} from "@/lib/mocks/data";

interface FTTHPayload {
  Date: string;
  Value: number;
}

export const fetchModemDetails = async (
  id: string,
  token: string
): Promise<ModemDetails> => {
  return mockModemDetails(id);
};

export const fetchModemPacketRemaining = async (
  id: string,
  token: string
): Promise<ModemPacketDetails[] | null> => {
  return mockModemPacketRemaining();
};

export const performHardRefresh = async (modemId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return true;
};

export const fetchFTTHPayload = async (
  token: string,
  city: string = "all"
): Promise<FTTHPayload[]> => {
  return mockFTTHPayload();
};

export const fetchFTTHDashboard = async (token: string) => {
  return mockFTTHDashboard();
};

export const fetchFTTHDailyChartData = async (token: string) => {
  return mockUTDailyChart();
};

export const fetchFTTHDynamicExportList = async (
  token: string
): Promise<ExportData> => {
  const exportsData: ExportItemType[] = mockExportList();
  return exportsData.reduce<ExportData>((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = [];
    }
    acc[exp.category].push(exp);
    return acc;
  }, {});
};

export const fetchFTTHACS = async (token: string): Promise<FTTHACS[]> => {
  // Use a larger sample for more stable manufacturer/model/RX distributions
  return mockFTTHACS(3000);
};

export const fetchFTTHSalesDetails = async (
  token: string
): Promise<TableData[]> => {
  return mockFTTHSalesDetails();
};

export const fetchFTTHGetPayloadUseDaily = async (
  token: string,
  date: string
) => {
  return [
    { City: "Amsterdam", Usage: 1200, ftth_id: 8411001, modem_id: "MDM_8411001" },
    { City: "Rotterdam", Usage: 950, ftth_id: 8411002, modem_id: "MDM_8411002" },
  ];
};
