"use client";
import { useEffect } from "react";
import { useFTTHComponentsFatStore } from "@/store/FTTHComponentsFatStore";

export const useInitializeFTTHFats = (token: string) => {
  const startFetching = useFTTHComponentsFatStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
