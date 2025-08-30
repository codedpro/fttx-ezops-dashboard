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

// Utilities
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, digits = 2) => {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(digits));
};

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
    { ID: 1, Name: "all", Full_Name: "All", Lat: 35.6892, Long: 51.3890, Farsi: "همه" },
    { ID: 2, Name: "Tehran", Full_Name: "Tehran", Lat: 35.6892, Long: 51.3890, Farsi: "تهران" },
    { ID: 3, Name: "Shiraz", Full_Name: "Shiraz", Lat: 29.5918, Long: 52.5837, Farsi: "شیراز" },
    { ID: 4, Name: "Tabriz", Full_Name: "Tabriz", Lat: 38.0962, Long: 46.2738, Farsi: "تبریز" },
  ];
}

export function mockFTTHModems(count = 200): FTTHModem[] {
  return Array.from({ length: count }).map((_, i) => ({
    Modem_ID: 8411000 + i,
    Lat: 35 + randFloat(-1, 1, 6),
    Long: 51 + randFloat(-1, 1, 6),
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
    Lat: 35 + randFloat(-1, 1, 6),
    Long: 51 + randFloat(-1, 1, 6),
    OLT: `OLT${rand(1000, 9999)}`,
    POP: `POP${rand(1, 9)}`,
    FAT: `FAT${1000 + i}`,
    City: ["Tehran", "Shiraz", "Tabriz"][i % 3],
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
    Lat: 35 + randFloat(-1, 1, 6),
    Long: 51 + randFloat(-1, 1, 6),
    City: ["Tehran", "Shiraz", "Tabriz"][i % 3],
    Chain_ID: 60000 + i,
    Type: types[i % types.length],
    Is_Plan: false,
    Plan_Type: 0,
  }));
}

export function mockFTTHPoints(count = 200): FTTHPoint[] {
  return Array.from({ length: count }).map((_, i) => ({
    Point_ID: 70000 + i,
    Lat: 35 + randFloat(-1, 1, 6),
    Long: 51 + randFloat(-1, 1, 6),
    Type: ["ODCLine", "FATLine", "DropCableLine"][i % 3],
    Chain_ID: 80000 + Math.floor(i / 5),
    Order: i % 10,
    City: ["Tehran", "Shiraz", "Tabriz"][i % 3],
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
    IBSNG_Internet_Onlines: [
      {
        FTTH_ID,
        Sub_Service: "Internet",
        QOS: "Premium",
        Login_Time: new Date().toISOString(),
        Ras_Desc: "RAS-1",
        Remote_IP: "10.0.0.10",
        MAC: "AA:BB:CC:DD:EE:FF",
        Port: "1",
        In_Bytes: rand(1e6, 1e9),
        Out_Bytes: rand(1e6, 1e9),
        In_Rate: rand(1e3, 1e6),
        Out_Rate: rand(1e3, 1e6),
        Session_ID: `sess_${FTTH_ID}`,
        Rule: "default",
        Failed_Reason: "",
        Apn: "",
        SSID: "",
      },
    ],
    IBSNG_Connection_History: [],
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
    { FAT_ID: 501, Name: "FAT_501", FAT_Lat: 35.7, FAT_Long: 51.3 },
    { FAT_ID: 502, Name: "FAT_502", FAT_Lat: 35.71, FAT_Long: 51.31 },
    { FAT_ID: 503, Name: "FAT_503", FAT_Lat: 35.72, FAT_Long: 51.32 },
  ];
}

export function mockNominatimSearch() {
  return [
    {
      place_id: 1,
      licence: "Data © OpenStreetMap contributors",
      osm_type: "node",
      osm_id: 1,
      boundingbox: ["35.68", "35.70", "51.38", "51.40"],
      lat: "35.6892",
      lon: "51.3890",
      display_name: "Tehran, Iran",
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
    Lat: 35 + randFloat(-1, 1, 6),
    Long: 51 + randFloat(-1, 1, 6),
  }));
}

export function mockExportRowsDefault(rows = 20) {
  return Array.from({ length: rows }).map((_, i) => ({
    Row: i + 1,
    Name: `Item ${i + 1}`,
    City: ["Tehran", "Shiraz", "Tabriz"][i % 3],
    Status: ["Pending", "Confirmed", "Rejected"][i % 3],
    Value: rand(1, 1000),
  }));
}

