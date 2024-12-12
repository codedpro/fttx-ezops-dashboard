"use client";

import { useEffect } from "react";
import { usePostBlockStore } from "@/store/FTTHPostBlockStore";

export const useInitializePostBlocks = (token: string) => {
  const startFetching = usePostBlockStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
