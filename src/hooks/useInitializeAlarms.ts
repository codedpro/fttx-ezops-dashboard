"use client";
import { useEffect } from "react";
import { useAlarmsStore } from "@/store/FTTHOLTAlarmsStore";

export const useInitializeAlarms = (token: string) => {
  const startFetching = useAlarmsStore((state) => state.startFetching);

  useEffect(() => {
    if (!token) return;
    startFetching(token);
  }, [startFetching, token]);
};
