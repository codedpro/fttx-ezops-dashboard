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

// Netherlands bounding box for generating realistic mock coordinates
const NL_LAT_MIN = 50.75;
const NL_LAT_MAX = 53.7;
const NL_LON_MIN = 3.2;
const NL_LON_MAX = 7.3;

const randNLLat = () => randFloat(NL_LAT_MIN, NL_LAT_MAX, 6);
const randNLLon = () => randFloat(NL_LON_MIN, NL_LON_MAX, 6);

export const DUMMY_TOKEN = "dummy-token-123";
export const DUMMY_USER = {
  Name: "test test",
  Email: "test@example.com",
  Username: "test",
  Role: ["user"],
};

// Dashboard style payload per day (ChartFour expects expanded shape)
export function mockFTTHPayload(days = 30) {
  const today = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    // Coarse but realistic magnitudes
    const charged = rand(20_000, 40_000);
    const actual = charged - rand(0, 2000);
    const up = rand(100, 500);
    const down = rand(1000, 5000);
    return {
      Date: d.toISOString().slice(0, 10),
      Value: charged, // Charged Traffic
      Value2: actual, // Actual Traffic
      ValueUp: up, // Uplink peak
      ValueDown: down, // Downlink peak
    };
  });
}

export function mockIBSNGOnlineCount(rows = 100) {
  const now = Date.now();
  return Array.from({ length: rows }).map((_, i) => ({
    datetime: new Date(now - (rows - 1 - i) * 10 * 60 * 1000).toISOString(),
    count: rand(500, 2500),
  }));
}

export function mockFTTHDashboard() {
  return [
    {
      online_Count: rand(5000, 8000),
      offline_Count: rand(200, 600),
      modem_Delivered: rand(3000, 4000),
      modem_Not_Delivered: rand(1000, 2000),
      total_Sold: rand(10000, 20000),
      total_Consumed: rand(7000, 15000),
      uT_Closed: rand(1000, 2000),
      uT_Open: rand(100, 400),
      preorder_Notpaid: rand(100, 400),
      preorder_Paid: rand(100, 500),
      purchase_But_Not_Delivered: rand(100, 300),
      rejected: rand(20, 100),
      canceled: rand(10, 50),
      confirmed_Waiting_For_Purchase: rand(50, 200),
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
  const cities = ["Tehran", "Shiraz", "Tabriz", "Mashhad"];
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
      cities: ["Tehran", "Shiraz", "Tabriz"],
      persian_Name: "پیش سفارش ها",
    },
  ];
}

export function mockFTTHCities(): FTTHCity[] {
  return [
    { ID: 1, Name: "all", Full_Name: "All", Lat: 52.1326, Long: 5.2913, Farsi: "همه" },
    { ID: 2, Name: "Amsterdam", Full_Name: "Amsterdam", Lat: 52.3676, Long: 4.9041, Farsi: "آمستردام" },
    { ID: 3, Name: "Rotterdam", Full_Name: "Rotterdam", Lat: 51.9244, Long: 4.4777, Farsi: "روتردام" },
    { ID: 4, Name: "Utrecht", Full_Name: "Utrecht", Lat: 52.0907, Long: 5.1214, Farsi: "اوترخت" },
  ];
}

export function mockFTTHModems(count = 200): FTTHModem[] {
  return Array.from({ length: count }).map((_, i) => ({
    Modem_ID: 8411000 + i,
    Lat: randNLLat(),
    Long: randNLLon(),
    OLT: `OLT${rand(1000, 9999)}`,
    POP: `POP${rand(1, 9)}`,
    FAT: `FAT${rand(1, 999)}`,
    Symbol: ["Online", "Offline"][i % 2],
    MAC: `AA:BB:CC:${(i % 99).toString().padStart(2, "0")}:DD:EE`,
    IP: `10.0.${i % 255}.${(i * 7) % 255}`,
    Error: "",
    Online_Status: i % 3 === 0 ? "Offline" : "Online",
  }));
}

export function mockFTTHComponentsFat(count = 100): FTTHFatComponent[] {
  return Array.from({ length: count }).map((_, i) => ({
    FAT_ID: 1000 + i,
    Name: `FAT_${1000 + i}`,
    Lat: randNLLat(),
    Long: randNLLon(),
    OLT: `OLT${rand(1000, 9999)}`,
    POP: `POP${rand(1, 9)}`,
    FAT: `FAT${1000 + i}`,
    City: ["Amsterdam", "Rotterdam", "Utrecht"][i % 3],
    Is_Plan: false,
    Chain_ID: 50000 + i,
    Type: i % 2 === 0 ? "MFAT" : "SFAT",
    Plan_Type: 0,
  }));
}

