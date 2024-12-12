"use client";

import { useEffect } from "react";
import { useFATDataStore } from "@/store/FTTHFATStore";

export const useInitializeFATData = (token: string) => {
  const startFetching = useFATDataStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
