"use client";
import { useEffect } from "react";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";

export const useInitializeFTTHCities = (token: string) => {
  const startFetching = useFTTHCitiesStore((state) => state.startFetching);

  useEffect(() => {
    if (!token) return;
    startFetching(token);
  }, [startFetching, token]);
};
