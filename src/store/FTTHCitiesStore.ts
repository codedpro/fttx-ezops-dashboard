import { create } from "zustand";
import axios from "axios";
import { FTTHCity } from "@/types/FTTHCities";

interface FTTHCitiesState {
  cities: FTTHCity[];
  error: string | null;
  isLoading: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  forceUpdate: (token: string) => void;
}

export const useFTTHCitiesStore = create<FTTHCitiesState>((set, get) => ({
  cities: [],
  error: null,
  isLoading: false,

  startFetching: (token: string) => {
    set({ isLoading: true, error: null });

    const fetchCities = async () => {
      try {
        const config = {
          method: "get",
          maxBodyLength: Infinity,
          url: "http://10.131.58.190:2002/api/FTTHCities",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.request(config);
        const cities: FTTHCity[] = response.data;

        if (Array.isArray(cities)) {
          set({ cities, isLoading: false });
        } else {
          throw new Error("Invalid data format: expected an array of cities");
        }
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      }
    };

    fetchCities();
  },

  stopFetching: () => {
    set({ cities: [], isLoading: false, error: null });
  },

  forceUpdate: (token: string) => {
    get().startFetching(token);
  },
}));
