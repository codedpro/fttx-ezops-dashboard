"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFTTHComponentsOtherStore } from "@/store/FTTHComponentsOtherStore";
import { useFTTHModemsStore } from "@/store/FTTHModemsStore";

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const others = useFTTHComponentsOtherStore((state) => state.others);
  const modems = useFTTHModemsStore((state) => state.modems);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };

  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 12000);
  };

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setValue(input);

    if (input.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
      // Latitude and Longitude separated by a comma
      setSuggestions([]);
    } else if (input.match(/^T\d/)) {
      // Site ID starts with T followed by number
      const oltData = others
        .filter((component) => component.Type === "OLT")
        .filter((component) => component.Name.toString().startsWith(input)); // Convert to string
      setSuggestions(oltData.slice(0, 5).map((item) => item.Name.toString())); // Convert to string
    } else if (input.match(/^8411\d+/)) {
      // Modem ID starts with 8411 followed by a number
      const modemData = modems
        .filter((modem) => modem.Modem_ID.toString().startsWith(input)) // Convert to string
        .slice(0, 5);
      setSuggestions(modemData.map((modem) => modem.Modem_ID.toString())); // Convert to string
    } else {
      setSuggestions([]);
    }

    onChange && onChange(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applySearch();
    }
  };

  const applySearch = () => {
    if (value.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
      // Latitude & Longitude case
      router.push(`?search=${value}`);
    } else if (value.match(/^T\d/)) {
      // Name case
      router.push(`?search=OLT:${value}`);
    } else if (value.match(/^8411\d+/)) {
      // Modem case
      router.push(`?search=Modem:${value}`);
    }

    setSuggestions([]); // Clear suggestions after search
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    applySearch();
  };

  return (
    <form
      className={cn(
        "w-full relative max-w-xl mx-auto  bg-gray-2 dark:bg-secondary-2 h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        value && "bg-gray-50"
      )}
      onSubmit={(e) => {
        e.preventDefault();
        applySearch();
        onSubmit && onSubmit(e);
      }}
    >
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={value}
        type="text"
        className="w-full relative text-sm sm:text-base z-50 border-none dark:text-white  bg-transparent  text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20"
      />

      <button
        disabled={!value}
        type="submit"
        className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full disabled:text-primary disabled:bg-gray-100 text-white dark:text-white bg-primary dark:bg-secondary dark:disabled:bg-secondary transition duration-200 flex items-center justify-center"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className=" h-4 w-4"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <motion.path
            d="M5 12l14 0"
            initial={{
              strokeDasharray: "50%",
              strokeDashoffset: "50%",
            }}
            animate={{
              strokeDashoffset: value ? 0 : "50%",
            }}
            transition={{
              duration: 0.3,
              ease: "linear",
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      {suggestions.length > 0 && (
        <ul className="absolute w-full bg-white border border-gray-200 mt-2 z-50 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
