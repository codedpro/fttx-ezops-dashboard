import { SuggestedFAT } from "@/types/SuggestedFAT";
import { create } from "zustand";

interface FTTHSuggestedFATState {
  suggestedFAT: SuggestedFAT[];
  error: string | null;
  isLoading: boolean;
  fetchingInProgress: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  forceUpdate: (token: string) => void;
  hasStarted: boolean;
}

export const useFTTHSuggestedFATStore = create<FTTHSuggestedFATState>(
  (set, get) => ({
    suggestedFAT: [],
    error: null,
    isLoading: false,
    fetchingInProgress: false,
    hasStarted: false,
    startFetching: (token: string) => {
      if (get().hasStarted) return;

      set({ isLoading: true, error: null, hasStarted: true });

      const fetchSuggestedFAT = async () => {
        if (get().fetchingInProgress) return;

        set({ fetchingInProgress: true });

        try {
          const url = process.env.NEXT_PUBLIC_LNM_API_URL;
          const response = await fetch(url + "/SuggestedFAT", {
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

          let data: SuggestedFAT[];

          try {
            data = JSON.parse(textData);
            if (typeof data === "string") {
              data = JSON.parse(data);
            }
          } catch (parseError: any) {
            throw new Error("Failed to parse JSON data: " + parseError.message);
          }

          if (Array.isArray(data)) {
            set({ suggestedFAT: data, isLoading: false });
          } else {
            throw new Error(
              "Invalid data format: expected an array of SuggestedFAT"
            );
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        } finally {
          set({ fetchingInProgress: false });
        }
      };

      fetchSuggestedFAT();
      const intervalId = setInterval(fetchSuggestedFAT, 600000);
      set({ stopFetching: () => clearInterval(intervalId) });
    },
    stopFetching: () => {
      set({ hasStarted: false, fetchingInProgress: false });
    },
    forceUpdate: (token: string) => {
      get().startFetching(token);
    },
  })
);
