"use client";
import { useEffect } from "react";
import { useFTTHModemsStore } from "../store/FTTHModemsStore";

export const useInitializeFTTHModems = () => {
  const startFetching = useFTTHModemsStore((state) => state.startFetching);

  useEffect(() => {
    startFetching();
  }, [startFetching]);
};
