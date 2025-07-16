"use client";
import "@/css/style.css";
import dynamic from "next/dynamic";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/globals.css";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const Loader = dynamic(() => import("@/components/common/Loader"), {
  ssr: true,
});
import { useInitializeFTTHModems } from "../hooks/useInitializeFTTHModems";
import { useInitializeFTTHFats } from "@/hooks/useInitializeFTTHFats";
import { useInitializeFTTHOthers } from "@/hooks/useInitializeFTTHOthers";
import { useInitializeFTTHPoints } from "@/hooks/useInitializeFTTHPoints";
import { useInitializeFTTHPreorders } from "@/hooks/useInitializeFTTHPreorders";
import { useInitializeFTTHSuggestedFAT } from "@/hooks/useInitializeFTTHSuggestedFAT";
import { useInitializeIranFTTXAreas } from "@/hooks/useInitializeIranFTTXAreas";
import { useInitializeFTTHCities } from "@/hooks/useInitializeFTTHCities";
import { useInitializeFTTHBlocks } from "@/hooks/useInitializeFTTHBlocks";
import { useInitializeFTTHACSRXPower } from "@/hooks/useInitializeFTTHACSRXPower";
import { useInitializeFATData } from "@/hooks/useInitializeFTTHFATauto";
//import { useInitializePostBlocks } from "@/hooks/useInitializePostBlocks";
import { useInitializeAlarms } from "@/hooks/useInitializeAlarms";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = Cookies.get("AccessToken");
  // Register all data initialization hooks. Each hook internally checks if the
  // provided token is valid before performing any actions, so it is safe to call
  // them unconditionally.
  useInitializeFTTHModems(token);
  useInitializeFTTHFats(token);
  useInitializeFTTHOthers(token);
  useInitializeFTTHPoints(token);
  useInitializeFTTHPreorders(token);
  useInitializeFTTHSuggestedFAT(token);
  useInitializeIranFTTXAreas(token);
  useInitializeFTTHCities(token);
  useInitializeFTTHBlocks(token);
  useInitializeFTTHACSRXPower(token);
  useInitializeFATData(token);
  useInitializeAlarms(token);
  // useInitializePostBlocks(token);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleContentLoaded = () => {
      setLoading(false);
    };

    if (document.readyState === "complete") {
      handleContentLoaded();
    } else {
      window.addEventListener("load", handleContentLoaded);
    }

    return () => window.removeEventListener("load", handleContentLoaded);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <noscript>
          <strong>
            We&apos;re sorry but your site doesn&apos;t work properly without JavaScript
            enabled. Please enable it to continue.
          </strong>
        </noscript>

        {loading ? (
          <div id="initial-loader">
            <Loader />
          </div>
        ) : (
          <div id="app-content">{children}</div>
        )}
      </body>
    </html>
  );
}
