import { create } from "zustand";
import axios from "axios";
import { FTTHCity } from "@/types/FTTHCities";

interface FTTHCitiesState {
  cities: FTTHCity[];
  error: string | null;
  isLoading: boolean;
  fetchingInProgress: boolean;
  autoFetching: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  forceUpdate: (token: string) => void;
}

export const useFTTHCitiesStore = create<FTTHCitiesState>((set, get) => ({
  cities: [],
  error: null,
  isLoading: false,
  fetchingInProgress: false,
  autoFetching: false,

  startFetching: (token: string) => {
    if (get().fetchingInProgress) return;

    set({ isLoading: true, error: null, fetchingInProgress: true });

    const fetchCities = async () => {
      try {
        const url = '/api';
        const config = {
          method: "get",
          maxBodyLength: Infinity,
          url: url + "/FTTHCities",
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
      } finally {
        set({ fetchingInProgress: false });
      }
    };

    // Set up auto-fetching
    fetchCities();
    const intervalId = setInterval(() => {
      set({ autoFetching: true });
      fetchCities();
    }, 600000); // 10 minutes interval

    set({
      stopFetching: () => {
        clearInterval(intervalId);
        set({ autoFetching: false, fetchingInProgress: false });
      },
    });
  },

  stopFetching: () => {
    set({ cities: [], isLoading: false, error: null });
  },

  forceUpdate: (token: string) => {
    get().startFetching(token);
  },
}));
