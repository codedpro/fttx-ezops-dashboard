import { useAlarmsStore } from "@/store/FTTHOLTAlarmsStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";

export const useOLTDownSiteAlarmLayer = () => {
  const alarms = useAlarmsStore((state) => state.alarms);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const downSiteAlarms = alarms.filter(
      (alarm) => alarm.Alarm_Type === "Down Site"
    );

    if (downSiteAlarms.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: downSiteAlarms.map(
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
              icon: "DownSiteIcon",
              iconSize: 0.05,
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
    id: "olt-down-site-alarm-layer",
    source,
    visible: true,
    type: "point" as const,
    icons: { DownSiteIcon: "/images/map/DownSiteAlarm.png" },
  };
};
