// Lightweight mock data generators matching project TypeScript types
import { FTTHCity } from "@/types/FTTHCities";
import { FTTHModem } from "@/types/FTTHModem";
import { FTTHFatComponent } from "@/types/FTTHComponentFat";
import { FTTHOtherComponent } from "@/types/FTTHOtherComponent";
import { FTTHPoint } from "@/types/FTTHPoint";
import { FTTHACS } from "@/types/FTTHACS";
import { TableData } from "@/types/SalesDetails";
import { ExportItemType } from "@/types/exports";
import { ModemDetails, ModemPacketDetails } from "@/types/ModemDetails";
import { NearybyFATs } from "@/types/NearbyFATs";
import { FTTHBlock } from "@/types/FTTHBlock";
import { FATData } from "@/types/FTTHAutoPlanFATs";
import { FTTHPreorder } from "@/types/FTTHPreorder";
import { SuggestedFAT } from "@/types/SuggestedFAT";

// Utilities
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, digits = 2) => {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(digits));
};

export const NL_BASE_LAT = 52.1326;
export const NL_BASE_LONG = 5.2913;

export const DUMMY_TOKEN = "dummy-token-123";
export const DUMMY_USER = {
  Name: "test test",
  Email: "test@example.com",
  Username: "test",
  Role: ["user"],
};

// Netherlands macro-regions and their provinces (for map grouping)
export const NL_REGIONS: Record<string, { provinces: string[] }> = {
  "Noord-Nederland": { provinces: ["Groningen", "Friesland", "Drenthe"] },
  "Oost-Nederland": { provinces: ["Overijssel", "Gelderland"] },
  "Midden-Nederland": { provinces: ["Flevoland", "Utrecht"] },
  "Randstad-Noord": { provinces: ["Noord-Holland"] },
  "Randstad-Zuid": { provinces: ["Zuid-Holland", "Zeeland"] },
  "Zuid-Nederland": { provinces: ["Noord-Brabant", "Limburg"] },
};

export function mockNLRegions() {
  return Object.entries(NL_REGIONS).map(([name, cfg]) => ({ name, provinces: cfg.provinces }));
}

// Dashboard style payload per day (ChartFour expects expanded shape)
export function mockFTTHPayload(days = 30) {
  // Simulate a large NL ISP: daily traffic in hundreds of TB.
  // Values are in GB so 300_000 = 300 TB.
  const today = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));

    // Weekday/weekend profile: weekends see ~10% more video streaming.
    const isWeekend = [0, 6].includes(d.getDay());
    // Daily totals in GB: 8–14 PB on weekdays, 9–16 PB on weekends.
    // 1 PB = 1,000,000 GB (approx in chart’s 1000-based units)
    const baseGB = isWeekend ? rand(9_000_000, 16_000_000) : rand(8_000_000, 14_000_000);
    const charged = baseGB; // GB/day
    const actual = Math.max(0, charged - rand(100_000, 500_000)); // GB/day slightly lower than charged

    // Peak throughput (GB/s in chart helper semantics: we keep it as GB to be unit-converted client-side)
    // Peak downlink in the evening; uplink lower than downlink.
    // Peak throughput in Gbps (downlink >> uplink)
    const peakDownGbps = rand(1_200, 3_500); // 1.2–3.5 Tbps peak downlink
    const peakUpGbps = rand(150, 450); // 0.15–0.45 Tbps peak uplink

    return {
      Date: d.toISOString().slice(0, 10),
      Value: charged,
      Value2: actual,
      ValueUp: peakUpGbps,
      ValueDown: peakDownGbps,
    };
  });
}

export function mockIBSNGOnlineCount(rows = 144) {
  // 10-minute granularity for one day by default (144 points).
  // Model a diurnal curve around a large installed base.
  const now = Date.now();
  const points = Array.from({ length: rows }).map((_, i) => {
    const ts = new Date(now - (rows - 1 - i) * 10 * 60 * 1000);
    const hour = ts.getHours() + ts.getMinutes() / 60;

    // Base installed active PPPoE sessions: ~0.9M by night, ~1.4M evening peak.
    // Smooth with a cosine curve that peaks ~21:00.
    const peakHour = 21;
    const phase = Math.cos(((hour - peakHour) / 12) * Math.PI);
    const base = 1_150_000 + (1 - phase) * 140_000; // ~1.01M to ~1.29M baseline swing

    // Add small noise (±0.6%) so adjacent points don’t jump wildly.
    const noise = 1 + (Math.random() - 0.5) * 0.012;
    const count = Math.round(base * noise);

    return {
      datetime: ts.toISOString(),
      count,
    };
  });
  return points;
}

