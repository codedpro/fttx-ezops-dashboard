import { create } from "zustand";

interface PostBlock {
  id: number;
  coordinates: [number, number][];
}

interface PostBlockState {
  blocks: PostBlock[];
  error: string | null;
  isLoading: boolean;
  fetchingInProgress: boolean;
  autoFetching: boolean;
  startFetching: (token: string) => void;
  stopFetching: () => void;
  forceUpdate: (token: string) => void;
  hasStarted: boolean;
}

export const usePostBlockStore = create<PostBlockState>((set, get) => ({
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
        const response = await fetch(`${url}/FTTHGetTabrizBlocks`, {
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

        let data: PostBlock[];

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

    // Set up auto-fetching
    fetchBlocks();
    const intervalId = setInterval(() => {
      set({ autoFetching: true }); // Mark as auto-fetching
      fetchBlocks();
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

  forceUpdate: async (token: string) => {
    if (!get().fetchingInProgress) {
      set({ fetchingInProgress: true, isLoading: true });

      try {
        const url = '/api';
        const response = await fetch(`${url}/FTTHGetTabrizBlocks`, {
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

        let data: PostBlock[];

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
