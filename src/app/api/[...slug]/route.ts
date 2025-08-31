import { NextResponse } from "next/server";
import {
  DUMMY_TOKEN,
  DUMMY_USER,
  mockFTTHPayload,
  mockIBSNGOnlineCount,
  mockFTTHDashboard,
  mockUTDailyChart,
  mockFTTHACS,
  mockFTTHSalesDetails,
  mockExportList,
  mockFTTHCities,
  mockFTTHModems,
  mockFTTHComponentsFat,
  mockFTTHComponentsOther,
  mockFTTHPoints,
  mockModemDetails,
  mockModemPacketRemaining,
  mockNearbyFATs,
  mockNominatimSearch,
  mockFTTHACSRXPower,
  mockExportRowsDefault,
  mockFTTHBlocks,
  mockFTTHTabrizFATs,
  mockFTTHPreorders,
  mockSuggestedFAT,
} from "@/lib/mocks/data";

// Local helpers used in a few summary responses
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function ok(data: any, init: ResponseInit = {}) {
  return NextResponse.json(data, { status: 200, ...init });
}

function unauthorized(message = "Unauthorized") {
  return new NextResponse(message, { status: 401 });
}

function notFound(message = "Not found") {
  return new NextResponse(message, { status: 404 });
}

function requireAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1] || "";
  // In mock mode, accept any token (or none) to keep the app usable
  return { ok: true, token: token || DUMMY_TOKEN };
}