export function mockFTTHDashboard() {
  // Model a large NL FTTx operator scale with consistent ratios.
  const online = rand(1_000_000, 1_400_000); // Active online sessions
  const offline = Math.round(online * randFloat(0.03, 0.08, 3)); // 3–8% offline

  const delivered = rand(1_200_000, 1_900_000);
  const notDelivered = rand(60_000, 220_000);

  // Monthly package volume in MB (to match convertValuesToHighUnit's MB base).
  // 9–20 billion MB ≈ 8.4–18.6 PB sold; consumed slightly less.
  const totalSold = rand(9_000_000_000, 20_000_000_000);
  const totalConsumed = rand(
    Math.floor(totalSold * 0.75),
    Math.floor(totalSold * 0.98)
  );

  const uTClosed = rand(6_000, 18_000);
  const uTOpen = rand(500, 3_000);

  const preorderNotPaid = rand(5_000, 20_000);
  const preorderPaid = rand(4_000, 18_000);
  const purchaseNotDelivered = rand(2_000, 10_000);
  const rejected = rand(500, 3_000);
  const canceled = rand(300, 2_000);
  const confirmedWaiting = rand(2_000, 8_000);

  return [
    {
      online_Count: online,
      offline_Count: offline,
      modem_Delivered: delivered,
      modem_Not_Delivered: notDelivered,
      total_Sold: totalSold,
      total_Consumed: totalConsumed,
      uT_Closed: uTClosed,
      uT_Open: uTOpen,
      preorder_Notpaid: preorderNotPaid,
      preorder_Paid: preorderPaid,
      purchase_But_Not_Delivered: purchaseNotDelivered,
      rejected,
      canceled,
      confirmed_Waiting_For_Purchase: confirmedWaiting,
    },
  ];
}

export function mockUTDailyChart(days = 30) {
  const today = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const created = rand(50, 150);
    const closed = rand(30, created);
    return {
      Date: d.toISOString().slice(0, 10),
      Total_Created: created,
      Closed_or_Resolved: closed,
    };
  });
}

export function mockFTTHACS(count = 500): FTTHACS[] {
  return Array.from({ length: count }).map((_, i) => ({
    ACS_ID: `ACS_${10000 + i}`,
    Modem_ID: 800000 + i,
    cpePppUsername: `user${i}@isp`,
    modelName: ["ZXHN F660", "HG8145V5", "HG8245H"][i % 3],
    manufacturer: ["ZTE", "Huawei", "FiberHome"][i % 3],
    serialNumber: `SN${100000 + i}`,
    root_cwmp_GPON: ["ZTE", "Huawei"][i % 2],
    pppVlan: 103,
    mac: `AA:BB:CC:${(i % 99).toString().padStart(2, "0")}:DD:EE`,
    upTime: rand(1000, 1000000),
    activationDate: new Date(Date.now() - rand(1, 365) * 86400000).toISOString(),
    remappingEnabled: true,
    cpeLastConnectionError: "",
    PPPoEUpTime: rand(1000, 1000000),
    blacklisted: false,
    provisioningEnabled: true,
    lastSessionTime: new Date(Date.now() - rand(0, 5) * 86400000).toISOString(),
    lastEmptySessionTime: null,
    lastBootstrapTime: new Date(Date.now() - rand(0, 15) * 86400000).toISOString(),
    lastRebootTime: new Date(Date.now() - rand(1, 30) * 86400000).toISOString(),
    creationTime: new Date(Date.now() - rand(100, 1000) * 86400000).toISOString(),
    ipAddress: `10.0.${i % 255}.${(i * 7) % 255}`,
    hardwareVersion: "v1",
    softwareVersion: "1.0.0",
    productClass: "ONT",
    TXPower: randFloat(1, 5, 2),
    TransceiverTemperature: randFloat(30, 70, 1),
    RXPower: randFloat(-30, -5, 1),
    Vgroup: null,
  }));
}

