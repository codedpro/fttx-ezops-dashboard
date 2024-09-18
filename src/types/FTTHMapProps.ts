import { GeoJSONSourceSpecification } from "mapbox-gl";

export type GeoJSONSourceType = GeoJSONSourceSpecification | null;

export interface LayerPaint {
  "line-color"?: string;
  "line-width"?: number;
  "line-opacity"?: number;
  "heatmap-intensity"?: number;
  "heatmap-radius"?: number;
  "heatmap-opacity"?: number;
  "heatmap-color"?: [string, ...any[]];
}

export interface LayerType {
  id: string;
  source: GeoJSONSourceType;
  visible: boolean;
  type: "point" | "line" | "heatmap" | "fill";
  icons?: { [key: string]: string };
  paint?: LayerPaint;
}

export interface ZoomLocation {
  lat: number;
  lng: number;
  zoom: number;
}

export interface FTTHMapProps {
  layers: Array<LayerType>;
  mapStyle: string;
  zoomLocation: ZoomLocation | null;
  onEdit: (point: any) => void;
  isEditMode: boolean;
  onCoordinatesChange: (
    coordinates: { lat: number; lng: number } | null
  ) => void;
  onPathPanelChange: (isOpen: boolean, path: any) => void;
}
