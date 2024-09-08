"use client";
import { useEffect } from "react";
import { useFTTHSuggestedFATStore } from "@/store/FTTHSuggestedFAT";

export const useInitializeFTTHSuggestedFAT = (token: string) => {
  const startFetching = useFTTHSuggestedFATStore(
    (state) => state.startFetching
  );

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
