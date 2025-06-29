"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import iranGeoData from "@amcharts/amcharts5-geodata/iranHigh";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import cities from "@/data/cities.json";
import cityPolygons from "@/data/cityPolygons";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";
import { FaCircle, FaChartPie, FaCheckCircle } from "react-icons/fa";
import { MdLocationCity } from "react-icons/md";
import { FaCity } from "react-icons/fa";
import { GiModernCity } from "react-icons/gi";
import { MdLiveTv } from "react-icons/md";
import { IranMapCities } from "@/data/IranMapCities";

/** Province data interface and array.
 *  You must provide a custom `region_color` here for provinces that are special.
 */
export interface ProvinceData {
  id: string;
  persian_name: string;
  value: string;
  region_color?: string;
}
export const provinceData: ProvinceData[] = [
  {
    id: "IR-02",
    persian_name: "آذربایجان غربی",
    value: "286.787k",
    region_color: "#00cc00",
  },
  {
    id: "IR-01",
    persian_name: "آذربایجان شرقی",
    value: "100k",
    region_color: "#00cc00",
  },
  {
    id: "IR-11",
    persian_name: "زنجان",
    value: "217.773k",
    region_color: "#ffff99",
  },
  {
    id: "IR-28",
    persian_name: "قزوین",
    value: "177.102k",
    region_color: "#00cc00",
  },
  {
    id: "IR-19",
    persian_name: "گیلان",
    value: "20.014k",
    region_color: "#00cc00",
  },
  {
    id: "IR-21",
    persian_name: "مازندران",
    value: "177.102k",
    region_color: "#00cc00",
  },
  {
    id: "IR-07",
    persian_name: "تهران",
    value: "813.163k",
    region_color: "#ffa500",
  },
  {
    id: "IR-32",
    persian_name: "البرز",
    value: "388.827k",
    region_color: "#ffa500",
  },
  {
    id: "IR-22",
    persian_name: "مرکزی",
    value: "254.912k",
    region_color: "#00cc00",
  },
  {
    id: "IR-12",
    persian_name: "سمنان",
    value: "169.755k",
    region_color: "#00cc00",
  },
  {
    id: "IR-30",
    persian_name: "خراسان رضوی",
    value: "420.146k",
    region_color: "#00cc00",
  },
  {
    id: "IR-04",
    persian_name: "اصفهان",
    value: "478.137k",
    region_color: "#ffff99",
  },
  {
    id: "IR-20",
    persian_name: "لرستان",
    value: "111.326k",
    region_color: "#00cc00",
  },
  {
    id: "IR-18",
    persian_name: "کهگیلویه و بویراحمد",
    value: "111.326k",
    region_color: "#00cc00",
  },
  {
    id: "IR-10",
    persian_name: "خوزستان",
    value: "490.938k",
    region_color: "#ffff99",
  },
  {
    id: "IR-14",
    persian_name: "فارس",
    value: "612.925k",
    region_color: "#00cc00",
  },
  {
    id: "IR-06",
    persian_name: "بوشهر",
    value: "95.154k",
    region_color: "#00cc00",
  },
  {
    id: "IR-23",
    persian_name: "هرمزگان",
    value: "33.944k",
    region_color: "#ffa500",
  },
];

/** Interfaces for region/city data. */
export interface RegionData {
  id: string;
  name: string;
}

export interface FeatureWithDirectName
  extends GeoJSON.Feature<GeoJSON.Geometry> {
  NAME_ENG?: string;
}

export interface CityData {
  name: string;
  lat: number;
  long: number;
}

/** Props for IranMap */
export interface IranMapProps {
  initialRegion?: string | null;
  initialCity?: string | null;
}

/** Primary highlight color. */
export const PRIMARY_COLOR = 0xffcc01;

/** Helper: returns white in dark mode or black in light mode for normal fill. */
function getNormalFill(): am5.Color {
  return am5.color(
    document.documentElement.classList.contains("dark") ? 0xffffff : 0x000000
  );
}

/** In this version, we do not randomly assign a color.
 *  If no custom color is provided in provinceData, we simply return undefined.
 */
function findProvinceDataById(id: string): ProvinceData | undefined {
  return provinceData.find((p) => p.id === id);
}

