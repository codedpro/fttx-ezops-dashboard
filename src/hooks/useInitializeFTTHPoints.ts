"use client";
import { useEffect } from "react";
import { useFTTHPointsStore } from "@/store/FTTHPointsStore";

export const useInitializeFTTHPoints = (token: string) => {
  const startFetching = useFTTHPointsStore(
    (state) => state.startFetching
  );

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