export function mockFTTHSalesDetails(): TableData[] {
  const cities = mockFTTHCities().filter((c) => c.Name !== "all").slice(0, 8).map((c) => c.Name);
  return cities.map((c) => ({
    City: c,
    Request: rand(100, 500),
    Confirmed: {
      "Main Value": rand(50, 300),
      "Paid & installation": rand(20, 150),
      "Paid (Pending)": rand(5, 50),
      Unpaid: rand(10, 100),
    },
    "Install / Confirmed": randFloat(0.2, 1.0, 2),
    "Install / Request": randFloat(0.1, 0.8, 2),
    Pending: rand(10, 60),
    "Cancelled (customer's request)": rand(0, 20),
    Rejected: rand(0, 30),
  }));
}

export function mockExportList(): ExportItemType[] {
  return [
    {
      id: 1,
      name: "Modem Status",
      category: "Dashboard",
      isCity: false,
      isNumberParameter: false,
      isPlanStatus: false,
      numberParameters: null,
      planStatus: null,
      cities: null,
      persian_Name: "وضعیت مودم",
    },
    {
      id: 2,
      name: "Preorders",
      category: "Dashboard",
      isCity: true,
      isNumberParameter: false,
      isPlanStatus: true,
      numberParameters: null,
      planStatus: ["Pending", "Confirmed", "Rejected"],
      cities: ["Amsterdam", "Rotterdam", "Utrecht"],
      persian_Name: "پیش سفارش ها",
    },
  ];
}

export function mockFTTHCities(): FTTHCity[] {
  const cities: Array<Omit<FTTHCity, "ID" | "Farsi"> & { Farsi?: string }> = [
    { Name: "all", Full_Name: "All", Lat: NL_BASE_LAT, Long: NL_BASE_LONG },
    { Name: "Amsterdam", Full_Name: "Amsterdam", Lat: 52.3676, Long: 4.9041, Farsi: "آمستردام" },
    { Name: "Rotterdam", Full_Name: "Rotterdam", Lat: 51.9244, Long: 4.4777, Farsi: "روتردام" },
    { Name: "The Hague", Full_Name: "The Hague", Lat: 52.0705, Long: 4.3007 },
    { Name: "Utrecht", Full_Name: "Utrecht", Lat: 52.0907, Long: 5.1214, Farsi: "اوترخت" },
    { Name: "Eindhoven", Full_Name: "Eindhoven", Lat: 51.4416, Long: 5.4697 },
    { Name: "Tilburg", Full_Name: "Tilburg", Lat: 51.5555, Long: 5.0913 },
    { Name: "Groningen", Full_Name: "Groningen", Lat: 53.2194, Long: 6.5665 },
    { Name: "Almere", Full_Name: "Almere", Lat: 52.3508, Long: 5.2647 },
    { Name: "Breda", Full_Name: "Breda", Lat: 51.5719, Long: 4.7683 },
    { Name: "Nijmegen", Full_Name: "Nijmegen", Lat: 51.8126, Long: 5.8372 },
    { Name: "Haarlem", Full_Name: "Haarlem", Lat: 52.3874, Long: 4.6462 },
    { Name: "Arnhem", Full_Name: "Arnhem", Lat: 51.9851, Long: 5.8987 },
    { Name: "Maastricht", Full_Name: "Maastricht", Lat: 50.8514, Long: 5.6900 },
    { Name: "Leiden", Full_Name: "Leiden", Lat: 52.1601, Long: 4.4970 },
    { Name: "Dordrecht", Full_Name: "Dordrecht", Lat: 51.8133, Long: 4.6901 },
    { Name: "Zoetermeer", Full_Name: "Zoetermeer", Lat: 52.0607, Long: 4.4940 },
    { Name: "Enschede", Full_Name: "Enschede", Lat: 52.2215, Long: 6.8937 },
    { Name: "Apeldoorn", Full_Name: "Apeldoorn", Lat: 52.2112, Long: 5.9699 },
    { Name: "Zwolle", Full_Name: "Zwolle", Lat: 52.5168, Long: 6.0830 },
    { Name: "Amersfoort", Full_Name: "Amersfoort", Lat: 52.1561, Long: 5.3878 },
  ];

  return cities.map((c, idx) => ({
    ID: idx + 1,
    Name: c.Name,
    Full_Name: c.Full_Name,
    Lat: c.Lat,
    Long: c.Long,
    Farsi: c.Farsi || c.Full_Name,
  }));
}

