"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import ClickOutside from "@/components/ClickOutside";
import { Select } from "@/components/FormElements/Select";
import { LabelInputContainer } from "@/components/FormElements/InputUtils";
import { Label } from "@/components/FormElements/Label";
import { cn } from "@/lib/utils";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";

interface AddNewRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formValues: {
    city: string;
    planType: string;
    isReverse: boolean;
  };
  setFormValues: React.Dispatch<
    React.SetStateAction<{
      city: string;
      planType: string;
      isReverse: boolean;
    }>
  >;
  startPointType: string;
  endPointType: string;
  endPointName: string;
  startPointName: string;
}

const AddNewRouteModal: React.FC<AddNewRouteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formValues,
  setFormValues,
  startPointType,
  endPointType,
  startPointName,
  endPointName,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
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

  // Check if all required fields are filled or predefined
  useEffect(() => {
    setIsFormValid(formValues.city !== "" && formValues.planType !== "");
  }, [formValues]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
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
          <h2 className="text-center text-xs font-semibold mb-6 dark:text-white">
            {formValues.isReverse
              ? `${endPointName}_to_${startPointName}`
              : `${startPointName}_to_${endPointName}`}
          </h2>

          <div className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="city" className="block text-darkgray-8">
                City
              </Label>
              <Select
                name="city"
                value={formValues.city}
                onChange={handleChange}
                className="border p-2 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                {cities.map((city) => (
                  <option key={city.Name} value={city.Name}>
                    {city.Name}
                  </option>
                ))}
              </Select>
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="planType" className="block text-darkgray-8">
                Plan Type
              </Label>
              <Select
                name="planType"
                value={formValues.planType}
                onChange={handleChange}
                className="border p-2 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value="0">Planning</option>
                <option value="1">Execution</option>
                <option value="2">Approved</option>
              </Select>
            </LabelInputContainer>

            <LabelInputContainer className="flex flex-row space-x-2">
              <input
                type="checkbox"
                name="isReverse"
                id="isReverse"
                checked={formValues.isReverse}
                onChange={() =>
                  setFormValues((prev) => ({
                    ...prev,
                    isReverse: !prev.isReverse,
                  }))
                }
                className="w-5 h-5 rounded-full mt-1 appearance-none checked:bg-blue-600 border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-dark-3 dark:border-dark-3 dark:checked:bg-primary"
              />{" "}
              <Label htmlFor="isReverse" className="block   text-darkgray-8">
                Reverse Route
              </Label>
            </LabelInputContainer>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="bg-gray-200 text-sm px-4 py-2 rounded-md dark:bg-dark-3 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-4 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={
                !isFormValid &&
                formValues.city === "" &&
                formValues.planType === ""
              }
              className={cn(
                "bg-blue-500 text-sm px-4 py-2 text-white rounded-md transition-colors",
                {
                  "hover:bg-blue-600": isFormValid,
                  "cursor-not-allowed opacity-50":
                    !isFormValid &&
                    formValues.city === "" &&
                    formValues.planType === "",
                  "dark:bg-primary dark:hover:bg-primary-dark": isDarkMode,
                }
              )}
            >
              Submit
            </button>
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};

export default AddNewRouteModal;
