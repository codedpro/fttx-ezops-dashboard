import { create } from "zustand";
import { FTTHPreorder } from "../types/FTTHPreorder";

interface FTTHPreordersState {
  preorders: FTTHPreorder[];
  error: string | null;
  isLoading: boolean;
  fetchingInProgress: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  hasStarted: boolean;
}

export const useFTTHPreordersStore = create<FTTHPreordersState>((set, get) => ({
  preorders: [],
  error: null,
  isLoading: false,
  fetchingInProgress: false,
  hasStarted: false,
  startFetching: (token: string) => {
    if (get().hasStarted) return;

    set({ isLoading: true, error: null, hasStarted: true });

    const fetchPreorders = async () => {
      if (get().fetchingInProgress) return;

      set({ fetchingInProgress: true });

      try {
        const url = process.env.NEXT_PUBLIC_LNM_API_URL;
        const response = await fetch(url + "/FTTHPreorders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const textData = await response.text();

        let data: FTTHPreorder[];

        try {
          data = JSON.parse(textData);
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        } catch (parseError: any) {
          throw new Error("Failed to parse JSON data: " + parseError.message);
        }

        if (Array.isArray(data)) {
          set({ preorders: data, isLoading: false });
        } else {
          throw new Error(
            "Invalid data format: expected an array of preorders"
          );
        }
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      } finally {
        set({ fetchingInProgress: false });
      }
    };

    fetchPreorders();
    const intervalId = setInterval(fetchPreorders, 300000);
    set({ stopFetching: () => clearInterval(intervalId) });
  },
  stopFetching: () => {
    set({ hasStarted: false, fetchingInProgress: false });
  },
}));
