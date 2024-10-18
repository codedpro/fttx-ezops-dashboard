"use client";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_iranHigh from "@amcharts/amcharts5-geodata/iranHigh";
import React, { useEffect, useState } from "react";

interface ProvinceData {
  id: string;
  name: string;
  value: number;
  dummyValue: number;
}

const IranMap = () => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [dummyResult, setDummyResult] = useState<{ name: string; value: number }>({
    name: "Tehran",
    value: 100,
  });

  useEffect(() => {
    let root = am5.Root.new("chartdiv");

    root.setThemes([am5.Theme.new(root)]);

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoMercator(),
      })
    );

    let provinceSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_iranHigh,
        valueField: "dummyValue",
        calculateAggregates: true,
      })
    );

    provinceSeries.mapPolygons.template.setAll({
      fill: am5.color(0x74c476),
      tooltipText: "{name}: {value}",
      interactive: true,
    });

    let currentlySelectedPolygon: am5map.MapPolygon | null = null;

    provinceSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;

      if (dataItem && dataItem.dataContext) {
        const data = dataItem.dataContext as ProvinceData;
        
        // Deselect if already selected
        if (selectedProvince === data.id) {
          deselectProvince();
        } else {
          zoomToProvince(ev.target, chart, data);
        }
      }
    });

    function zoomToProvince(
      provincePolygon: am5map.MapPolygon,
      chart: am5map.MapChart,
      data: ProvinceData
    ) {
      if (currentlySelectedPolygon) {
        currentlySelectedPolygon.set("fill", am5.color(0x74c476)); // Reset previous province color
      }

      const center = provincePolygon.geoCentroid();
      if (center) {
        chart.zoomToGeoPoint(center, 5); // Zoom to the province's center with zoom level 5
      }

      provincePolygon.set("fill", am5.color(0xFF0000)); // Highlight the province
      currentlySelectedPolygon = provincePolygon;

      // Set selected province and dummy results
      setSelectedProvince(data.id);
      setDummyResult({ name: data.name, value: data.dummyValue });
    }

    function deselectProvince() {
      if (currentlySelectedPolygon) {
        currentlySelectedPolygon.set("fill", am5.color(0x74c476)); // Reset color
        currentlySelectedPolygon = null;
        chart.goHome(); // Zoom out to the full map view
        setSelectedProvince(null);
        setDummyResult({ name: "None", value: 0 }); // Reset dummy result
      }
    }

    return () => {
      root.dispose();
    };
  }, [selectedProvince]);

  return (
    <div className="col-span-12 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <h4 className="mb-7 text-body-2xlg font-bold text-dark dark:text-white">
        Region labels
      </h4>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>

      {/* Display dummy values outside the map */}
      <div className="mt-5">
        <h5>Selected Province: {dummyResult.name}</h5>
        <p>Value: {dummyResult.value}</p>
      </div>
    </div>
  );
};

export default IranMap;
