"use client";
import { useEffect } from "react";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";

export const useInitializeFTTHCities = (token: string) => {
  const startFetching = useFTTHCitiesStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
