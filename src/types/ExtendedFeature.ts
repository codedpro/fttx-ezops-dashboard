import { Feature, Geometry, GeoJsonProperties } from "geojson";

export interface ExtendedFeature extends Feature<Geometry, GeoJsonProperties> {
  source: string;
}
