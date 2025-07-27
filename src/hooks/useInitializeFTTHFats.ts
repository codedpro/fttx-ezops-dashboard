"use client";
import { useEffect } from "react";
import { useFTTHComponentsFatStore } from "@/store/FTTHComponentsFatStore";

export const useInitializeFTTHFats = (token: string) => {
  const startFetching = useFTTHComponentsFatStore((state) => state.startFetching);

  useEffect(() => {
    if (!token) return;
    startFetching(token);
  }, [startFetching, token]);
};
