"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LucideCheckCircle,
  LucideXCircle,
  LucideRouter,
  LucideSignal,
  LucideSearch,
} from "lucide-react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useFTTHModemsStore } from "@/store/FTTHModemsStore";

// ✅ Define Modem Type
interface Modem {
  Modem_ID: number | null;
  OLT: string | null;
  Online_Status: string | null;
}

// ✅ Modem Card Component
const ModemCard: React.FC<{ modem: Modem; onClick: () => void }> = ({
  modem,
  onClick,
}) => {
  const modemStatus =
    modem.Online_Status?.toLowerCase() === "online" ? "Online" : "Offline";

  const statusColor =
    modemStatus === "Online"
      ? "text-green-500 dark:text-green-400"
      : "text-red-500 dark:text-red-400";

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#1b2a3c] p-4 rounded-lg shadow-md border border-gray-300 dark:border-gray-600 transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer flex flex-col gap-3"
    >
      {/* Modem ID & Status */}
      <div className="flex justify-between items-center">
        <span className="text-gray-900 dark:text-gray-200 font-semibold flex items-center gap-2">
          <LucideRouter size={18} className="text-primary" />
          {modem.Modem_ID ?? "N/A"}
        </span>
        <span
          className={`flex items-center gap-1 text-sm font-medium ${statusColor}`}
        >
          {modemStatus === "Online" ? (
            <LucideCheckCircle size={18} />
          ) : (
            <LucideXCircle size={18} />
          )}
          {modemStatus}
        </span>
      </div>

      {/* OLT Information */}
      <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
        <LucideSignal size={16} className="text-blue-500" />
        <span>{modem.OLT ?? "N/A"}</span>
      </div>
    </div>
  );
};

// ✅ Search Bar Component
const SearchBar: React.FC<{
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}> = ({ searchTerm, setSearchTerm }) => (
  <div className="relative w-full">
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search by Modem ID, OLT, or Status..."
      className="w-full p-3 pl-10 rounded-lg bg-gray-50 dark:bg-[#202c3b] text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
    />
    <LucideSearch
      size={18}
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
    />
  </div>
);

// ✅ Infinite Scroll: Optimized UX (No Annoying Flickers)
export default function Modem() {
  const modems = useFTTHModemsStore((state) => state.modems);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleModems, setVisibleModems] = useState<number>(60);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // ✅ Optimized Search - Prevents Unnecessary Re-renders
  const filteredModems = useMemo(() => {
    return modems.filter(
      (modem) =>
        modem.Modem_ID?.toString().includes(searchTerm) ||
        modem.OLT?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        modem.Online_Status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [modems, searchTerm]);

  // ✅ Infinite Scroll: Preloads modems smoothly
  const loadMoreModems = useCallback(() => {
    if (visibleModems < filteredModems.length) {
      setVisibleModems((prev) => prev + 60);
    }
  }, [filteredModems.length, visibleModems]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreModems();
        }
      },
      { rootMargin: "200px" }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [loadMoreModems]);

  const handleModemClick = (modemID: number | null) => {
    if (modemID) router.push(`/modem/${modemID}`);
  };

  return (
    <DefaultLayout>
      <div className=" w-full space-y-6">
        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* ✅ Grid Layout: Max 5 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredModems.slice(0, visibleModems).map((modem, idx) => (
            <ModemCard
              key={modem.Modem_ID || idx}
              modem={modem}
              onClick={() => handleModemClick(modem.Modem_ID)}
            />
          ))}
        </div>

        {/* Infinite Scroll Loader */}
        <div
          ref={sentinelRef}
          className="h-10 flex justify-center items-center"
        >
          {visibleModems < filteredModems.length && (
            <span className="text-primary font-medium animate-pulse">
              Loading more modems...
            </span>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
