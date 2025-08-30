import { create } from "zustand";
import { FTTHBlock } from "../types/FTTHBlock";

interface FTTHBlocksState {
  blocks: FTTHBlock[];
  error: string | null;
  isLoading: boolean;
  fetchingInProgress: boolean;
  autoFetching: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  forceUpdate: (token: string) => void;
  hasStarted: boolean;
}

export const useFTTHBlocksStore = create<FTTHBlocksState>((set, get) => ({
  blocks: [],
  error: null,
  isLoading: false,
  fetchingInProgress: false,
  autoFetching: false,
  hasStarted: false,

  startFetching: (token: string) => {
    if (get().hasStarted) return;

    set({ isLoading: true, error: null, hasStarted: true });

    const fetchBlocks = async () => {
      if (get().fetchingInProgress) return;

      set({ fetchingInProgress: true });

      try {
        const url = '/api';
        const response = await fetch(url + "/FTTHBlocks", {
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

        let data: FTTHBlock[];

        try {
          data = JSON.parse(textData);
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        } catch (parseError: any) {
          throw new Error("Failed to parse JSON data: " + parseError.message);
        }

        if (Array.isArray(data)) {
          set({ blocks: data, isLoading: false });
        } else {
          throw new Error("Invalid data format: expected an array of blocks");
        }
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      } finally {
        set({ fetchingInProgress: false });
      }
    };

    fetchBlocks();
    const intervalId = setInterval(() => {
      set({ autoFetching: true });
      fetchBlocks();
    }, 600000);

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

  forceUpdate: async (token: string) => {
    if (!get().fetchingInProgress) {
      set({ fetchingInProgress: true, isLoading: true });

      try {
        const url = '/api';
        const response = await fetch(url + "/FTTHBlocks", {
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

        let data: FTTHBlock[];

        try {
          data = JSON.parse(textData);
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        } catch (parseError: any) {
          throw new Error("Failed to parse JSON data: " + parseError.message);
        }

        if (Array.isArray(data)) {
          set({ blocks: data, isLoading: false });
        } else {
          throw new Error("Invalid data format: expected an array of blocks");
        }
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
      } finally {
        set({ fetchingInProgress: false });
      }
    }
  },
}));