export function mockFTTHModems(count = 200): FTTHModem[] {
  const cities = mockFTTHCities().filter((c) => c.Name !== "all");
  const jitter = () => randFloat(-0.05, 0.05, 6);
  return Array.from({ length: count }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      Modem_ID: 8411000 + i,
      Lat: city.Lat + jitter(),
      Long: city.Long + jitter(),
      OLT: `OLT${rand(1000, 9999)}`,
      POP: `POP${rand(1, 9)}`,
      FAT: `FAT${rand(1, 999)}`,
      Symbol: ["Online", "Offline"][i % 2],
      MAC: `AA:BB:CC:${(i % 99).toString().padStart(2, "0")}:DD:EE`,
      IP: `10.0.${i % 255}.${(i * 7) % 255}`,
      Error: "",
      Online_Status: i % 3 === 0 ? "Offline" : "Online",
    };
  });
}

export function mockFTTHComponentsFat(count = 100): FTTHFatComponent[] {
  const cities = mockFTTHCities().filter((c) => c.Name !== "all");
  const jitter = () => randFloat(-0.05, 0.05, 6);
  return Array.from({ length: count }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      FAT_ID: 1000 + i,
      Name: `FAT_${1000 + i}`,
      Lat: city.Lat + jitter(),
      Long: city.Long + jitter(),
      OLT: `OLT${rand(1000, 9999)}`,
      POP: `POP${rand(1, 9)}`,
      FAT: `FAT${1000 + i}`,
      City: city.Name,
      Is_Plan: false,
      Chain_ID: 50000 + i,
      Type: i % 2 === 0 ? "MFAT" : "SFAT",
      Plan_Type: 0,
    };
  });
}

export function mockFTTHComponentsOther(count = 40): FTTHOtherComponent[] {
  const types = ["OLT", "ODC", "CP", "TC"];
  const cities = mockFTTHCities().filter((c) => c.Name !== "all");
  const jitter = () => randFloat(-0.05, 0.05, 6);
  return Array.from({ length: count }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      Component_ID: 2000 + i,
      Name: `${types[i % types.length]}_${2000 + i}`,
      Lat: city.Lat + jitter(),
      Long: city.Long + jitter(),
      City: city.Name,
      Chain_ID: 60000 + i,
      Type: types[i % types.length],
      Is_Plan: false,
      Plan_Type: 0,
    };
  });
}

export function mockFTTHPoints(count = 200): FTTHPoint[] {
  const cities = mockFTTHCities().filter((c) => c.Name !== "all");
  const jitter = () => randFloat(-0.03, 0.03, 6);
  return Array.from({ length: count }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      Point_ID: 70000 + i,
      Lat: city.Lat + jitter(),
      Long: city.Long + jitter(),
      Type: ["ODCLine", "FATLine", "DropCableLine"][i % 3],
      Chain_ID: 80000 + Math.floor(i / 5),
      Order: i % 10,
      City: city.Name,
      Is_Plan: false,
      Plan_Type: 0,
    };
  });
}

