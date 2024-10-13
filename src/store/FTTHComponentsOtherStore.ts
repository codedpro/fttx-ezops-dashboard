import { create } from "zustand";
import { FTTHOtherComponent } from "../types/FTTHOtherComponent";

interface FTTHOtherComponentsState {
  others: FTTHOtherComponent[];
  error: string | null;
  isLoading: boolean;
  fetchingInProgress: boolean;
  autoFetching: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  forceUpdate: (token: string) => void;
  hasStarted: boolean;
}

export const useFTTHComponentsOtherStore = create<FTTHOtherComponentsState>(
  (set, get) => ({
    others: [],
    error: null,
    isLoading: false,
    fetchingInProgress: false,
    autoFetching: false,
    hasStarted: false,

    startFetching: (token: string) => {
      if (get().hasStarted) return;

      set({ isLoading: true, error: null, hasStarted: true });

      const fetchOthers = async () => {
        if (get().fetchingInProgress) return;

        set({ fetchingInProgress: true });

        try {
          const url = process.env.NEXT_PUBLIC_LNM_API_URL;
          const response = await fetch(url + "/FTTHComponents/?id=OTHER", {
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

          let data: FTTHOtherComponent[];

          try {
            data = JSON.parse(textData);
            if (typeof data === "string") {
              data = JSON.parse(data);
            }
          } catch (parseError: any) {
            throw new Error("Failed to parse JSON data: " + parseError.message);
          }

          if (Array.isArray(data)) {
            set({ others: data, isLoading: false });
          } else {
            throw new Error(
              "Invalid data format: expected an array of OTHER components"
            );
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        } finally {
          set({ fetchingInProgress: false });
        }
      };

      // Set up auto-fetching
      fetchOthers();
      const intervalId = setInterval(() => {
        set({ autoFetching: true }); // Mark as auto-fetching
        fetchOthers();
      }, 600000); // 10 minutes

      set({
        stopFetching: () => {
          clearInterval(intervalId);
          set({ autoFetching: false, hasStarted: false });
        },
      });
    },

    stopFetching: () => {
      set({ hasStarted: false, fetchingInProgress: false });
    },

    // Modify forceUpdate to bypass hasStarted check and force-fetch data
    forceUpdate: async (token: string) => {
      if (!get().fetchingInProgress) {
        set({ fetchingInProgress: true, isLoading: true });

        try {
          const url = process.env.NEXT_PUBLIC_LNM_API_URL;
          const response = await fetch(url + "/FTTHComponents/?id=OTHER", {
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

          let data: FTTHOtherComponent[];

          try {
            data = JSON.parse(textData);
            if (typeof data === "string") {
              data = JSON.parse(data);
            }
          } catch (parseError: any) {
            throw new Error("Failed to parse JSON data: " + parseError.message);
          }

          if (Array.isArray(data)) {
            set({ others: data, isLoading: false });
          } else {
            throw new Error(
              "Invalid data format: expected an array of OTHER components"
            );
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        } finally {
          set({ fetchingInProgress: false });
        }
      }
    },
  })
);
