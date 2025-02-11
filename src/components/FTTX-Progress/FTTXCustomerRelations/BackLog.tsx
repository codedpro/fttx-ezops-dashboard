"use client";

import React, { useEffect, useState } from "react";
import { CUSTOMER_RELATIONS_DATA } from "@/data/fttxCustomerRelationsData";

const BackLog: React.FC = () => {
  const targetValue = CUSTOMER_RELATIONS_DATA.BackLog_Live; // Fetch BackLog Live value
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 5000; // Animation duration in milliseconds
    const increment = Math.ceil(targetValue / (duration / 16)); // Calculate step size

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        start = targetValue; // Ensure exact value at the end
        clearInterval(timer);
      }
      setCount(start);
    }, 16); // Smooth update every 16ms (~60 FPS)

    return () => clearInterval(timer);
  }, [targetValue]);

  return (
    <div className="h-full flex flex-col justify-between items-center bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700 p-6">
      
      {/* Top Section - Title */}
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
        BackLog
      </h3>

      {/* Middle Section - Adjusted Number Size */}
      <div className="flex-grow flex flex-col justify-center items-center">
        <p className="text-7xl md:text-8xl font-extrabold text-red-600 transition-all duration-500">
          {count.toLocaleString()}
        </p>
      </div>

      {/* Bottom Section - Status Indicator */}
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        Updated in real-time
      </p>

    </div>
  );
};

export default BackLog;
