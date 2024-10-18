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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let token = Cookies.get("AccessToken");
  if (token !== null && token !== undefined) {
    useInitializeFTTHModems(token);
    useInitializeFTTHFats(token);
    useInitializeFTTHOthers(token);
    useInitializeFTTHPoints(token);
    useInitializeFTTHPreorders(token);
    useInitializeFTTHSuggestedFAT(token);
    useInitializeIranFTTXAreas(token);
    useInitializeFTTHCities(token);
    useInitializeFTTHBlocks(token);
  }
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
            We're sorry but your site doesn't work properly without JavaScript
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