/** Style the zoom control buttons. */
function customizeZoomButtons(zoomControl: am5map.ZoomControl) {
  const PRIMARY = 0xffcc01;
  const customizeZoomButton = (button: am5.Button) => {
    const background = button.get("background") as am5.Rectangle;
    if (background) {
      background.setAll({ fill: am5.color(PRIMARY) });
      background.states.create("hover", { fill: am5.color(0xffe680) });
      background.states.create("active", { fill: am5.color(PRIMARY) });
      background.states.create("down", { fill: am5.color(PRIMARY) });
    }
  };
  customizeZoomButton(zoomControl.plusButton);
  customizeZoomButton(zoomControl.minusButton);
  if (zoomControl.homeButton) {
    const homeBackground = zoomControl.homeButton.get("background");
    if (homeBackground) {
      homeBackground.setAll({ fill: am5.color(PRIMARY) });
      homeBackground.states.create("hover", { fill: am5.color(0xffe680) });
      homeBackground.states.create("active", { fill: am5.color(PRIMARY) });
      homeBackground.states.create("down", { fill: am5.color(PRIMARY) });
    }
    zoomControl.homeButton.children.clear();
    zoomControl.homeButton.children.push(
      am5.Graphics.new(zoomControl.homeButton._root, {
        svgPath: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
        fill: am5.color(0x000000),
        centerX: am5.p50,
        centerY: am5.p50,
        width: 16,
        height: 16,
      })
    );
  }
}

/** Type-guard: checks if dataContext is a CityData (has a 'name'). */
function isCityDataContext(dc: unknown): dc is { name: string } {
  return typeof dc === "object" && dc !== null && "name" in dc;
}

/** Create a pulsing marker bullet for each city. */
function createCityBullet(
  root: am5.Root,
  cityOriginalColors: Map<string, am5.Color>,
  handleCityClick: (container: am5.Container) => void
) {
  const container = am5.Container.new(root, {
    tooltipText: "{name}",
    cursorOverStyle: "pointer",
  });
  container.events.on("click", () => handleCityClick(container));
  const bullet = am5.Bullet.new(root, { sprite: container });
  const colorset = am5.ColorSet.new(root, {});
  const initialColor = colorset.next();
  const circle = container.children.push(
    am5.Circle.new(root, {
      radius: 4,
      fill: initialColor,
      strokeOpacity: 0,
    })
  );
  container.children.push(
    am5.Circle.new(root, {
      radius: 4,
      fill: initialColor,
      strokeOpacity: 0,
    })
  );
  const dataItem = container.dataItem;
  if (dataItem?.dataContext && isCityDataContext(dataItem.dataContext)) {
    const city = dataItem.dataContext;
    cityOriginalColors.set(city.name, initialColor);
  }
  circle.animate({
    key: "scale",
    from: 1,
    to: 5,
    duration: 600,
    loops: Infinity,
    easing: am5.ease.out(am5.ease.cubic),
  });
  circle.animate({
    key: "opacity",
    from: 1,
    to: 0.1,
    duration: 600,
    loops: Infinity,
    easing: am5.ease.out(am5.ease.cubic),
  });
  return bullet;
}

/** Creates the province label bullet with a larger font.
 *  The label shows two lines: region name and region value.
 */
function createProvinceLabelBullet(root: am5.Root) {
  return am5.Bullet.new(root, {
    sprite: am5.Label.new(root, {
      text: "{regionName}\n{regionValue}",
      populateText: true,
      centerX: am5.p50,
      centerY: am5.p50,
      fontSize: 12,
    }),
  });
}

/** Applies styling to polygons and region labels.
 *  For provinces with a custom region_color, the polygon fills use that color.
 *  Their labels (both region name and region value) are forced to black.
 *  For others, theme colors are used.
 *  On hover, if a polygon is not active, its fill animates to PRIMARY_COLOR and its label’s region value
 *  text becomes contrasting.
 */
