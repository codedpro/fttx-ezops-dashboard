// lib/fetchPOISearch.ts
import axios from "axios";
import { POISearchResponse } from "@/types/poisearch";
import { UserService } from "@/services/userService";

interface POISearchParams {
  north: number;
  south: number;
  west: number;
  east: number;
  q: string;
}

export const fetchPOISearch = async (
  params: POISearchParams
): Promise<POISearchResponse[]> => {
  const userService = new UserService();
  const token = userService.getToken();
  const response = await axios.post<POISearchResponse[]>(
    "https://fttx.mtnirancell.ir/backend/api/poisearch",
    params,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
