import "@/css/style.css";
import React from "react";
import dynamic from "next/dynamic";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/globals.css";
const Loader = dynamic(() => import("@/components/common/Loader"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <noscript>
          <strong>We're sorry but your site doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
        </noscript>
        <div id="initial-loader">
          <Loader />
        </div>
        <div id="app-content" style={{ display: 'none' }}>
          {children}
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('initial-loader').style.display = 'none';
              document.getElementById('app-content').style.display = 'block';
            `,
          }}
        />
      </body>
    </html>
  );
}
