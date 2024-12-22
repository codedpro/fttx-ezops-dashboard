"use client";
import { useEffect } from "react";
import { useAlarmsStore } from "@/store/FTTHOLTAlarmsStore";

export const useInitializeAlarms = (token: string) => {
  const startFetching = useAlarmsStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
