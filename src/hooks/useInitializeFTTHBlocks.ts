"use client";
import { useFTTHBlocksStore } from "@/store/useFTTHPointsStore";
import { useEffect } from "react";

export const useInitializeFTTHBlocks = (token: string) => {
  const startFetching = useFTTHBlocksStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
