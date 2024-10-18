"use client";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_iranHigh from "@amcharts/amcharts5-geodata/iranHigh";
import React, { useEffect, useState } from "react";

interface RegionData {
  id: string;
  name: string;
  dummyValue: number;
}

const provinceValues: { [key: string]: number } = {
  "IR-01": 20,
  "IR-02": 15,
  "IR-03": 10,
  "IR-16": 25,
  "IR-17": 18,
  "IR-05": 22,
  // Add all other provinces with their respective values
};

const IranMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  useEffect(() => {
    let root = am5.Root.new("chartdiv");
    root.setThemes([am5.Theme.new(root)]);

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoMercator(),
        panX: "rotateX",
        panY: "translateY",
        background: am5.Rectangle.new(root, {
          fill: am5.color(0x1e1e1e),
          fillOpacity: 1,
        }),
      })
    );

    const data = am5geodata_iranHigh.features.map((feature: any) => ({
      geometry: feature.geometry,
      id: feature.id,
      name: feature.properties.name,
      dummyValue: provinceValues[feature.id] || 0,
    }));

    let provinceSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        calculateAggregates: true,
        valueField: "dummyValue",
        geoJSON: { type: "FeatureCollection", features: [] },
      })
    );

    provinceSeries.set("geometryField", "geometry");
    provinceSeries.data.setAll(data);

    provinceSeries.mapPolygons.template.setAll({
      fill: am5.color(0x2d2d2d),
      stroke: am5.color(0x121212),
      tooltipText: "{name}: {dummyValue}",
      interactive: true,
    });

    // Enable tooltips
    provinceSeries.mapPolygons.template.set("tooltip", am5.Tooltip.new(root, {}));

    let currentlySelectedPolygon: am5map.MapPolygon | null = null;

    // Function to reset the fill of all provinces to the default color
    function resetProvinceColors() {
      provinceSeries.mapPolygons.each((polygon) => {
        polygon.set("fill", am5.color(0x2d2d2d)); // Default color for unselected polygons
      });
    }

    provinceSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;
      if (dataItem) {
        const dataContext = dataItem.dataContext as RegionData;
        handleProvinceClick(ev.target, chart, dataContext);
      }
    });

    function handleProvinceClick(
      provincePolygon: am5map.MapPolygon,
      chart: am5map.MapChart,
      data: RegionData
    ) {
      if (selectedRegion && selectedRegion.id === data.id) {
        deselectRegion();
        return;
      }

      resetProvinceColors(); // Reset all province colors before highlighting the selected one

      // Highlight the selected province
      provincePolygon.set("fill", am5.color(0xffcb00));
      currentlySelectedPolygon = provincePolygon;

      // Zoom into the selected province
      const center = provincePolygon.geoCentroid();
      if (center) {
        chart.zoomToGeoPoint(center, 5, true);
      }

      // Update the selected region state
      setSelectedRegion(data);
    }

    function deselectRegion() {
      resetProvinceColors(); // Reset the fill color of all provinces

      // Zoom out to the full map view
      chart.goHome();
      setSelectedRegion(null);
    }

    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div className="col-span-12 rounded-[10px] bg-dark p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <h4 className="mb-7 text-body-2xlg font-bold text-white">Region labels</h4>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
      <div className="mt-5 text-white">
        <h5>Selected Region: {selectedRegion ? selectedRegion.name : "None"}</h5>
        <p>Value: {selectedRegion ? selectedRegion.dummyValue : "N/A"}</p>
      </div>
    </div>
  );
};

export default IranMap;
