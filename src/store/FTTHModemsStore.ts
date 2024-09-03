import create from "zustand";
import { FTTHModem } from "../types/FTTHModem";
import Cookies from "js-cookie";
interface FTTHModemsState {
  modems: FTTHModem[];
  error: string | null;
  isLoading: boolean;
  startFetching: () => void;
  stopFetching: () => void;
}

export const useFTTHModemsStore = create<FTTHModemsState>((set) => ({
  modems: [],
  error: null,
  isLoading: false,
  startFetching: () => {
    set({ isLoading: true, error: null });

    const fetchModems = async () => {
      try {
        const response = await fetch(
          "https://lnmback.mtnirancell.ir/api/FTTHModems",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${Cookies.get("AccessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log(data);

        if (Array.isArray(data)) {
          set({ modems: data, isLoading: false });
        } else if (data && Array.isArray(data.modems)) {
          set({ modems: data.modems, isLoading: false });
        } else {
          set({ modems: [], isLoading: false });
        }
      } catch (error) {
        set({ error: "Failed to fetch FTTH Modems data", isLoading: false });
      }
    };

    fetchModems();
    const intervalId = setInterval(fetchModems, 60000);
    set({ stopFetching: () => clearInterval(intervalId) });
  },
  stopFetching: () => {},
}));
