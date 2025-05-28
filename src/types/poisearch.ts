// types/poisearch.ts
export interface POISearchResponse {
  activity: string;
  city: string;
  province: string;
  location: {
    lat: number;
    lon: number;
  };
}