function applyDarkModeStyling(
  polygonSeries: am5map.MapPolygonSeries | null,
  regionLabelSeries: am5map.MapPointSeries | null,
  cityPolygonSeries: am5map.MapPolygonSeries | null
) {
  if (!polygonSeries) return;
  const isDark = document.documentElement.classList.contains("dark");
  const defaultFill = getNormalFill();
  const themeRegionNameColor = isDark ? "#000000" : "#ffffff";
  const defaultRegionValueColor = isDark ? "#000000" : "#ffffff";
  const activeRegionValueColor = isDark ? "#ffffff" : "#000000";

  // 1) Province polygons: use custom region_color if provided.
  polygonSeries.mapPolygons.each((poly: any) => {
    if (!poly.dataItem) return;
    const f = poly.dataItem.dataContext as FeatureWithDirectName;
    const pid = f?.id ? f.id.toString() : "";
    const pData = findProvinceDataById(pid);
    // If a custom color exists, use it; otherwise, use the default fill.
    const specialFill =
      pData && pData.region_color ? am5.color(pData.region_color) : defaultFill;
    if (!poly.get("active")) {
      poly.set("fill", specialFill);
    } else {
      poly.set("fill", am5.color(PRIMARY_COLOR));
    }
  });

  // 2) Province labels.
  if (regionLabelSeries) {
    regionLabelSeries.dataItems.forEach((dataItem: any) => {
      const bullet = dataItem.bullets?.[0];
      if (!bullet) return;
      const label = bullet.get("sprite") as am5.Label;
      if (!label) return;
      const {
        regionName = "",
        regionValue = "",
        regionId = "",
      } = dataItem.dataContext || {};
      // For provinces with custom color, force label text to black.
      const pData = findProvinceDataById(regionId);
      let finalNameColor = themeRegionNameColor;
      let finalValueColor = defaultRegionValueColor;
      if (pData && pData.region_color) {
        finalNameColor = "#000000";
        finalValueColor = "#000000";
      } else {
        // If not custom, then if active, change the value text to contrasting active color.
        let isActive = false;
        polygonSeries.mapPolygons.each((poly: any) => {
          if (!poly.dataItem) return;
          const f = poly.dataItem.dataContext as FeatureWithDirectName;
          const pid = f?.id ? f.id.toString() : "";
          if (pid === regionId && poly.get("active")) {
            isActive = true;
          }
        });
        finalValueColor = isActive
          ? activeRegionValueColor
          : defaultRegionValueColor;
      }
      label.set(
        "text",
        `[color=${finalNameColor}]${regionName}[/]\n[color=${finalValueColor}]${regionValue}[/]`
      );
    });
  }

  // 3) City polygon layer.
  if (cityPolygonSeries) {
    const cityPolygonTemplate = cityPolygonSeries.mapPolygons.template;
    cityPolygonTemplate.setAll({
      fill: am5.color(isDark ? 0xf0f0f0 : 0x4a4a4a),
      stroke: am5.color(isDark ? 0x888888 : 0xd3d3d3),
      interactive: false,
    });
    cityPolygonSeries.mapPolygons.each((poly: any) => {
      const newFill = am5.color(isDark ? 0xf0f0f0 : 0x4a4a4a);
      poly.animate({
        key: "fill",
        from: poly.get("fill"),
        to: newFill,
        duration: 500,
      });
      poly.set("fill", newFill);
    });
  }
}

/** Removes all province selections and resets the map view. */
function deselectAll(
  chart: am5map.MapChart | null,
  polygonSeries: am5map.MapPolygonSeries | null
) {
  if (!chart || !polygonSeries) return;
  chart.goHome();
  const defaultFill = getNormalFill();
  polygonSeries.mapPolygons.each((poly: any) => {
    poly.set("active", false);
    if (!poly.dataItem) return;
    const f = poly.dataItem.dataContext as FeatureWithDirectName;
    const pid = f?.id ? f.id.toString() : "";
    const pData = findProvinceDataById(pid);
    const fill =
      pData && pData.region_color ? am5.color(pData.region_color) : defaultFill;
    poly.set("fill", fill);
  });
}
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return matrix[a.length][b.length];
}

function normalizeCityName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "");
}

function updateCities(
  pointSeries: am5map.MapPointSeries,
  allCities: any[],
  availableCityNames: string[]
) {
  pointSeries.data.setAll([]);

  const geoCityNormalizedMap = allCities
    .filter((c) => c && typeof c.name === "string")
    .map((c) => ({
      original: c,
      normalized: normalizeCityName(c.name),
    }));

  const matchedCities: any[] = [];
  const unmatchedNames: string[] = [];

  for (const available of availableCityNames) {
    const normAvailable = normalizeCityName(available);

    let found =
      geoCityNormalizedMap.find(
        (geo) =>
          normAvailable === geo.normalized ||
          normAvailable.includes(geo.normalized) ||
          geo.normalized.includes(normAvailable)
      ) ||
      geoCityNormalizedMap.find(
        (geo) => levenshtein(normAvailable, geo.normalized) <= 2
      );

    if (found) {
      matchedCities.push(found.original);
    } else {
      unmatchedNames.push(available);
    }
  }

  matchedCities.forEach((city) => {
    pointSeries.data.push({
      geometry: { type: "Point", coordinates: [city.long, city.lat] },
      name: city.name,
    });
  });

  pointSeries.set("visible", true);

  if (unmatchedNames.length > 0) {
    console.warn(
      `[IranMap] ${unmatchedNames.length} unmatched city names from IranMapCities:`,
      unmatchedNames
    );
  }
}

