"use client";

import { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useFTTHModemsStore } from "@/store/FTTHModemsStore";
import { Input } from "@/components/FormElements/Input";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

export default function Modem() {
  const modems = useFTTHModemsStore((state) => state.modems);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleModems, setVisibleModems] = useState(30);
  const modemListRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    gsap.fromTo(
      modemListRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 }
    );
  }, [visibleModems]);

  const filteredModems = modems.filter(
    (modem) =>
      modem.Modem_ID?.toString().includes(searchTerm) ||
      modem.OLT?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (modem.Online_Status?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const loadMoreModems = () => {
    setVisibleModems((prev) => prev + 30);
  };

  const handleModemClick = (modemID: number) => {
    router.push(`/modem/${modemID}`);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4 space-y-8">
        <div className="mb-4">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Modem ID, OLT, or Error"
            className="w-full p-2 rounded dark:bg-[#122031] dark:text-gray-300"
          />
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          ref={modemListRef}
        >
          {filteredModems.slice(0, visibleModems).map((modem, idx) => (
            <div
              key={idx}
              onClick={() => handleModemClick(modem.Modem_ID)}
              className="bg-white dark:bg-[#1b2a3c] p-5 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Modem ID: {modem.Modem_ID ?? "N/A"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                OLT: {modem.OLT ?? "N/A"}
              </p>
              <p className={`text-sm text-gray-700 dark:text-gray-300`}>
                Status:
                <span
                  className={`ml-1 ${
                    modem.Online_Status === "Online"
                      ? "text-green-500 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {modem.Online_Status || "Offline"}
                </span>
              </p>
            </div>
          ))}
        </div>

        {visibleModems < filteredModems.length && (
          <div className="flex justify-center mt-4">
            <button
              onClick={loadMoreModems}
              className="w-48 px-4 py-3 bg-primary text-white rounded hover:bg-primary-dark transition-all duration-300"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
