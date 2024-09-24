"use client";
import { useEffect } from "react";
import { useIranFTTXAreasStore } from "../store/IranFTTXAreasStore";

export const useInitializeIranFTTXAreas = (token: string) => {
  const startFetching = useIranFTTXAreasStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
