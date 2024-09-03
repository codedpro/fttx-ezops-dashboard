"use client";
import { useEffect } from "react";
import { useFTTHComponentsOtherStore } from "@/store/FTTHComponentsOtherStore";

export const useInitializeFTTHOthers = (token: string) => {
  const startFetching = useFTTHComponentsOtherStore(
    (state) => state.startFetching
  );

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
