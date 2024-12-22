import { useAlarmsStore } from "@/store/FTTHOLTAlarmsStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";

export const useOLTPowerAlarmLayer = () => {
  const alarms = useAlarmsStore((state) => state.alarms);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const powerAlarms = alarms.filter((alarm) => alarm.Alarm_Type === "Power");

    if (powerAlarms.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: powerAlarms.map(
          (alarm): Feature => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [Number(alarm.Long), Number(alarm.Lat)],
            },
            properties: {
              ID: alarm.ID,
              SiteID: alarm.SiteID,
              Alarm_Name: alarm.Alarm_Name,
              Alarm_Time: alarm.Alarm_Time,
              Alarm_Type: alarm.Alarm_Type,
              Lat: alarm.Lat,
              Long: alarm.Long,
              icon: "PowerIcon",
              iconSize: 1.0,
            },
          })
        ),
      };

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [alarms]);

  return {
    id: "olt-power-alarm-layer",
    source,
    visible: true,
    type: "point" as const,
    icons: { PowerIcon: "/images/map/PowerAlarm.png" },
  };
};
