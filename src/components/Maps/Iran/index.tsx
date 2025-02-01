"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import iranGeoData from "@amcharts/amcharts5-geodata/iranHigh";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Feature, Geometry } from "geojson";
import cities from "@/data/cities.json";
import cityPolygons from "@/data/cityPolygons";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";

/** Interfaces */
export interface RegionData {
  id: string;
  name: string;
}

interface FeatureWithDirectName extends Feature<Geometry> {
  NAME_ENG?: string;
}

interface CityData {
  name: string;
  lat: number;
  long: number;
}

/** Primary highlight color */
const PRIMARY_COLOR = 0xffcc01;

/** Props for IranMap */
interface IranMapProps {
  initialRegion?: string | null;
  initialCity?: string | null;
}

const IranMap: React.FC<IranMapProps> = ({
  initialRegion = null,
  initialCity = null,
}) => {
  // Local state
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(
    initialRegion ? { id: initialRegion, name: "" } : null
  );
  const [inCityMode, setInCityMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Refs for amCharts components.
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5map.MapChart | null>(null);
  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const pointSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const cityPolygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const regionLabelSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const previousSelectedItemRef = useRef<am5map.MapPolygon | am5.Bullet | null>(null);
  const cityOriginalColors = useRef<Map<string, am5.Color>>(new Map());

  const citylist = useFTTHCitiesStore((state) => state.cities);
  const router = useRouter();

  // -----------------------------------------------------------------------
  // getNormalFill: In dark mode, province fill = white; in light mode, province fill = black.
  // -----------------------------------------------------------------------
  const getNormalFill = () =>
    am5.color(
      document.documentElement.classList.contains("dark") ? 0xffffff : 0x000000
    );

  // -----------------------------------------------------------------------
  // Preselect region if initialRegion is provided.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!mapReady || !polygonSeriesRef.current || !initialRegion) return;
    polygonSeriesRef.current.mapPolygons.each((poly: any) => {
      const dataItem = poly.dataItem;
      if (dataItem && dataItem.dataContext) {
        const feature = dataItem.dataContext as FeatureWithDirectName;
        const id = feature.id ? feature.id.toString() : "";
        if (id === initialRegion) {
          poly.set("active", true);
          poly.set("fill", am5.color(PRIMARY_COLOR));
          previousSelectedItemRef.current = poly;
          setSelectedRegion({ id, name: feature.NAME_ENG || "" });
          const geoBounds = (am5map.getGeoBounds as any)(feature.geometry);
          if (geoBounds) {
            // Smooth zoom using only duration (no easing parameter)
            chartRef.current?.zoomToGeoBounds(geoBounds, 1000);
          }
        }
      }
    });
  }, [mapReady, initialRegion]);

  // -----------------------------------------------------------------------
  // Preselect city if initialCity is provided.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!mapReady || !initialCity) return;
    const cityName = initialCity;
    const cityFeature = cityPolygons.features.find(
      (f) => f.properties?.name === cityName
    );
    if (cityFeature) {
      setInCityMode(true);
      // Hide province layers.
      polygonSeriesRef.current?.set("visible", false);
      pointSeriesRef.current?.set("visible", false);
      regionLabelSeriesRef.current?.set("visible", false);
      // Show/update the city polygon layer.
      if (!cityPolygonSeriesRef.current) {
        cityPolygonSeriesRef.current = chartRef.current?.series.push(
          am5map.MapPolygonSeries.new(rootRef.current!, {
            geoJSON: cityFeature,
          })
        ) || null;
      } else {
        cityPolygonSeriesRef.current.set("geoJSON", cityFeature);
        cityPolygonSeriesRef.current.set("visible", true);
      }
      // Fully disable interactivity on the city polygon layer.
      if (cityPolygonSeriesRef.current) {
        const cityPolygonTemplate = cityPolygonSeriesRef.current.mapPolygons.template;
        cityPolygonTemplate.set("interactive", false);
        // Cast event names as any[] to bypass TS error.
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
      // Smoothly zoom to the city's center.
      const geometry = cityFeature.geometry;
      if (geometry) {
        const center = am5map.getGeoCentroid(geometry);
        if (center) {
          // Pass true for animate (no easing parameter)
          chartRef.current?.zoomToGeoPoint(center, 200, true);
        }
      }
      setSelectedRegion({ id: cityName, name: cityName });
      router.replace(`/IranMap?city=${cityName}`);
    }
  }, [mapReady, initialCity]);

  // -----------------------------------------------------------------------
  // Initialize the map (only once).
  // -----------------------------------------------------------------------
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

    // Province polygons.
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

    // Pointer events for province hover.
    polygonTemplate.events.on("pointerover", (ev: any) => {
      const polygon = ev.target;
      if (!polygon.get("active")) {
        polygon.animate({
          key: "fill",
          from: polygon.get("fill") || getNormalFill(),
          to: am5.color(PRIMARY_COLOR),
          duration: 200,
        });
      }
    });
    polygonTemplate.events.on("pointerout", (ev: any) => {
      const polygon = ev.target;
      if (!polygon.get("active")) {
        polygon.animate({
          key: "fill",
          from: polygon.get("fill") || getNormalFill(),
          to: getNormalFill(),
          duration: 200,
        });
      }
    });

    polygonTemplate.events.on("click", handleProvinceClick);

    // City points.
    const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
    pointSeriesRef.current = pointSeries;
    pointSeries.bullets.push(createCityBullet);
    pointSeries.set("visible", true);

    // Province labels.
    const regionLabelSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
    regionLabelSeries.bullets.push(createProvinceLabelBullet);
    regionLabelSeriesRef.current = regionLabelSeries;

    // Zoom control.
    const zoomControl = am5map.ZoomControl.new(root, {});
    chart.set("zoomControl", zoomControl);
    customizeZoomButtons(zoomControl);

    // Background click => deselect.
    const bg = chart.chartContainer.get("background");
    if (bg) {
      bg.events.on("click", () => {
        if (inCityMode) return;
        deselectAll();
      });
    }

    polygonSeries.events.on("datavalidated", () => {
      regionLabelSeries.data.clear();
      polygonSeries.dataItems.forEach((dataItem) => {
        const feature = dataItem.dataContext as FeatureWithDirectName;
        if (feature?.geometry) {
          const centroid = am5map.getGeoCentroid(feature.geometry);
          if (centroid) {
            const name = feature.NAME_ENG ?? "";
            regionLabelSeries.data.push({
              geometry: {
                type: "Point",
                coordinates: [centroid.longitude, centroid.latitude],
              },
              regionName: name,
            });
          }
        }
      });
    });

    updateCities(pointSeries);
    applyDarkModeStyling();
    chart.appear(1000, 100);

    setMapReady(true);

    return () => {
      root.dispose();
      rootRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Watch for theme changes.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new MutationObserver(() => {
      applyDarkModeStyling();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // -----------------------------------------------------------------------
  // applyDarkModeStyling: update colors based on theme.
  // -----------------------------------------------------------------------
  const applyDarkModeStyling = () => {
    if (!chartRef.current) return;
    const isDark = document.documentElement.classList.contains("dark");

    // Province polygons:
    if (polygonSeriesRef.current) {
      const polygonTemplate = polygonSeriesRef.current.mapPolygons.template;
      const normalFill = isDark ? am5.color(0xffffff) : am5.color(0x000000);
      polygonTemplate.setAll({
        fill: normalFill,
        stroke: am5.color(isDark ? 0x888888 : 0xd3d3d3),
        tooltipText: "{name}",
        interactive: true,
      });
      polygonSeriesRef.current.mapPolygons.each((poly: any) => {
        if (!poly.get("active")) {
          poly.set("fill", normalFill);
        } else {
          poly.set("fill", am5.color(PRIMARY_COLOR));
        }
      });
    }

    // Province labels:
    if (regionLabelSeriesRef.current) {
      regionLabelSeriesRef.current.dataItems.forEach((dataItem: any) => {
        const bullet = dataItem.bullets?.[0];
        if (bullet && bullet.get("sprite") instanceof am5.Label) {
          const label = bullet.get("sprite") as am5.Label;
          label.set("fill", am5.color(isDark ? 0x000000 : 0xffffff));
        }
      });
    }

    // City polygon layer:
    if (cityPolygonSeriesRef.current) {
      const cityPolygonTemplate = cityPolygonSeriesRef.current.mapPolygons.template;
      cityPolygonTemplate.setAll({
        fill: am5.color(isDark ? 0xf0f0f0 : 0x4a4a4a),
        stroke: am5.color(isDark ? 0x888888 : 0xd3d3d3),
        interactive: false,
      });
      cityPolygonSeriesRef.current.mapPolygons.each((poly: any) => {
        const newFill = am5.color(isDark ? 0xf0f0f0 : 0x4a4a4a);
        poly.animate({ key: "fill", from: poly.get("fill"), to: newFill, duration: 500 });
        poly.set("fill", newFill);
      });
    }
  };

  // -----------------------------------------------------------------------
  // createCityBullet: returns a pulsing city marker.
  // -----------------------------------------------------------------------
  const createCityBullet = () => {
    if (!rootRef.current) return;
    const container = am5.Container.new(rootRef.current!, {
      tooltipText: "{name}",
      cursorOverStyle: "pointer",
    });
    const bullet = am5.Bullet.new(rootRef.current!, { sprite: container });
    container.events.on("click", () => handleCityClick(container));
    const colorset = am5.ColorSet.new(rootRef.current!, {});
    const initialColor = colorset.next();
    const circle = container.children.push(
      am5.Circle.new(rootRef.current!, {
        radius: 4,
        fill: initialColor,
        strokeOpacity: 0,
      })
    );
    container.children.push(
      am5.Circle.new(rootRef.current!, {
        radius: 4,
        fill: initialColor,
        strokeOpacity: 0,
      })
    );
    const dataItem = container.dataItem;
    if (dataItem && dataItem.dataContext) {
      const city = dataItem.dataContext as CityData;
      cityOriginalColors.current.set(city.name, initialColor);
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
  };

  // -----------------------------------------------------------------------
  // createProvinceLabelBullet: returns a province label.
  // -----------------------------------------------------------------------
  const createProvinceLabelBullet = () => {
    if (!rootRef.current) return;
    const isDark = document.documentElement.classList.contains("dark");
    const labelFill = isDark ? 0x000000 : 0xffffff;
    return am5.Bullet.new(rootRef.current!, {
      sprite: am5.Label.new(rootRef.current!, {
        text: "{regionName}",
        populateText: true,
        fontSize: 10,
        centerX: am5.p50,
        centerY: am5.p50,
        fontWeight: "600",
        fill: am5.color(labelFill),
      }),
    });
  };

  // -----------------------------------------------------------------------
  // handleCityClick: when in city mode, clicking a city marker does nothing.
  // -----------------------------------------------------------------------
  const handleCityClick = (container: am5.Container) => {
    if (inCityMode) return; // Do nothing if already in city mode.
    const chart = chartRef.current;
    if (!chart) return;
    const dataItem = container.dataItem;
    if (!dataItem || !dataItem.dataContext) return;
    const city = dataItem.dataContext as CityData;
    const cityName = city.name;
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
      applyDarkModeStyling();
      const geometry = cityFeature.geometry;
      if (geometry) {
        const center = am5map.getGeoCentroid(geometry);
        if (center) {
          chart.zoomToGeoPoint(center, 200, true);
        }
      }
      setSelectedRegion({ id: cityName, name: cityName });
      setInCityMode(true);
      router.replace(`/IranMap?city=${cityName}`);
    }
  };

  // -----------------------------------------------------------------------
  // handleProvinceClick: toggle province selection.
  // -----------------------------------------------------------------------
  const handleProvinceClick = (ev: any) => {
    if (inCityMode) return;
    const chart = chartRef.current;
    if (!chart) return;
    const polygon = ev.target as am5map.MapPolygon;
    const dataItem = polygon.dataItem;
    if (!dataItem || !dataItem.dataContext) return;
    const feature = dataItem.dataContext as FeatureWithDirectName;
    const id = feature.id ? feature.id.toString() : "";
    const name = feature.NAME_ENG || "";

    if (polygon.get("active")) {
      polygon.set("active", false);
      chart.goHome();
      setSelectedRegion(null);
      previousSelectedItemRef.current = null;
      router.replace("/IranMap");
      return;
    }

    if (polygonSeriesRef.current) {
      const normalFill = getNormalFill();
      polygonSeriesRef.current.mapPolygons.each((poly: any) => {
        poly.set("active", false);
        poly.set("fill", normalFill);
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
    router.replace(`/IranMap?region=${id}`);
  };

  // -----------------------------------------------------------------------
  // deselectAll: clear province selection.
  // -----------------------------------------------------------------------
  const deselectAll = () => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.goHome();
    setSelectedRegion(null);
    router.replace("/IranMap");
    if (polygonSeriesRef.current) {
      const normalFill = getNormalFill();
      polygonSeriesRef.current.mapPolygons.each((poly: any) => {
        poly.set("active", false);
        poly.set("fill", normalFill);
      });
    }
    previousSelectedItemRef.current = null;
  };

  // -----------------------------------------------------------------------
  // updateCities: load city markers.
  // -----------------------------------------------------------------------
  const updateCities = (pointSeries: am5map.MapPointSeries) => {
    pointSeries.data.setAll([]);
    const allCities = cities as CityData[];
    const filtered = allCities.filter((c) =>
      citylist.some((x) => x.Name === c.name)
    );
    filtered.forEach((city) => {
      pointSeries.data.push({
        geometry: { type: "Point", coordinates: [city.long, city.lat] },
        name: city.name,
      });
    });
    pointSeries.set("visible", true);
  };

  // -----------------------------------------------------------------------
  // handleBackButtonClick: exit city mode and restore province view.
  // -----------------------------------------------------------------------
  const handleBackButtonClick = () => {
    const chart = chartRef.current;
    if (!chart) return;
    if (cityPolygonSeriesRef.current) {
      cityPolygonSeriesRef.current.set("visible", false);
    }
    polygonSeriesRef.current?.set("visible", true);
    pointSeriesRef.current?.set("visible", true);
    regionLabelSeriesRef.current?.set("visible", true);
    chart.goHome();
    if (polygonSeriesRef.current) {
      const normalFill = getNormalFill();
      polygonSeriesRef.current.mapPolygons.each((poly: any) => {
        poly.set("active", false);
        poly.set("fill", normalFill);
      });
    }
    previousSelectedItemRef.current = null;
    setSelectedRegion(null);
    setInCityMode(false);
    router.replace("/IranMap");
  };

  // -----------------------------------------------------------------------
  // Render.
  // -----------------------------------------------------------------------
  return (
    <div className="relative w-full h-[500px]">
      <div id="chartdiv" className="w-full h-full"></div>
      {inCityMode && (
        <button
          className="absolute top-2 left-2 z-10 bg-white dark:bg-gray-900 dark:text-white p-2 rounded"
          onClick={handleBackButtonClick}
        >
          Back
        </button>
      )}
      <div className="absolute bottom-2 left-2 z-10 mt-2">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg">
          <h5 className="font-semibold">
            Selected Region: {selectedRegion ? selectedRegion.name : "None"}
          </h5>
          <p className="text-sm">
            ID: {selectedRegion ? selectedRegion.id : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// customizeZoomButtons: style the zoom controls.
function customizeZoomButtons(zoomControl: am5map.ZoomControl) {
  const PRIMARY_COLOR = 0xffcc01;
  const customizeZoomButton = (button: am5.Button) => {
    const background = button.get("background") as am5.Rectangle;
    if (background) {
      background.setAll({ fill: am5.color(PRIMARY_COLOR) });
      background.states.create("hover", { fill: am5.color(0xffe680) });
      background.states.create("active", { fill: am5.color(PRIMARY_COLOR) });
      background.states.create("down", { fill: am5.color(PRIMARY_COLOR) });
    }
  };
  customizeZoomButton(zoomControl.plusButton);
  customizeZoomButton(zoomControl.minusButton);
  if (zoomControl.homeButton) {
    const homeBackground = zoomControl.homeButton.get("background");
    if (homeBackground) {
      homeBackground.setAll({ fill: am5.color(PRIMARY_COLOR) });
      homeBackground.states.create("hover", { fill: am5.color(0xffe680) });
      homeBackground.states.create("active", { fill: am5.color(PRIMARY_COLOR) });
      homeBackground.states.create("down", { fill: am5.color(PRIMARY_COLOR) });
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

export default IranMap;
