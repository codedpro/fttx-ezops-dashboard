"use client";
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import ClickOutside from "@/components/ClickOutside";
import { cn } from "@/lib/utils";
import { Select } from "@/components/FormElements/Select";
import { Input } from "@/components/FormElements/InputDark";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";

interface AddOtherObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  object: string;
  lat: number;
  lng: number;
  image: string;
  onSubmit: (data: { City: string; Name: string; Plan_Type: string }) => void;
}

const AddOtherObjectModal: React.FC<AddOtherObjectModalProps> = ({
  isOpen,
  onClose,
  object,
  lat,
  lng,
  image,
  onSubmit,
}) => {
  const [City, setCity] = useState<string>("NEKA");
  const [name, setName] = useState<string>("");
  const [planType, setplanType] = useState<string>("0");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { cities } = useFTTHCitiesStore((state) => ({
    cities: state.cities,
    isLoading: state.isLoading,
    error: state.error,
  }));

  useEffect(() => {
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
  }, []);

  const handleSubmit = async () => {
    if (!City || !name || !planType) {
      toast.error("All fields are required.");
      return;
    }

    try {
      onSubmit({ City, Name: name, Plan_Type: planType });
    } catch (error) {
      toast.error("An error occurred while submitting the form.");
    }
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
            Add {object}
          </h2>

          <div className="flex flex-col items-center mb-6">
            <div className="relative w-20 h-20 mb-3 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={image}
                alt={object}
                width={100}
                height={100}
                className="object-cover"
              />
            </div>
            <div className="text-center text-sm dark:text-gray-300 flex flex-row  gap-2">
              <p>
                Latitude: <span className="font-medium">{lat.toFixed(7)}</span>
              </p>
              <p>
                Longitude: <span className="font-medium">{lng.toFixed(7)}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-3 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            <Select
              value={City}
              onChange={(e) => setCity(e.target.value)}
              className="border p-3 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              <option value="NEKA">NEKA</option>
              {cities.map((city) => (
                <option key={city.Name} value={city.Name}>
                  {city.Name}
                </option>
              ))}
            </Select>
            <Select
              name="planType"
              value={planType}
              onChange={(e) => setplanType(e.target.value)}
              className="border p-2 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              {/*               <option value="">Select Plan Type</option> */}
              <option value="0">Planning</option>
              <option value="1">Execution</option>
              <option value="2">Approved</option>
            </Select>
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
                "bg-blue-500 text-sm px-4 py-2 text-white rounded-md hover:bg-blue-600 transition-colors",
                { "dark:bg-primary dark:hover:bg-primary-dark": isDarkMode }
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

export default AddOtherObjectModal;
