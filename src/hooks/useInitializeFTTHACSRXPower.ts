"use client";
import { useEffect } from "react";
import { useFTTHACSRXPowerStore } from "@/store/FTTHACSRXPower";

export const useInitializeFTTHACSRXPower = (token: string) => {
  const startFetching = useFTTHACSRXPowerStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
