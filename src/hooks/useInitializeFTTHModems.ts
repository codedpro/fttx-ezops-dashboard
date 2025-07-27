"use client";
import { useEffect } from "react";
import { useFTTHModemsStore } from "@/store/FTTHModemsStore";

export const useInitializeFTTHModems = (token: string) => {
  const startFetching = useFTTHModemsStore((state) => state.startFetching);

  useEffect(() => {
    if (!token) return;
    startFetching(token);
  }, [startFetching, token]);
};

