export interface ExportItemType {
  id: number;
  name: string;
  category: string;
  isCity: boolean;
  isNumberParameter: boolean;
  isPlanStatus: boolean;
  numberParameters: number[] | null;
  planStatus: string[] | null;
  cities: string[] | null;
  persian_Name: string;
}

export interface ExportData {
  [category: string]: ExportItemType[];
}

export interface ExportParams {
  id: number;
  city?: string;
  numberParameter?: number;
  planStatus?: string;
}

export interface ExportResponse {
  [sheetName: string]: any[];
}
