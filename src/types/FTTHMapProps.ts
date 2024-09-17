import { GeoJSONSourceSpecification } from "mapbox-gl";
export interface FTTHMapProps {
  layers: Array<{
    id: string;
    source: GeoJSONSourceSpecification | null;
    visible: boolean;
    type: "point" | "line" | "heatmap" | "fill";
    icons?: { [key: string]: string };
    paint?: {
      "line-color"?: string;
      "line-width"?: number;
      "line-opacity"?: number;
      "heatmap-intensity"?: number;
      "heatmap-radius"?: number;
      "heatmap-opacity"?: number;
      "heatmap-color"?: [string, ...any[]];
    };
  }>;
  mapStyle: string;
  zoomLocation: { lat: number; lng: number; zoom: number } | null;
  onEdit: (point: any) => void;
  isEditMode: boolean;
  onCoordinatesChange: (
    coordinates: { lat: number; lng: number } | null
  ) => void;
  onPathPanelChange: (isOpen: boolean, path: any) => void;
}
