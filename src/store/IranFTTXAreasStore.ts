import { create } from "zustand";
import { IranFTTXArea } from "../types/iranFTTXArea";

interface IranFTTXAreasState {
  areas: IranFTTXArea[];
  error: string | null;
  isLoading: boolean;
  fetchingInProgress: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  forceUpdate: (token: string) => void;
  hasStarted: boolean;
}

export const useIranFTTXAreasStore = create<IranFTTXAreasState>((set, get) => ({
  areas: [],
  error: null,
  isLoading: false,
  fetchingInProgress: false,
  hasStarted: false,
  startFetching: (token: string) => {
    if (get().hasStarted) return;

    set({ isLoading: true, error: null, hasStarted: true });

    const fetchAreas = async () => {
      if (get().fetchingInProgress) return;

      set({ fetchingInProgress: true });

      try {
        const url = process.env.NEXT_PUBLIC_LNM_API_URL;
        const response = await fetch(url + "/getiranfttx", {
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

        let data: IranFTTXArea[];

        try {
          data = JSON.parse(textData);
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        } catch (parseError: any) {
          throw new Error("Failed to parse JSON data: " + parseError.message);
        }

        if (Array.isArray(data)) {
          set({ areas: data, isLoading: false });
        } else {
          throw new Error("Invalid data format: expected an array of areas");
        }
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      } finally {
        set({ fetchingInProgress: false });
      }
    };

    fetchAreas();
    const intervalId = setInterval(fetchAreas, 600000);
    set({ stopFetching: () => clearInterval(intervalId) });
  },
  stopFetching: () => {
    set({ hasStarted: false, fetchingInProgress: false });
  },
  forceUpdate: (token: string) => {
    get().startFetching(token);
  },
}));
