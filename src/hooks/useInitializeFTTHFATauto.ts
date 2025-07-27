"use client";

import { useEffect } from "react";
import { useFATDataStore } from "@/store/FTTHFATStore";

export const useInitializeFATData = (token: string) => {
  const startFetching = useFATDataStore((state) => state.startFetching);

  useEffect(() => {
    if (!token) return;
    startFetching(token);
  }, [startFetching, token]);
};