/** Main IranMap component. */
const IranMap: React.FC<IranMapProps> = ({
  initialRegion = null,
  initialCity = null,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(
    initialRegion ? { id: initialRegion, name: "" } : null
  );
  const [inCityMode, setInCityMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5map.MapChart | null>(null);
  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const pointSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const cityPolygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const regionLabelSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const previousSelectedItemRef = useRef<am5map.MapPolygon | am5.Bullet | null>(
    null
  );

  const cityOriginalColors = useRef<Map<string, am5.Color>>(new Map());
  const citylist = useFTTHCitiesStore((state) => state.cities);
  const router = useRouter();
  const liveCount = 1;
  const totalCount = 35;
  const progressPercent = (liveCount / totalCount) * 100;

  const updateQueryParams = (updates: Record<string, string | undefined>) => {
    const url = new URL(window.location.href);
    const currentParams = new URLSearchParams(url.search);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        currentParams.delete(key); // Remove parameter
      } else {
        currentParams.set(key, value); // Update or add parameter
      }
    });

    router.replace(`${url.pathname}?${currentParams.toString()}`);
  };

  // -----------------------------------------------
  // Initialize the map (only once)
  // -----------------------------------------------
  useEffect(() => {
    if (rootRef.current) return;
    const root = am5.Root.new("chartdiv");
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);
    root._logo?.dispose();

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoMercator(),
        panX: "translateX",
        panY: "translateY",
        wheelY: "zoom",
        maxZoomLevel: 200,
      })
    );
    chartRef.current = chart;

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, { geoJSON: iranGeoData })
    );
    polygonSeriesRef.current = polygonSeries;

    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.setAll({
      fill: getNormalFill(),
      stroke: am5.color(
        document.documentElement.classList.contains("dark")
          ? 0x888888
          : 0xd3d3d3
      ),
      tooltipText: "{name}",
      interactive: true,
    });

    // Tooltip shows persian name and value.
    // polygonTemplate.adapters.add("tooltipText", function (text, target) {
    //   const dataItem = target.dataItem;
    //   if (dataItem && dataItem.dataContext) {
    //     const feature = dataItem.dataContext as FeatureWithDirectName;
    //     const id = feature.id ? feature.id.toString() : "";
    //     const pData = findProvinceDataById(id);
    //     if (pData) {
    //       return `[bold]${pData.persian_name}[/]\n${pData.value}`;
    //     }
    //   }
    //   return text;
    // });
    polygonTemplate.adapters.add("tooltipText", function (text, target) {
      const dataItem = target.dataItem;
      if (dataItem && dataItem.dataContext) {
        const feature = dataItem.dataContext as FeatureWithDirectName;
        const id = feature.id ? feature.id.toString() : "";
        const name = feature.NAME_ENG || "Unknown";
        const pData = findProvinceDataById(id);
        if (pData) {
          return `[bold]${name}[/]\n${pData.value}`;
        }
      }
      return text;
    });

    // Pointerover: animate polygon to PRIMARY_COLOR and update its label’s region value text.
    polygonTemplate.events.on("pointerover", (ev: any) => {
      const polygon = ev.target;
      if (!polygon.get("active")) {
        if (!polygon.dataItem) return;
        const f = polygon.dataItem.dataContext as FeatureWithDirectName;
        const pid = f?.id ? f.id.toString() : "";
        const pData = findProvinceDataById(pid);
        const currentFill =
          pData && pData.region_color
            ? am5.color(pData.region_color)
            : getNormalFill();

        polygon.animate({
          key: "fill",
          from: polygon.get("fill") || currentFill,
          to: am5.color(PRIMARY_COLOR),
          duration: 200,
        });

        if (regionLabelSeriesRef.current) {
          regionLabelSeriesRef.current.dataItems.forEach((dataItem: any) => {
            if (dataItem.dataContext.regionId === pid) {
              const finalNameColor =
                pData && pData.region_color
                  ? "#000000"
                  : document.documentElement.classList.contains("dark")
                    ? "#000000"
                    : "#ffffff";
              const finalValueColor =
                pData && pData.region_color ? "#000000" : "#000000";
              dataItem.bullets[0]
                ?.get("sprite")
                ?.set(
                  "text",
                  `[color=${finalNameColor}]${dataItem.dataContext.regionName}[/]\n[color=${finalValueColor}]${dataItem.dataContext.regionValue}[/]`
                );
            }
          });
        }
      }
    });

    // Pointerout: animate polygon back to its custom color and revert label.
    // Pointerout: animate polygon back to its custom color and revert label.
    polygonTemplate.events.on("pointerout", (ev: any) => {
      const polygon = ev.target;
      if (!polygon.get("active")) {
        if (!polygon.dataItem) return;
        const f = polygon.dataItem.dataContext as FeatureWithDirectName;
        const pid = f?.id ? f.id.toString() : "";
        const pData = findProvinceDataById(pid);
        const targetFill =
          pData && pData.region_color
            ? am5.color(pData.region_color)
            : getNormalFill();

        polygon.animate({
          key: "fill",
          from: polygon.get("fill") || am5.color(PRIMARY_COLOR),
          to: targetFill,
          duration: 200,
        });

        if (regionLabelSeriesRef.current) {
          regionLabelSeriesRef.current.dataItems.forEach((dataItem: any) => {
            if (dataItem.dataContext.regionId === pid) {
              const finalNameColor =
                pData && pData.region_color
                  ? "#000000"
                  : document.documentElement.classList.contains("dark")
                    ? "#000000"
                    : "#ffffff";
              const finalValueColor =
                pData && pData.region_color ? "#000000" : "#ffcc01";
              dataItem.bullets[0]
                ?.get("sprite")
                ?.set(
                  "text",
                  `[color=${finalNameColor}]${dataItem.dataContext.regionName}[/]\n[color=${finalValueColor}]${dataItem.dataContext.regionValue}[/]`
                );
            }
          });
        }
      }
    });

    polygonTemplate.events.on("click", handleProvinceClick);

    const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
    pointSeriesRef.current = pointSeries;
    pointSeries.bullets.push(() =>
      createCityBullet(root, cityOriginalColors.current, handleCityClick)
    );

    const regionLabelSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {})
    );
    regionLabelSeriesRef.current = regionLabelSeries;
    regionLabelSeries.bullets.push(() => createProvinceLabelBullet(root));

    const zoomControl = am5map.ZoomControl.new(root, {});
    chart.set("zoomControl", zoomControl);
    customizeZoomButtons(zoomControl);

    const bg = chart.chartContainer.get("background");
    if (bg) {
      bg.events.on("click", () => {
        if (inCityMode) return;
        deselectAll(chartRef.current, polygonSeriesRef.current);
        setSelectedRegion(null);
        updateQueryParams({
          city: undefined,
          region: undefined,
          regionName: undefined,
        });

        previousSelectedItemRef.current = null;
      });
    }

    polygonSeries.events.on("datavalidated", () => {
      regionLabelSeries.data.clear();
      polygonSeries.dataItems.forEach((dataItem) => {
        const feature = dataItem.dataContext as FeatureWithDirectName;
        if (!feature?.geometry) return;
        const id = feature.id ? feature.id.toString() : "";
        const centroid = am5map.getGeoCentroid(feature.geometry);
        if (!centroid) return;
        const pData = findProvinceDataById(id);
        const regionValue = pData?.value ?? "";
        regionLabelSeries.data.push({
          geometry: {
            type: "Point",
            coordinates: [centroid.longitude, centroid.latitude],
          },
          regionId: id,
          regionName: feature.NAME_ENG ?? "",
          regionValue,
        });
      });
      setTimeout(() => {
        applyDarkModeStyling(
          polygonSeriesRef.current,
          regionLabelSeriesRef.current,
          cityPolygonSeriesRef.current
        );
      }, 50);
    });

    updateCities(pointSeries, cities, IranMapCities);

    applyDarkModeStyling(
      polygonSeriesRef.current,
      regionLabelSeriesRef.current,
      cityPolygonSeriesRef.current
    );

    chart.appear(1000, 100);
    setMapReady(true);

    return () => {
      root.dispose();
      rootRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapReady || !polygonSeriesRef.current || !initialRegion) return;
    polygonSeriesRef.current.mapPolygons.each((poly: any) => {
      const dataItem = poly.dataItem;
      if (dataItem?.dataContext) {
        const feature = dataItem.dataContext as FeatureWithDirectName;
        const id = feature.id ? feature.id.toString() : "";
        if (id === initialRegion) {
          poly.set("active", true);
          poly.set("fill", am5.color(PRIMARY_COLOR));
          previousSelectedItemRef.current = poly;
          setSelectedRegion({ id, name: feature.NAME_ENG || "" });
          const geoBounds = (am5map.getGeoBounds as any)(feature.geometry);
          if (geoBounds) {
            chartRef.current?.zoomToGeoBounds(geoBounds, 1000);
          }
        }
      }
    });
  }, [mapReady, initialRegion]);

  useEffect(() => {
    if (!mapReady || !initialCity) return;
    const cityName = initialCity;
    const cityFeature = cityPolygons.features.find(
      (f) => f.properties?.name === cityName
    );
    if (cityFeature) {
      setInCityMode(true);
      polygonSeriesRef.current?.set("visible", false);
      pointSeriesRef.current?.set("visible", false);
      regionLabelSeriesRef.current?.set("visible", false);
      if (!cityPolygonSeriesRef.current) {
        cityPolygonSeriesRef.current =
          chartRef.current?.series.push(
            am5map.MapPolygonSeries.new(rootRef.current!, {
              geoJSON: cityFeature,
            })
          ) || null;
      } else {
        cityPolygonSeriesRef.current.set("geoJSON", cityFeature);
        cityPolygonSeriesRef.current.set("visible", true);
      }
      if (cityPolygonSeriesRef.current) {
        const cityPolygonTemplate =
          cityPolygonSeriesRef.current.mapPolygons.template;
        cityPolygonTemplate.set("interactive", false);
        (["pointerdown", "pointermove", "pointerup", "click"] as any[]).forEach(
          (eventName) => {
            cityPolygonTemplate.events.on(eventName, (ev: any) => {
              if (typeof ev.stopPropagation === "function") {
                ev.stopPropagation();
                ev.preventDefault();
              }
            });
          }
        );
      }
      const geometry = cityFeature.geometry;
      if (geometry) {
        const center = am5map.getGeoCentroid(geometry);
        if (center) {
          chartRef.current?.zoomToGeoPoint(center, 200, true);
        }
      }
      updateQueryParams({
        city: cityName,
        region: undefined,
        regionName: undefined,
      });
    }
  }, [mapReady, initialCity]);

  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new MutationObserver(() => {
      applyDarkModeStyling(
        polygonSeriesRef.current,
        regionLabelSeriesRef.current,
        cityPolygonSeriesRef.current
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mapReady && pointSeriesRef.current) {
      updateCities(pointSeriesRef.current, cities, IranMapCities);
    }
  }, [mapReady]);

  const handleProvinceClick = (ev: any) => {
    if (inCityMode) return;
    const chart = chartRef.current;
    if (!chart) return;
    const polygon = ev.target as am5map.MapPolygon;
    const dataItem = polygon.dataItem;
    if (!dataItem?.dataContext) return;
    const feature = dataItem.dataContext as FeatureWithDirectName;
    const id = feature.id ? feature.id.toString() : "";
    const name = feature.NAME_ENG || "";
    if (polygon.get("active")) {
      polygon.set("active", false);
      chart.goHome();
      setSelectedRegion(null);
      previousSelectedItemRef.current = null;
      updateQueryParams({
        city: undefined,
        region: undefined,
        regionName: undefined,
      });

      applyDarkModeStyling(
        polygonSeriesRef.current,
        regionLabelSeriesRef.current,
        cityPolygonSeriesRef.current
      );
      return;
    }
    if (polygonSeriesRef.current) {
      const currentFill = (() => {
        if (!polygon.dataItem) return getNormalFill();
        const f = polygon.dataItem.dataContext as FeatureWithDirectName;
        const pid = f.id ? f.id.toString() : "";
        const pData = findProvinceDataById(pid);
        return pData && pData.region_color
          ? am5.color(pData.region_color)
          : getNormalFill();
      })();
      polygonSeriesRef.current.mapPolygons.each((poly: any) => {
        poly.set("active", false);
        if (!poly.dataItem) return;
        const f = poly.dataItem.dataContext as FeatureWithDirectName;
        const pid = f.id ? f.id.toString() : "";
        const pData = findProvinceDataById(pid);
        const fill =
          pData && pData.region_color
            ? am5.color(pData.region_color)
            : getNormalFill();
        poly.set("fill", fill);
      });
    }
    polygon.set("active", true);
    polygon.set("fill", am5.color(PRIMARY_COLOR));
    previousSelectedItemRef.current = polygon;
    const geoBounds = (am5map.getGeoBounds as any)(feature.geometry);
    if (geoBounds) {
      chart.zoomToGeoBounds(geoBounds, 1000);
    }
    setSelectedRegion({ id, name });
    updateQueryParams({ city: undefined, region: id, regionName: name });

    applyDarkModeStyling(
      polygonSeriesRef.current,
      regionLabelSeriesRef.current,
      cityPolygonSeriesRef.current
    );
  };

  const handleCityClick = (container: am5.Container) => {
    if (inCityMode) return;
    const chart = chartRef.current;
    if (!chart) return;
    const dataItem = container.dataItem;
    if (!dataItem?.dataContext) return;
    if (!isCityDataContext(dataItem.dataContext)) return;
    const cityName = dataItem.dataContext.name;
    const cityFeature = cityPolygons.features.find(
      (f) => f.properties?.name === cityName
    );
    if (cityFeature) {
      polygonSeriesRef.current?.set("visible", false);
      pointSeriesRef.current?.set("visible", false);
      regionLabelSeriesRef.current?.set("visible", false);
      if (!cityPolygonSeriesRef.current) {
        cityPolygonSeriesRef.current = chart.series.push(
          am5map.MapPolygonSeries.new(rootRef.current!, {
            geoJSON: cityFeature,
          })
        );
      } else {
        cityPolygonSeriesRef.current.set("geoJSON", cityFeature);
        cityPolygonSeriesRef.current.set("visible", true);
      }
      applyDarkModeStyling(
        polygonSeriesRef.current,
        regionLabelSeriesRef.current,
        cityPolygonSeriesRef.current
      );
      const geometry = cityFeature.geometry;
      if (geometry) {
        const center = am5map.getGeoCentroid(geometry);
        if (center) {
          chart.zoomToGeoPoint(center, 200, true);
        }
      }
      setSelectedRegion({ id: cityName, name: cityName });
      setInCityMode(true);
      updateQueryParams({
        city: cityName,
        region: undefined,
        regionName: undefined,
      });
    }
  };

  const handleBackButtonClick = () => {
    const chart = chartRef.current;
    if (!chart) return;
    if (cityPolygonSeriesRef.current) {
      cityPolygonSeriesRef.current.set("visible", false);
    }
    updateQueryParams({
      city: undefined,
      region: undefined,
      regionName: undefined,
    });
    polygonSeriesRef.current?.set("visible", true);
    pointSeriesRef.current?.set("visible", true);
    regionLabelSeriesRef.current?.set("visible", true);
    chart.goHome();
    if (polygonSeriesRef.current) {
      const defaultFill = getNormalFill();
      polygonSeriesRef.current.mapPolygons.each((poly: any) => {
        poly.set("active", false);
        if (!poly.dataItem) return;
        const f = poly.dataItem.dataContext as FeatureWithDirectName;
        const pid = f?.id ? f.id.toString() : "";
        const pData = findProvinceDataById(pid);
        const fill =
          pData && pData.region_color
            ? am5.color(pData.region_color)
            : defaultFill;
        poly.set("fill", fill);
      });
    }

    previousSelectedItemRef.current = null;
    setSelectedRegion(null);
    setInCityMode(false);
  };

  return (
    <div className="relative w-full h-[500px]">
      <div id="chartdiv" className="w-full h-full"></div>
      {inCityMode && (
        <button
          className="absolute top-50 left-2 z-20 bg-white dark:bg-gray-dark dark:text-white p-2 rounded shadow-md"
          onClick={handleBackButtonClick}
        >
          Back
        </button>
      )}
      {/* Top-Left: Province, City, Mega City Stats */}
      <div className="absolute top-2 left-2 z-10 bg-white dark:bg-gray-dark p-4 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700">
        <h5 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">
          Region Statistics
        </h5>
        <div className="space-y-2">
          <p className="flex items-center text-blue-700 dark:text-blue-400 font-medium">
            <MdLocationCity className="mr-2 text-blue-600 dark:text-blue-300" />
            Province: <span className="ml-1 font-bold">18</span>
          </p>
          <p className="flex items-center text-purple-700 dark:text-purple-400 font-medium">
            <FaCity className="mr-2 text-purple-600 dark:text-purple-300" />
            City: <span className="ml-1 font-bold">436</span>
          </p>
          <p className="flex items-center text-teal-700 dark:text-teal-400 font-medium">
            <GiModernCity className="mr-2 text-teal-600 dark:text-teal-300" />
            Mega City: <span className="ml-1 font-bold">7</span>
          </p>
        </div>
      </div>
      {/* Top-Right: Household Obligation & Coverage */}
      {/** 
  <div className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-dark p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
    <h5 className="font-bold text-lg text-gray-dark dark:text-gray-100 text-center">
      Household Obligation &amp; Coverage
    </h5>
    <div className="mt-3 flex items-center justify-around">
      <div className="flex flex-col items-center">
        <FaChartPie className="text-red-600 dark:text-red-400 text-3xl" />
        <p className="text-red-700 dark:text-red-300 text-xl font-bold">5,070,983</p>
        <p className="text-red-600 dark:text-red-400 text-sm">UNSP Obligation HH</p>
      </div>
      <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 mx-3" />
      <div className="flex flex-col items-center">
        <FaCheckCircle className="text-green-600 dark:text-green-400 text-3xl" />
        <p className="text-green-700 dark:text-green-300 text-xl font-bold">1,872,286</p>
        <p className="text-green-600 dark:text-green-400 text-sm">
          Coverage (Iranftx - Irancell+FCP)
        </p>
      </div>
    </div>
  </div> 

 */}{" "}
      <div className="absolute top-2 right-2 z-10 flex flex-col space-y-4">
        {/* Main Card Container */}
        <div className="bg-white dark:bg-gray-dark p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <h5 className="font-semibold text-center text-sm text-gray-800 dark:text-gray-100">
            Household Obligation &amp; Coverage
          </h5>
          <div className="mt-2 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <FaChartPie className="text-red-500 dark:text-red-400 text-2xl" />
              <p className="text-red-600 dark:text-red-300 text-base font-semibold">
                5.07M
              </p>
              <p className="text-xs text-red-500 dark:text-red-400">
                Obligation
              </p>
            </div>
            <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 mx-3" />
            <div className="flex flex-col items-center">
              <FaCheckCircle className="text-green-500 dark:text-green-400 text-2xl" />
              <p className="text-green-600 dark:text-green-300 text-base font-semibold">
                1.87M
              </p>
              <p className="text-xs text-green-500 dark:text-green-400 text-center">
                Coverage
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="bg-white dark:bg-gray-dark p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
            <span className="flex items-center">
              <MdLiveTv className="mr-1 text-primary" /> Live Data
            </span>
            <span>
              {liveCount} / {totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-4 mt-1 relative">
            <div
              className="bg-primary h-4 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
              {progressPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      {/* Bottom-Left: Selected Region & HH Legend */}
      <div className="absolute bottom-2 left-2 z-10 mt-2">
        <div className="bg-white dark:bg-gray-dark p-4 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700">
          <h5 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            {selectedRegion ? selectedRegion.name : "Iran"}
          </h5>
          <div className="mt-3 space-y-2">
            <p className="flex items-center text-sm text-red-600 dark:text-red-400 font-medium">
              <FaCircle className="mr-2 text-red-500 dark:text-red-300" />
              HH ongoing &lt; 25%
            </p>
            <p className="flex items-center text-sm text-orange-500 dark:text-orange-300 font-medium">
              <FaCircle className="mr-2 text-orange-400 dark:text-orange-200" />
              25% &lt; HH ongoing &lt; 50%
            </p>
            <p className="flex items-center text-sm text-yellow-500 dark:text-yellow-300 font-medium">
              <FaCircle className="mr-2 text-yellow-400 dark:text-yellow-200" />
              50% &lt; HH ongoing &lt; 75%
            </p>
            <p className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
              <FaCircle className="mr-2 text-green-500 dark:text-green-300" />
              HH ongoing &gt; 75%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IranMap;
