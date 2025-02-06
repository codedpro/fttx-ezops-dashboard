"use client";
import React, { useState, useEffect, forwardRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const DefaultLayout = forwardRef(function DefaultLayout(
  {
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  },
  ref?: React.Ref<HTMLDivElement>
) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div
        className="flex h-screen z-30 overflow-hidden bg-grid-black/[0.01] dark:bg-grid-white/[0.01]"
        ref={ref}
      >
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className={`w-full p-4 md:p-6 ${className}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
});

export default DefaultLayout;
