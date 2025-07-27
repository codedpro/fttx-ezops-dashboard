"use client";
import { useEffect } from "react";
import { useIranFTTXAreasStore } from "../store/IranFTTXAreasStore";

export const useInitializeIranFTTXAreas = (token: string) => {
  const startFetching = useIranFTTXAreasStore((state) => state.startFetching);

  useEffect(() => {
    if (!token) return;
    startFetching(token);
  }, [startFetching, token]);
};
