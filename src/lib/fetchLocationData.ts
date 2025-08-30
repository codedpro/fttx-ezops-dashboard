import axios from "axios";
import { NominatimResponse } from "../types/nominatim";

export const fetchLocationData = async (
  query: string,
  viewbox: string,
  bounded: boolean = false
): Promise<NominatimResponse[]> => {
  try {
    const response = await axios.get<NominatimResponse[]>(
      "/api/nominatim/search",
      {
        params: {
          q: query,
          viewbox: viewbox,
          format: "json",
          bounded: bounded ? 1 : 0,
          limit: 40,
        },
      }
    );
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Nominatim:", error);
    throw error;
  }
};
