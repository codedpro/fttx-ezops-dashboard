import { Feature, Geometry } from "geojson";

/** Defines the shape of a region's data. */
export interface RegionData {
  id: string;
  name: string;
}

/** Augments the GeoJSON Feature with an optional name field. */
export interface FeatureWithDirectName extends Feature<Geometry> {
  NAME_ENG?: string;
}

/** Basic city data including name and coordinates. */
export interface CityData {
  name: string;
  lat: number;
  long: number;
}

/** Defines optional props for the IranMap component. */
export interface IranMapProps {
  initialRegion?: string | null;
  initialCity?: string | null;
}