export function mockModemDetails(id: string): ModemDetails {
  const FTTH_ID = parseInt(id, 10) || 8411000;
  return {
    IBSNG_Main: [
      {
        FTTH_ID,
        User_ID: `user_${FTTH_ID}`,
        Parent_User_Id: `parent_${FTTH_ID}`,
        Creation_Date: new Date().toISOString(),
        Expiration_Status: "Active",
        Online_Status: "Online",
        Owner_IS: "ISP",
        Customer: "Test Customer",
        Group: "Default",
        User_is_Locked: "No",
        Charge: "100GB",
        Package_First_Login: new Date().toISOString(),
        Real_First_Login: new Date().toISOString(),
        Last_Successful_Login: new Date().toISOString(),
        DB_Last_Update: new Date().toISOString(),
      },
    ],
    IBSNG_Internet_Onlines: Array.from({ length: 3 }).map((_, i) => ({
      FTTH_ID,
      Sub_Service: "Internet",
      QOS: ["Basic", "Standard", "Premium"][i % 3],
      Login_Time: new Date(Date.now() - i * 3600_000).toISOString(),
      Ras_Desc: `RAS-${i + 1}`,
      Remote_IP: `10.0.0.${10 + i}`,
      MAC: `AA:BB:CC:DD:EE:${(10 + i).toString(16).padStart(2, "0")}`,
      Port: String(1 + i),
      In_Bytes: rand(1e6, 1e9),
      Out_Bytes: rand(1e6, 1e9),
      In_Rate: rand(1e3, 1e6),
      Out_Rate: rand(1e3, 1e6),
      Session_ID: `sess_${FTTH_ID}_${i}`,
      Rule: "default",
      Failed_Reason: "",
      Apn: "internet",
      SSID: "FTTH-SSID",
    })),
    IBSNG_Connection_History: Array.from({ length: 10 }).map((_, i) => ({
      ID: i + 1,
      FTTH_ID,
      User_ID: `user_${FTTH_ID}`,
      Session_Start: new Date(Date.now() - (i + 1) * 86400_000).toISOString(),
      Session_End: new Date(Date.now() - i * 86400_000).toISOString(),
      Kill_Reason: "",
      Terminate_Cause: ["User-Request", "Lost-Carrier", "Idle-Timeout"][i % 3],
      MAC: `AA:BB:CC:DD:EE:${(20 + i).toString(16).padStart(2, "0")}`,
      Port: String(1 + (i % 4)),
      IPv4: `10.0.${i % 255}.${(i * 7) % 255}`,
      IPv6: "::1",
      RAS: `RAS-${(i % 3) + 1}`,
    })),
    IBSNG_Ballances: [
      {
        ID: FTTH_ID,
        FTTH_ID,
        Balance_Name: "Main",
        Package_Name: "Standard",
        Priority: "High",
        Initial_Value: "100GB",
        Value: "40GB",
        First_Use_Time: new Date().toISOString(),
        First_Use_Exp_Time: new Date().toISOString(),
        Exp_Time: new Date().toISOString(),
        QOS: "Premium",
        Committed_Value: "",
        Unused_Value: "60GB",
        Start_Time: new Date().toISOString(),
      },
    ],
    ACS_Main: [
      {
        ACS_ID: `ACS_${FTTH_ID}`,
        modelName: "HG8245H",
        serialNumber: `SN${FTTH_ID}`,
        manufacturer: "Huawei",
        pppVlan: 103,
        mac: "AA:BB:CC:DD:EE:FF",
        activationDate: new Date().toISOString(),
        blacklisted: "false",
        lastSessionTime: new Date().toISOString(),
        lastEmptySessionTime: new Date().toISOString(),
        lastBootstrapTime: new Date().toISOString(),
        lastRebootTime: new Date().toISOString(),
        ipAddress: "10.0.0.10",
        hardwareVersion: "v1",
        softwareVersion: "1.0.0",
        productClass: "ONT",
        TXPower: 3.2,
        TransceiverTemperature: 45.1,
        RXPower: -17.2,
        Vgroup: "A",
      },
    ],
  };
}

export function mockModemPacketRemaining(): ModemPacketDetails[] {
  return [
    { Total: 100, Remained: 40, Used: 60 },
  ];
}

export function mockNearbyFATs(): NearybyFATs[] {
  return [
    { FAT_ID: 501, Name: "FAT_501", FAT_Lat: NL_BASE_LAT + 0.01, FAT_Long: NL_BASE_LONG + 0.01 },
    { FAT_ID: 502, Name: "FAT_502", FAT_Lat: NL_BASE_LAT + 0.02, FAT_Long: NL_BASE_LONG + 0.02 },
    { FAT_ID: 503, Name: "FAT_503", FAT_Lat: NL_BASE_LAT + 0.03, FAT_Long: NL_BASE_LONG + 0.03 },
  ];
}

