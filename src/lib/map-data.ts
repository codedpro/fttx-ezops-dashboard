import { Cloud, Zap, Snowflake, TowerControl, ShieldAlert, DoorOpen, BatteryCharging, Fuel, Wrench } from "lucide-react";

export type Region = "R1" | "R2" | "R3" | "R4" | "R5" | "R6";

export const REGIONS = {
  "Noord-Nederland": { provinces: ["Groningen", "Friesland", "Drenthe"] },
  "Oost-Nederland": { provinces: ["Overijssel", "Gelderland"] },
  "Midden-Nederland": { provinces: ["Flevoland", "Utrecht"] },
  "Randstad-Noord": { provinces: ["Noord-Holland"] },
  "Randstad-Zuid": { provinces: ["Zuid-Holland", "Zeeland"] },
  "Zuid-Nederland": { provinces: ["Noord-Brabant", "Limburg"] },
} as const;

export type RegionName = keyof typeof REGIONS;

export const provinces = Object.values(REGIONS).flatMap((r) => r.provinces);

export const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  Drenthe: { lat: 52.85, lng: 6.6 },
  Flevoland: { lat: 52.52, lng: 5.5 },
  Friesland: { lat: 53.1, lng: 5.8 },
  Gelderland: { lat: 52.05, lng: 5.9 },
  Groningen: { lat: 53.25, lng: 6.75 },
  Limburg: { lat: 51.2, lng: 5.9 },
  "Noord-Brabant": { lat: 51.55, lng: 5.0 },
  "Noord-Holland": { lat: 52.65, lng: 4.8 },
  Overijssel: { lat: 52.5, lng: 6.4 },
  Utrecht: { lat: 52.1, lng: 5.1 },
  Zeeland: { lat: 51.45, lng: 3.85 },
  "Zuid-Holland": { lat: 52.0, lng: 4.5 },
};

export const getRegionForProvince = (provinceName: string) => {
  for (const regionName in REGIONS) {
    const region = REGIONS[regionName as RegionName];
    if ((region.provinces as readonly string[]).includes(provinceName)) {
      return { name: regionName as RegionName, ...region };
    }
  }
  return { name: "Randstad-Noord" as RegionName, provinces: [] };
};

export const alarmTypes = {
  cloudy: { label: "Cloudy", icon: Cloud, color: "text-slate-400", baseColor: "hsl(220, 10%, 50%)" },
  rainy: { label: "Rainy", icon: Zap, color: "text-cyan-300", baseColor: "hsl(180, 80%, 50%)" },
  snow: { label: "Snow", icon: Snowflake, color: "text-white", baseColor: "hsl(210, 100%, 80%)" },
  down_site: { label: "Down Site", icon: TowerControl, color: "text-rose-400", baseColor: "hsl(340, 90%, 60%)" },
  alarm_power: { label: "Power Alarm", icon: ShieldAlert, color: "text-amber-400", baseColor: "hsl(45, 100%, 55%)" },
  alarm_door: { label: "Door Alarm", icon: DoorOpen, color: "text-orange-400", baseColor: "hsl(30, 95%, 60%)" },
  on_battery: { label: "On Battery", icon: BatteryCharging, color: "text-lime-400", baseColor: "hsl(80, 80%, 55%)" },
  on_dg: { label: "On DG", icon: Fuel, color: "text-violet-400", baseColor: "hsl(260, 90%, 70%)" },
  maintenance: { label: "Under Maintenance", icon: Wrench, color: "text-sky-400", baseColor: "hsl(200, 90%, 65%)" },
} as const;

export type AlarmType = keyof typeof alarmTypes;

export interface Alarm {
  id: string;
  type: AlarmType;
  lat: number;
  lng: number;
  province: string;
  region: RegionName;
  network: "KPN" | "VodafoneZiggo" | "T-Mobile";
  details: string;
  startTime: string;
}

const networks = ["KPN", "VodafoneZiggo", "T-Mobile"] as const;
const types = Object.keys(alarmTypes).filter((t) => !["cloudy", "rainy", "snow"].includes(t)) as AlarmType[];

export const mockAlarms: Alarm[] = Array.from({ length: 150 }, (_, i) => {
  const province = provinces[Math.floor(Math.random() * provinces.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const regionInfo = getRegionForProvince(province);
  const coords = PROVINCE_COORDS[province as keyof typeof PROVINCE_COORDS];
  const lat = coords.lat + (Math.random() - 0.5) * 0.2;
  const lng = coords.lng + (Math.random() - 0.5) * 0.2;
  return {
    id: `alarm-${i}`,
    type,
    lat,
    lng,
    province,
    region: regionInfo.name,
    network: networks[Math.floor(Math.random() * networks.length)],
    details: "Auto-generated mock alarm",
    startTime: new Date(Date.now() - Math.floor(Math.random() * 3600 * 1000)).toISOString(),
  };
});

