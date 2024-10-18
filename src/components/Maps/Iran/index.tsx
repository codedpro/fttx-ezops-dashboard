import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_iranHigh from "@amcharts/amcharts5-geodata/iranHigh"; // Iran provinces data
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import React, { useEffect } from "react";

interface ProvinceData {
  id: string;
  name: string;
  value: number;
  dummyValue: number;
}

const IranMap = () => {
  useEffect(() => {
    // Create root element
    let root = am5.Root.new("chartdiv");

    // Set themes
    root.setThemes([am5.Theme.new(root)]);

    // Create the map chart
    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        projection: am5map.geoMercator(),
      })
    );

    // Add world series for Iran
    let worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
      })
    );

    worldSeries.mapPolygons.template.setAll({
      fill: am5.color(0x999999),
      tooltipText: "{name}",
    });

    // Add series for Iran
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

    // Dummy data for provinces
    provinceSeries.data.setAll([
      { id: "IR-01", value: 10, name: "Tehran", dummyValue: 100 },
      { id: "IR-02", value: 20, name: "Isfahan", dummyValue: 50 },
      // Add more provinces...
    ]);

    // Handle click on provinces
    provinceSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;

      // Ensure dataItem is defined and dataContext has expected structure
      if (dataItem && dataItem.dataContext) {
        const data = dataItem.dataContext as ProvinceData; // Type assertion
        displayCityLevel(data.name, data.id); // Call function to handle city-level details
      }
    });

    // Function to switch to city level
    function displayCityLevel(provinceName: string, provinceId: string) {
      // Remove previous province-level data and show city data
      provinceSeries.hide(0);

      // Dummy data for cities of the province
      let citySeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata_iranHigh, // Replace with city-level data
        })
      );

      citySeries.mapPolygons.template.setAll({
        fill: am5.color(0x37a2da),
        tooltipText: "{name}: {value}",
        interactive: true,
      });

      // Example cities
      citySeries.data.setAll([
        { id: "IR-TEH-001", value: 30, name: "Tehran City", dummyValue: 30 },
        { id: "IR-TEH-002", value: 40, name: "Karaj", dummyValue: 40 },
        // Add more cities
      ]);
    }

    // Clean up on unmount
    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div className="col-span-12 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <h4 className="mb-7 text-body-2xlg font-bold text-dark dark:text-white">
        Region labels
      </h4>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>{" "}
    </div>
  );
};

export default IranMap;