export async function GET(request: Request, context: { params: { slug?: string[] } }) {
  const { slug = [] } = context.params || {};
  const path = slug.join("/");

  // Auth for most endpoints
  const auth = requireAuth(request);
  if (!auth.ok) return unauthorized();

  // Mapbox directions mock
  if (path === "mapbox/directions") {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const [fromLng, fromLat] = (from || "51.3890,35.6892").split(",").map(parseFloat);
    const [toLng, toLat] = (to || "51.4,35.7").split(",").map(parseFloat);
    const coordinates = [
      [fromLng, fromLat],
      // simple midpoints
      [(fromLng + toLng) / 2, (fromLat + toLat) / 2],
      [toLng, toLat],
    ];
    return ok({
      routes: [
        {
          distance: 1000,
          geometry: { type: "LineString", coordinates },
        },
      ],
    });
  }

  switch (path) {
    case "FTTHDashboard":
      return ok(mockFTTHDashboard());
    case "FTTHDynamicExportList":
      return ok(mockExportList());
    case "FTTHACS":
      return ok(mockFTTHACS(250));
    case "GetFTTHDashboardSalesDetails":
      return ok(mockFTTHSalesDetails());
    case "FTTHCities":
      return ok(mockFTTHCities());
    case "FTTHModems":
      return ok(mockFTTHModems(200));
    case "FTTHPoints":
      return ok(mockFTTHPoints(200));
    case "GetFTTHOLTAlarms": {
      const now = Date.now();
      const alarms = Array.from({ length: 10 }).map((_, i) => ({
        ID: i + 1,
        SiteID: `OLT_${1000 + i}`,
        Alarm_Name: ["LOS", "High Temperature", "Power Fail"][i % 3],
        Alarm_Time: new Date(now - i * 3600 * 1000).toISOString(),
        Alarm_Type: ["Critical", "Major", "Minor"][i % 3],
        Lat: 35 + Math.random(),
        Long: 51 + Math.random(),
      }));
      return ok(alarms);
    }
    case "FTTHACSRXPower":
      return ok(mockFTTHACSRXPower(100));
    case "FTTHBlocks":
      return ok(mockFTTHBlocks(120));
    case "FTTHGetTabrizFATs":
      return ok(mockFTTHTabrizFATs(100));
    case "FTTHPreorders":
      return ok(mockFTTHPreorders(200));
    case "SuggestedFAT":
      return ok(mockSuggestedFAT(80));
    case "IranMapDashboardSummary": {
      // Build a minimal yet structured response matching ApiResponse
      const weekly = Array.from({ length: 12 }).reduce((acc: Record<string, number>, _, i) => {
        acc[`W${i + 1}`] = Math.floor(Math.random() * 100) + 10;
        return acc;
      }, {});
      const fs = {
        TotalDistance: `${rand(100, 500)} km`,
        Irancell: { Plan: rand(100, 300), Actual: rand(80, 250), Weekly: rand(5, 30), WeeklyData: weekly },
        FCP: { Plan: rand(100, 300), Actual: rand(80, 250), Weekly: rand(5, 30), WeeklyData: weekly },
      };
      const fi = {
        TotalCount: rand(1000, 5000),
        Irancell: { Plan: rand(100, 500), Actual: rand(80, 400), Weekly: rand(5, 50) },
        FCP: { Plan: rand(100, 500), Actual: rand(80, 400), Weekly: rand(5, 50) },
      };
      const progress: Record<string, any> = {
        Tehran: { Inhouse: "30%", FTK: "20%", ServCo: "25%", FCP: "25%" },
        Shiraz: { Inhouse: "25%", FTK: "25%", ServCo: "25%", FCP: "25%" },
      };
      const deployment: Record<string, any> = {
        Tehran: { Cities: 1, Households: rand(10000, 20000), Percentage: "45%" },
        Shiraz: { Cities: 1, Households: rand(5000, 15000), Percentage: "35%" },
      };
      return ok({ Progress: progress, FiberShoot: fs, FATInstallation: fi, Excavation: fs, Deployment: deployment });
    }
    case "FTTHGetTabrizBlocks": {
      const blocks = Array.from({ length: 5 }).map((_, i) => ({
        id: i + 1,
        coordinates: [
          [51.3 + i * 0.01, 35.7 + i * 0.01],
          [51.31 + i * 0.01, 35.71 + i * 0.01],
          [51.32 + i * 0.01, 35.72 + i * 0.01],
        ],
      }));
      return ok(blocks);
    }
    case "getiranfttx": {
      const areas = Array.from({ length: 6 }).map((_, i) => ({
        ID: i + 1,
        Iran_FTTX_ID: 1000 + i,
        Name: `Area_${i + 1}`,
        Province: ["Tehran", "Fars", "EastAzerbaijan"][i % 3],
        City: ["Tehran", "Shiraz", "Tabriz"][i % 3],
        Radius: 500 + i * 50,
        Precess_Serial: i + 1,
        Lat: 35 + Math.random(),
        Long: 51 + Math.random(),
      }));
      return ok(areas);
    }
    case "nominatim/search":
      return ok(mockNominatimSearch());
    default:
      // Handle parameterized queries like FTTHComponents/?id=FAT
      if (slug[0] === "FTTHComponents") {
        const url = new URL(request.url);
        const id = url.searchParams.get("id") || "FAT";
        if (id.toUpperCase() === "FAT") return ok(mockFTTHComponentsFat(60));
        return ok(mockFTTHComponentsOther(40));
      }
      // Export endpoints used for download buttons
      if (path.startsWith("FTTHDashboardExport")) {
        return ok(mockExportRowsDefault(50));
      }
      return notFound();
  }
}

