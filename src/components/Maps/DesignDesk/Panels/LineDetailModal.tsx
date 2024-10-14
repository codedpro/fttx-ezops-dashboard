"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClickOutside from "@/components/ClickOutside";
import { Select } from "@/components/FormElements/Select";
import { cn } from "@/lib/utils";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";
import { useFTTHPointsStore } from "@/store/FTTHPointsStore";
import { LineData } from "@/types/LineData";
import { FTTHPoint } from "@/types/FTTHPoint";
import { Label } from "@radix-ui/react-label";

interface LineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineData: LineData | null;
  onSubmit: (updatedData: LineData) => void;
}

const LineDetailModal: React.FC<LineDetailModalProps> = ({
  isOpen,
  onClose,
  lineData,
  onSubmit,
}) => {
  const [formValues, setFormValues] = useState({
    type: lineData?.type || "",
    isReverse: false,
    City: "",
    Plan_Type: "0",
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);
  const points = useFTTHPointsStore((state) => state.points); // Access the points store
  const { cities } = useFTTHCitiesStore((state) => ({
    cities: state.cities,
  }));

  useEffect(() => {
    if (points.length > 0) {
      // Extract unique types from all points
      const allPointTypes = Array.from(
        new Set(points.map((point) => point.Type))
      );
      setUniqueTypes(allPointTypes);

      if (lineData) {
        // Filter points by Chain_ID to extract city and plan type for the current line
        const matchingPoints = points.filter(
          (point: FTTHPoint) => point.Chain_ID === lineData.chainId
        );

        if (matchingPoints.length > 0) {
          setFormValues({
            type: lineData.type || allPointTypes[0], // Set type as the first found type
            isReverse: false,
            City: matchingPoints[0].City || "",
            Plan_Type: matchingPoints[0].Plan_Type.toString() || "0",
          });
        }
      }
    }

    const handleDarkModeChange = () => {
      const darkModeClass = document.documentElement.classList.contains("dark");
      setIsDarkMode(darkModeClass);
    };

    handleDarkModeChange();

    const observer = new MutationObserver(() => {
      handleDarkModeChange();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [lineData, points]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleReverseToggle = () => {
    setFormValues((prev) => ({ ...prev, isReverse: !prev.isReverse }));
  };

  const handleSubmit = async () => {
    if (!formValues.City || !formValues.type || !formValues.Plan_Type) {
      toast.error("All fields are required.");
      return;
    }

    if (!lineData) return;

    const updatedData: LineData = {
      ...lineData,
      type: formValues.type,
      coordinates: formValues.isReverse
        ? [...lineData.coordinates].reverse()
        : lineData.coordinates,
      chainId: lineData.chainId ?? null,
    };

    onSubmit(updatedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300">
      <ClickOutside onClick={onClose} className="w-full max-w-md">
        <div
          className={cn(
            "relative bg-white p-6 rounded-lg w-full dark:bg-dark-2 shadow-2xl transition-transform duration-300 transform scale-100",
            { "dark:text-white": isDarkMode }
          )}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <FiX size={24} />
          </button>
          <h2 className="text-center text-2xl font-semibold mb-6 dark:text-white">
            Edit Line Details
          </h2>

          <div className="space-y-4">
            {/* Line Type Select */}
            <Select
              name="type"
              value={formValues.type}
              onChange={handleChange}
              className="border p-3 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>

            {/* City Select */}
            <Select
              name="City"
              value={formValues.City}
              onChange={handleChange}
              className="border p-3 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              {cities.map((city) => (
                <option key={city.Name} value={city.Name}>
                  {city.Name}
                </option>
              ))}
            </Select>

            {/* Plan Type Select */}
            <Select
              name="Plan_Type"
              value={formValues.Plan_Type}
              onChange={handleChange}
              className="border p-2 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              <option value="0">Planning</option>
              <option value="1">Execution</option>
              <option value="2">Approved</option>
            </Select>

            {/* Reverse Line Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isReverse"
                checked={formValues.isReverse}
                onChange={handleReverseToggle}
                className="w-5 h-5 rounded-full mt-1 appearance-none  border-2 border-gray-400 focus:outline-none focus:ring-2  transition-colors dark:bg-dark-3 dark:border-dark-3 checked:bg-primary"
              />
              <Label htmlFor="isReverse" className="block   text-darkgray-8">
                Reverse Line
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="bg-gray-200 text-sm px-4 py-2 rounded-md dark:bg-dark-3 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-4 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={cn(
                " text-sm px-4 py-2 text-white rounded-md  transition-colors",
                "bg-primary hover:bg-primary-dark"
              )}
            >
              Submit
            </button>
          </div>
        </div>
      </ClickOutside>

      <ToastContainer
        theme={isDarkMode ? "dark" : "light"}
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName={cn("custom-toast", {
          "dark-toast": isDarkMode,
        })}
      />
    </div>
  );
};

export default LineDetailModal;