export function mockFTTHComponentsOther(count = 40): FTTHOtherComponent[] {
  const types = ["OLT", "ODC", "CP", "TC"];
  return Array.from({ length: count }).map((_, i) => ({
    Component_ID: 2000 + i,
    Name: `${types[i % types.length]}_${2000 + i}`,
    Lat: randNLLat(),
    Long: randNLLon(),
    City: ["Amsterdam", "Rotterdam", "Utrecht"][i % 3],
    Chain_ID: 60000 + i,
    Type: types[i % types.length],
    Is_Plan: false,
    Plan_Type: 0,
  }));
}

export function mockFTTHPoints(count = 200): FTTHPoint[] {
  return Array.from({ length: count }).map((_, i) => ({
    Point_ID: 70000 + i,
    Lat: randNLLat(),
    Long: randNLLon(),
    Type: ["ODCLine", "FATLine", "DropCableLine"][i % 3],
    Chain_ID: 80000 + Math.floor(i / 5),
    Order: i % 10,
    City: ["Amsterdam", "Rotterdam", "Utrecht"][i % 3],
    Is_Plan: false,
    Plan_Type: 0,
  }));
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
    { FAT_ID: 501, Name: "FAT_501", FAT_Lat: randNLLat(), FAT_Long: randNLLon() },
    { FAT_ID: 502, Name: "FAT_502", FAT_Lat: randNLLat(), FAT_Long: randNLLon() },
    { FAT_ID: 503, Name: "FAT_503", FAT_Lat: randNLLat(), FAT_Long: randNLLon() },
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
  return Array.from({ length: count }).map((_, i) => ({
    Modem_ID: 841100 + i,
    RXPower: randFloat(-30, -5, 1),
    Lat: randNLLat(),
    Long: randNLLon(),
  }));
}

export function mockExportRowsDefault(rows = 20) {
  return Array.from({ length: rows }).map((_, i) => ({
    Row: i + 1,
    Name: `Item ${i + 1}`,
    City: ["Amsterdam", "Rotterdam", "Utrecht"][i % 3],
    Status: ["Pending", "Confirmed", "Rejected"][i % 3],
    Value: rand(1, 1000),
  }));
}

export function mockFTTHBlocks(count = 120): FTTHBlock[] {
  const cities = ["Amsterdam", "Rotterdam", "Utrecht"];
  return Array.from({ length: count }).map((_, i) => ({
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
    Lat: randNLLat(),
    Long: randNLLon(),
    Chain_ID: 80000 + i,
    Order: i % 10,
    City: cities[i % cities.length],
  }));
}

export function mockFTTHTabrizFATs(count = 100): FATData[] {
  return Array.from({ length: count }).map((_, i) => ({
    FAT_Index: `FAT_${i + 1}`,
    Lat: randNLLat(),
    Long: randNLLon(),
    Modem_Count: rand(0, 64),
    Max_Distance_Covered_m: rand(100, 800),
  }));
}

export function mockFTTHPreorders(count = 200): FTTHPreorder[] {
  const cities = ["Amsterdam", "Rotterdam", "Utrecht"];
  const provinces = ["Noord-Holland", "Zuid-Holland", "Utrecht"];
  return Array.from({ length: count }).map((_, i) => ({
    ID: 9000 + i,
    Eshop_ID: 50000 + i,
    Postal_Code: `10${rand(100000, 999999)}`,
    Province: provinces[i % provinces.length],
    City: cities[i % cities.length],
    Tracking_Code: `TRK${100000 + i}`,
    Lat: randNLLat(),
    Long: randNLLon(),
    Created_Date: new Date(Date.now() - i * 86400000 / 4).toISOString(),
    FTTH_ID: i % 5 === 0 ? 8411000 + i : null,
    Product_Name: ["FTTH 100M", "FTTH 50M", "FTTH 20M"][i % 3],
    FAT_ID: i % 7 === 0 ? 1000 + i : null,
  }));
}

export function mockSuggestedFAT(count = 80): SuggestedFAT[] {
  return Array.from({ length: count }).map((_, i) => ({
    Name: `SFAT_${100 + i}`,
    Lat: randNLLat(),
    Long: randNLLon(),
    Count: rand(10, 150),
    ID: 100 + i,
  }));
}
