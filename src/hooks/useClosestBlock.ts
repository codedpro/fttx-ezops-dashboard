// hooks/useClosestBlock.ts
import { useState } from "react";
import axios from "axios";

// If you have a dedicated userService or some method of retrieving the token:
import { UserService } from "@/services/userService";

interface ClosestBlockResult {
  id: number;
  blockId: number;
  stateName: string;
  parish: string;
  avenueTypeName: string;
  avenue: string;
  preAvenTypeName: string;
  preAven: string;
  floorNo: number;
  locationType: string;
  locationName: string;
  plateNo: string | null;
  unit: string | null;
  activity: string | null;
  buildingName: string | null;
  buildingType: string | null;
  entrance: string | null;
  address: string;
}

export function useClosestBlock() {
  const [data, setData] = useState<ClosestBlockResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const userService = new UserService(); // or however you fetch your token

  const fetchClosestBlock = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post<ClosestBlockResult[]>(
        "http://localhost:5231/api/ExternalApiGetClosestBlockByPoint",
        {
          latitude,
          longitude,
        },
        {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${userService.getToken()}`,
            "Content-Type": "application/json-patch+json",
          },
        }
      );
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchClosestBlock,
  };
}