export async function POST(request: Request, context: { params: { slug?: string[] } }) {
  const { slug = [] } = context.params || {};
  const path = slug.join("/");

  // Simple auth check for POST as well
  const auth = requireAuth(request);
  if (!auth.ok) return unauthorized();

  switch (path) {
    case "FTTHGetPayloadPerDayV2": {
      const body = await request.json().catch(() => ({} as any));
      const days = typeof body?.EndDay === "number" ? body.EndDay : 30;
      return ok(mockFTTHPayload(days));
    }
    case "FTTHGetIBSNGOnlineCount": {
      const body = await request.json().catch(() => ({} as any));
      const rows = typeof body?.RowLimit === "number" ? body.RowLimit : 100;
      return ok(mockIBSNGOnlineCount(Math.min(rows, 2000)));
    }
    case "GetFTTHDashboardUTDailyChart": {
      const body = await request.json().catch(() => ({} as any));
      const span = typeof body?.end === "number" ? body.end : 30;
      return ok(mockUTDailyChart(span));
    }
    case "FTTHGetPayloadUseDaily": {
      // Return a list of per-modem usage rows for a single day
      const rows = Array.from({ length: 30 }).map((_, i) => ({
        City: ["Tehran", "Shiraz", "Tabriz"][i % 3],
        Usage: rand(1000, 100000),
        ftth_id: 8411000 + i,
        modem_id: `MDM_${800000 + i}`,
      }));
      return ok(rows);
    }
    case "IBSNGForceRefresh":
    case "FTTHSeperateLines":
    case "FTTHAddNewFATPoint":
    case "FTTHEditFATPoint":
    case "FTTHEditComponentPoint":
    case "FTTHEditLineDetail":
    case "FTTHDeleteRoute":
    case "FTTHConnectLine":
    case "FTTHEditLine":
    case "FTTHAddNewRoute":
    case "FTTHMoveComponent":
    case "FTTHDeleteComponent":
    case "IranMapDashboardImport":
    case "FTTHCustomerCoplainUpload":
    case "UserProfileUpdate":
    case "UserProfileUpload":
      return ok({ message: "ok" });
    case "FTTHHowManyLinesConnected": {
      // Default to zero so delete path proceeds automatically in UI.
      return ok({
        count: 0,
        firstComponentChainID: 0,
        firstComponentName: "",
        secondComponentChainID: 0,
        secondComponentName: "",
      });
    }
    case "FTTHDynamicExport": {
      return ok(mockExportRowsDefault(100));
    }
    case "FTTHDashboardExportUTTicketDaily": {
      return ok(mockExportRowsDefault(50));
    }
    case "ExternalApiGetClosestBlockByPoint": {
      const now = Date.now();
      return ok([
        {
          id: 1,
          blockId: 1001,
          stateName: "Tehran",
          parish: "Tehran",
          avenueTypeName: "St",
          avenue: "Valiasr",
          preAvenTypeName: "",
          preAven: "",
          floorNo: 1,
          locationType: "Apartment",
          locationName: "Block A",
          plateNo: "12",
          unit: "1",
          activity: "Residential",
          buildingName: "Test Building",
          buildingType: "Residential",
          entrance: "North",
          address: "Valiasr St, Tehran",
        },
      ]);
    }
    case "GetNearbyFATs": {
      return ok(mockNearbyFATs());
    }
    case "poisearchexact": {
      // Minimal POI search stub
      const rows = 10;
      const data = Array.from({ length: rows }).map((_, i) => ({
        activity: ["Shop", "Cafe", "School"][i % 3],
        city: ["Tehran", "Shiraz", "Tabriz"][i % 3],
        province: ["Tehran", "Fars", "EastAzerbaijan"][i % 3],
        location: { lat: 35.7 + Math.random() * 0.1, lon: 51.3 + Math.random() * 0.1 },
      }));
      return ok(data);
    }
    case "ModemDetails": {
      // Accept form body or JSON for id
      let id = "8411000";
      const ct = request.headers.get("content-type") || "";
      if (ct.includes("application/x-www-form-urlencoded")) {
        const text = await request.text();
        const params = new URLSearchParams(text);
        id = params.get("FTTH_ID") || id;
      } else {
        const body = await request.json().catch(() => ({}));
        id = body?.FTTH_ID || id;
      }
      return ok(mockModemDetails(String(id)));
    }
    case "getftthuserremainingtraffic": {
      return ok(mockModemPacketRemaining());
    }
    default:
      return notFound();
  }
}
