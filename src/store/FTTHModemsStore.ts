import { create } from "zustand";
import { FTTHModem } from "../types/FTTHModem";

interface FTTHModemsState {
  modems: FTTHModem[];
  error: string | null;
  isLoading: boolean;
  fetchingInProgress: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  forceUpdate: (token: string) => void;
  hasStarted: boolean;
}

export const useFTTHModemsStore = create<FTTHModemsState>((set, get) => ({
  modems: [],
  error: null,
  isLoading: false,
  fetchingInProgress: false,
  hasStarted: false,
  startFetching: (token: string) => {
    if (get().hasStarted) return;

    set({ isLoading: true, error: null, hasStarted: true });

    const fetchModems = async () => {
      if (get().fetchingInProgress) return;

      set({ fetchingInProgress: true });

      try {
        const url = process.env.NEXT_PUBLIC_LNM_API_URL;
        const response = await fetch(url + "/FTTHModems", {
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

        let data: FTTHModem[];

        try {
          data = JSON.parse(textData);
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        } catch (parseError: any) {
          throw new Error("Failed to parse JSON data: " + parseError.message);
        }

        if (Array.isArray(data)) {
          set({ modems: data, isLoading: false });
        } else {
          throw new Error("Invalid data format: expected an array of modems");
        }
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      } finally {
        set({ fetchingInProgress: false });
      }
    };

    fetchModems();
    const intervalId = setInterval(fetchModems, 6000);
    set({ stopFetching: () => clearInterval(intervalId) });
  },
  stopFetching: () => {
    set({ hasStarted: false, fetchingInProgress: false });
  },
  forceUpdate: (token: string) => {
    get().startFetching(token);
  },
}));
