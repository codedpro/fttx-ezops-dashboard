"use client";
import { useEffect } from "react";
import { useFTTHPreordersStore } from "../store/FTTHPreordersStore";

export const useInitializeFTTHPreorders = (token: string) => {
  const startFetching = useFTTHPreordersStore((state) => state.startFetching);

  useEffect(() => {
    startFetching(token);
  }, [startFetching, token]);
};
