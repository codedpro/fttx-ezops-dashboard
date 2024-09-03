import create from "zustand";
import { FTTHModem } from "../types/FTTHModem";

interface FTTHModemsState {
  modems: FTTHModem[];
  error: string | null;
  isLoading: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  hasStarted: boolean;
}

export const useFTTHModemsStore = create<FTTHModemsState>((set, get) => ({
  modems: [],
  error: null,
  isLoading: false,
  hasStarted: false,
  startFetching: (token: string) => {
    if (get().hasStarted) return;

    set({ isLoading: true, error: null, hasStarted: true });

    const fetchModems = async () => {
      try {
        const response = await fetch(
          "https://lnmback.mtnirancell.ir/api/FTTHModems",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

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
      }
    };

    fetchModems();
    const intervalId = setInterval(fetchModems, 6000);
    set({ stopFetching: () => clearInterval(intervalId) });
  },
  stopFetching: () => {
    set({ hasStarted: false });
  },
}));
