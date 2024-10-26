"use client";
import React, { useEffect, useState, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import iranGeoData from "@amcharts/amcharts5-geodata/iranHigh";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Feature, Geometry } from "geojson";
import cities from "@/data/cities.json";
import cityPolygons from "@/data/cityPolygons";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";

interface RegionData {
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

const IranMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const selectedRegionRef = useRef<RegionData | null>(null);
  const chartRef = useRef<am5map.MapChart | null>(null);
  const previousSelectedItemRef = useRef<am5map.MapPolygon | am5.Bullet | null>(
    null
  );

  const [inCityMode, setInCityMode] = useState(false);
  const inCityModeRef = useRef(false);

  const citylist = useFTTHCitiesStore((state) => state.cities);

  const cityOriginalColors = useRef<Map<string, am5.Color>>(new Map());

  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const pointSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const cityPolygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);

  useEffect(() => {
    selectedRegionRef.current = selectedRegion;
  }, [selectedRegion]);

  useEffect(() => {
    inCityModeRef.current = inCityMode;
  }, [inCityMode]);

  const handleBackButtonClick = () => {
    const chart = chartRef.current;
    if (!chart) return;

    // Hide cityPolygonSeries
    if (cityPolygonSeriesRef.current) {
      cityPolygonSeriesRef.current.set("visible", false);
    }

    // Show Iran map polygons and city points
    if (polygonSeriesRef.current) {
      polygonSeriesRef.current.set("visible", true);
    }
    if (pointSeriesRef.current) {
      pointSeriesRef.current.set("visible", true);
    }

    // Zoom out
    chart.goHome();

    // Update selected region
    setSelectedRegion(null);

    // Update inCityMode
    setInCityMode(false);
  };

  useEffect(() => {
    const root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);
    root._logo?.dispose();
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
        wheelY: "zoom",
        // Increase maxZoomLevel to allow for closer zooming
        maxZoomLevel: 200,
        background: am5.Rectangle.new(root, {
          fillOpacity: 0,
        }),
      })
    );

    chartRef.current = chart;

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: iranGeoData,
      })
    );
    polygonSeriesRef.current = polygonSeries;

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0x4a4a4a),
      stroke: am5.color(0xd3d3d3),
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0xffcc01),
    });

    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(0xffcc01),
    });

    polygonSeries.mapPolygons.template.events.on("click", (ev) => {
      if (inCityModeRef.current) {
        // Do nothing if in city mode
        return;
      }

      const polygon = ev.target as am5map.MapPolygon;
      const dataItem = polygon.dataItem;

      if (dataItem && dataItem.dataContext) {
        const feature = dataItem.dataContext as FeatureWithDirectName;
        const id = feature.id ? feature.id.toString() : "";
        const name = feature.NAME_ENG || "";
        const data: RegionData = { id, name };

        const currentSelectedRegion = selectedRegionRef.current;

        if (currentSelectedRegion && currentSelectedRegion.id === data.id) {
          polygon.set("active", false);
          chart.goHome();
          setSelectedRegion(null);
          previousSelectedItemRef.current = null;
        } else {
          if (previousSelectedItemRef.current) {
            if (previousSelectedItemRef.current instanceof am5map.MapPolygon) {
              previousSelectedItemRef.current.set("active", false);
            } else if (previousSelectedItemRef.current instanceof am5.Bullet) {
              const bulletPrev = previousSelectedItemRef.current;
              const containerPrev = bulletPrev.get("sprite") as am5.Container;
              const prevCityName = (
                containerPrev.dataItem?.dataContext as CityData
              )?.name;
              if (
                prevCityName &&
                cityOriginalColors.current.has(prevCityName)
              ) {
                containerPrev.children.each((child) => {
                  if (child instanceof am5.Circle) {
                    child.set(
                      "fill",
                      cityOriginalColors.current.get(prevCityName)
                    );
                  }
                });
              }
            }
          }

          polygon.set("active", true);
          previousSelectedItemRef.current = polygon;

          const geometry = feature.geometry;
          if (geometry) {
            const geoBounds = am5map.getGeoBounds(geometry);
            chart.zoomToGeoBounds(geoBounds, 1000);
          }

          setSelectedRegion(data);
        }
      }
    });

    const zoomControl = am5map.ZoomControl.new(root, {});
    chart.set("zoomControl", zoomControl);

    const customizeZoomButton = (button: am5.Button) => {
      const background = button.get("background") as am5.Rectangle;
      if (background) {
        background.setAll({
          fill: am5.color(0xffcc01),
        });
        background.states.create("hover", {
          fill: am5.color(0xffe680),
        });
        background.states.create("active", {
          fill: am5.color(0xffcc01),
        });
        background.states.create("down", {
          fill: am5.color(0xffcc01),
        });
      }
    };

    customizeZoomButton(zoomControl.plusButton);
    customizeZoomButton(zoomControl.minusButton);

    if (zoomControl.homeButton) {
      const homeBackground = zoomControl.homeButton.get(
        "background"
      ) as am5.Rectangle;
      if (homeBackground) {
        homeBackground.setAll({
          fill: am5.color(0xffcc01),
        });
        homeBackground.states.create("hover", {
          fill: am5.color(0xffe680),
        });
        homeBackground.states.create("active", {
          fill: am5.color(0xffcc01),
        });
        homeBackground.states.create("down", {
          fill: am5.color(0xffcc01),
        });
      }

      zoomControl.homeButton.children.clear();
      zoomControl.homeButton.children.push(
        am5.Graphics.new(root, {
          svgPath: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
          fill: am5.color(0x000000),
          centerX: am5.p50,
          centerY: am5.p50,
          width: 16,
          height: 16,
        })
      );
    }

    const background = chart.chartContainer.get("background") as
      | am5.Rectangle
      | undefined;
    if (background) {
      background.setAll({ fillOpacity: 0 });
      background.events.on("click", () => {
        if (inCityModeRef.current) {
          // Do nothing in city mode
          return;
        }

        chart.goHome();
        setSelectedRegion(null);
        if (previousSelectedItemRef.current) {
          if (previousSelectedItemRef.current instanceof am5map.MapPolygon) {
            previousSelectedItemRef.current.set("active", false);
          } else if (previousSelectedItemRef.current instanceof am5.Bullet) {
            const bulletPrev = previousSelectedItemRef.current;
            const containerPrev = bulletPrev.get("sprite") as am5.Container;
            const prevCity = containerPrev.dataItem?.dataContext as CityData;
            if (prevCity && cityOriginalColors.current.has(prevCity.name)) {
              containerPrev.children.each((child) => {
                if (child instanceof am5.Circle) {
                  child.set(
                    "fill",
                    cityOriginalColors.current.get(prevCity.name)
                  );
                }
              });
            }
          }
          previousSelectedItemRef.current = null;
        }
      });
    }

    const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
    pointSeriesRef.current = pointSeries;
    const colorset = am5.ColorSet.new(root, {});

    pointSeries.bullets.push(() => {
      const container = am5.Container.new(root, {
        tooltipText: "{name}",
        cursorOverStyle: "pointer",
      });

      const bullet = am5.Bullet.new(root, { sprite: container });

      container.events.on("click", () => {
        if (inCityModeRef.current) {
          return;
        }

        const dataItem = container.dataItem;
        if (!dataItem || !dataItem.dataContext) return;

        const city = dataItem.dataContext as CityData;
        const cityName = city.name;

        const cityPolygonFeature = cityPolygons.features.find(
          (feature) => feature.properties?.name === cityName
        );

        if (cityPolygonFeature) {
          if (polygonSeriesRef.current) {
            polygonSeriesRef.current.set("visible", false);
          }
          if (pointSeriesRef.current) {
            pointSeriesRef.current.set("visible", false);
          }

          if (!cityPolygonSeriesRef.current) {
            cityPolygonSeriesRef.current = chart.series.push(
              am5map.MapPolygonSeries.new(root, {
                geoJSON: cityPolygonFeature,
              })
            );

            cityPolygonSeriesRef.current.mapPolygons.template.setAll({
              fill: am5.color(0x4a4a4a),
              stroke: am5.color(0xd3d3d3),
              interactive: false,
            });
          } else {
            cityPolygonSeriesRef.current.set("geoJSON", cityPolygonFeature);
            cityPolygonSeriesRef.current.set("visible", true);
          }

          const cityGeometry = cityPolygonFeature.geometry;
          if (cityGeometry) {
            const center = am5map.getGeoCentroid(cityGeometry);
            if (center) {
              // Adjust the zoom level as needed (higher number = closer zoom)
              chart.zoomToGeoPoint(center, 100, true); // Increased zoom level
            }
          }

          // Update selected region
          setSelectedRegion({ id: cityName, name: cityName });

          // Set inCityMode
          setInCityMode(true);
        }
      });

      const initialColor = colorset.next();
      const circle = container.children.push(
        am5.Circle.new(root, {
          radius: 4,
          fill: initialColor,
          strokeOpacity: 0,
        })
      );

      const circle2 = container.children.push(
        am5.Circle.new(root, {
          radius: 4,
          fill: initialColor,
          strokeOpacity: 0,
        })
      );

      pointSeries.events.on("datavalidated", () => {
        const dataItem = container.dataItem;
        if (dataItem && dataItem.dataContext) {
          const city = dataItem.dataContext as CityData;
          cityOriginalColors.current.set(city.name, initialColor);
        }
      });

      circle.animate({
        key: "scale",
        from: 1,
        to: 5,
        duration: 600,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity,
      });
      circle.animate({
        key: "opacity",
        from: 1,
        to: 0.1,
        duration: 600,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity,
      });

      return bullet;
    });

    const updateCities = () => {
      pointSeries.data.setAll([]);

      const citiesData: CityData[] = cities;
      const filteredCities = citiesData.filter((city) =>
        citylist.some((listedCity) => listedCity.Name === city.name)
      );

      filteredCities.forEach((city) => {
        pointSeries.data.push({
          geometry: { type: "Point", coordinates: [city.long, city.lat] },
          name: city.name,
        });
      });
    };

    updateCities();

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [citylist]);

  return (
    <div className="relative w-full h-[500px]">
      <div id="chartdiv" className="w-full h-full"></div>

      {inCityMode && (
        <button
          className="absolute top-2 left-2 z-10 bg-white p-2 rounded"
          onClick={handleBackButtonClick}
        >
          Back
        </button>
      )}

      <div className="absolute bottom-2 left-2 z-10 mt-2 text-gray-800 dark:text-white">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg">
          <h5 className="font-semibold text-gray-900 dark:text-gray-100">
            Selected Region: {selectedRegion ? selectedRegion.name : "None"}
          </h5>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ID: {selectedRegion ? selectedRegion.id : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IranMap;
