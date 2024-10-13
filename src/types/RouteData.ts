export interface RouteData {
  StartPointId: number;
  StartPointType: string;
  StartPointName: string;
  EndPointId: number;
  EndPointType: string;
  EndPointName: string;
  LineType: string;
  Lines: {
    Lat: number;
    Long: number;
  }[];
}
