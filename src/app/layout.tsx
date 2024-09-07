"use client";
import "@/css/style.css";
import dynamic from "next/dynamic";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/globals.css";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const Loader = dynamic(() => import("@/components/common/Loader"), {
  ssr: false,
});
import { useInitializeFTTHModems } from "../hooks/useInitializeFTTHModems";
import { useInitializeFTTHFats } from "@/hooks/useInitializeFTTHFats";
import { useInitializeFTTHOthers } from "@/hooks/useInitializeFTTHOthers";
import { useInitializeFTTHPoints } from "@/hooks/useInitializeFTTHPoints";
import { useInitializeFTTHPreorders } from "@/hooks/useInitializeFTTHPreorders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let token = Cookies.get("AccessToken") ?? "a";
  
  // Hooks initialization
  useInitializeFTTHModems(token);
  useInitializeFTTHFats(token);
  useInitializeFTTHOthers(token);
  useInitializeFTTHPoints(token);
  useInitializeFTTHPreorders(token);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a delay for the data fetching process
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the delay as necessary

    return () => clearTimeout(timeout);
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
          <div id="app-content">
            {children}
          </div>
        )}

      </body>
    </html>
  );
}