export function mockNominatimSearch() {
  return [
    {
      place_id: 1,
      licence: "Data © OpenStreetMap contributors",
      osm_type: "node",
      osm_id: 1,
      boundingbox: ["52.36", "52.38", "4.89", "4.91"],
      lat: "52.3676",
      lon: "4.9041",
      display_name: "Amsterdam, Netherlands",
      class: "place",
      type: "city",
      importance: 0.8,
      icon: "",
    },
  ];
}

export function mockFTTHACSRXPower(count = 100) {
  const cities = mockFTTHCities().filter((c) => c.Name !== "all");
  const jitter = () => randFloat(-0.05, 0.05, 6);
  return Array.from({ length: count }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      Modem_ID: 841100 + i,
      RXPower: randFloat(-30, -5, 1),
      Lat: city.Lat + jitter(),
      Long: city.Long + jitter(),
    };
  });
}

export function mockExportRowsDefault(rows = 20) {
  return Array.from({ length: rows }).map((_, i) => ({
    Row: i + 1,
    Name: `Item ${i + 1}`,
    City: mockFTTHCities().filter((c) => c.Name !== "all").map((c) => c.Name)[i % 6],
    Status: ["Pending", "Confirmed", "Rejected"][i % 3],
    Value: rand(1, 1000),
  }));
}

export function mockFTTHBlocks(count = 120): FTTHBlock[] {
  const cities = mockFTTHCities().filter((c) => c.Name !== "all").slice(0, 6);
  const jitter = () => randFloat(-0.04, 0.04, 6);
  return Array.from({ length: count }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      ID: 1000 + i,
      Name: `BLK_${1000 + i}`,
      Block_ID: 5000 + i,
      Adres1395: `Address ${i}`,
      Hoze1395: rand(1, 10),
      BLK_No1395: rand(1, 9999),
      Value: rand(1, 100),
      "95HH": rand(10, 500),
      Area: rand(2000, 10000),
      length: rand(100, 1000),
      Lat: city.Lat + jitter(),
      Long: city.Long + jitter(),
      Chain_ID: 80000 + i,
      Order: i % 10,
      City: city.Name,
    };
  });
}

export function mockFTTHTabrizFATs(count = 100): FATData[] {
  return Array.from({ length: count }).map((_, i) => ({
    FAT_Index: `FAT_${i + 1}`,
    Lat: NL_BASE_LAT + randFloat(-0.05, 0.05, 6),
    Long: NL_BASE_LONG + randFloat(-0.05, 0.05, 6),
    Modem_Count: rand(0, 64),
    Max_Distance_Covered_m: rand(100, 800),
  }));
}

export function mockFTTHPreorders(count = 2000): FTTHPreorder[] {
  const cities = mockFTTHCities().filter((c) => c.Name !== "all").slice(0, 10);
  const provinces = ["North Holland", "South Holland", "Utrecht"];
  const jitter = () => randFloat(-0.05, 0.05, 6);
  return Array.from({ length: count }).map((_, i) => {
    const city = cities[i % cities.length];
    return {
      ID: 9000 + i,
      Eshop_ID: 50000 + i,
      Postal_Code: `10${rand(100000, 999999)}`,
      Province: provinces[i % provinces.length],
      City: city.Name,
      Tracking_Code: `TRK${100000 + i}`,
      Lat: city.Lat + jitter(),
      Long: city.Long + jitter(),
      Created_Date: new Date(Date.now() - (i * 86400000) / 4).toISOString(),
      FTTH_ID: i % 5 === 0 ? 8411000 + i : null,
      Product_Name: ["FTTH 100M", "FTTH 50M", "FTTH 20M"][i % 3],
      FAT_ID: i % 7 === 0 ? 1000 + i : null,
    };
  });
}

export function mockSuggestedFAT(count = 80): SuggestedFAT[] {
  return Array.from({ length: count }).map((_, i) => ({
    Name: `SFAT_${100 + i}`,
    Lat: NL_BASE_LAT + randFloat(-0.3, 0.3, 6),
    Long: NL_BASE_LONG + randFloat(-0.3, 0.3, 6),
    Count: rand(10, 150),
    ID: 100 + i,
  }));
}
