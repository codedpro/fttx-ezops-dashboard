import React, { useEffect, useRef, useState } from "react";
import { gsap, Power3, Back } from "gsap";

interface DataCardsProps {
  data: Record<string, any>;
}

export const DataCards: React.FC<DataCardsProps> = ({ data }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    const copiedElement = document.getElementById(`copied-${key}`);
    if (copiedElement) {
      gsap.fromTo(
        copiedElement,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: Back.easeOut }
      );
      gsap.to(copiedElement, { opacity: 0, duration: 0.5, delay: 1.5 });
    }

    setTimeout(() => setCopied(null), 1500);
  };

  const formatLatLong = (lat: number, long: number) => {
    return `${lat}, ${long}`;
  };

  useEffect(() => {
    gsap.fromTo(
      cardRefs.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: Power3.easeOut,
        delay: 0.3,
      }
    );
  }, []);

  return (
    <div className="custom-scrollbar max-h-[50vh] overflow-auto pr-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.keys(data)
          .filter(
            (key) =>
              key !== "icon" &&
              key !== "LayerID" &&
              key !== "iconSize" &&
              key !== "Component_ID" &&
              key !== "Chain_ID" &&
              key !== "FAT_ID" &&
              key !== "Long" &&
              key !== "clickedLatLng"
          )
          .map((key, idx) => {
            const displayValue =
              key === "Lat" && data.Long
                ? formatLatLong(data.Lat, data.Long)
                : data[key];

            const displayKey = key === "Lat" && data.Long ? "Lat/Long" : key;

            return (
              <div
                key={idx}
                ref={(el) => {
                  if (el) cardRefs.current[idx] = el;
                }}
                className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-transform transform  hover:shadow-2xl hover:border-gray-400 dark:hover:border-gray-500"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  {displayKey}
                </p>
                <p
                  className={`font-semibold text-xs text-gray-900 dark:text-white cursor-pointer transition-colors hover:text-blue-500 dark:hover:text-gray-400 ${
                    copied === displayKey ? "text-green-500" : ""
                  }`}
                  onClick={() => copyToClipboard(displayValue, displayKey)}
                >
                  {displayValue || "N/A"}
                  {copied === displayKey && (
                    <span
                      id={`copied-${displayKey}`}
                      className="ml-2 text-xs text-green-500"
                    >
                      Copied!
                    </span>
                  )}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
};
