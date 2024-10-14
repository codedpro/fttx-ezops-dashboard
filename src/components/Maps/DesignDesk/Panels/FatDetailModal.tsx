import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import ClickOutside from "@/components/ClickOutside";
import { LabelInputContainer } from "@/components/FormElements/InputUtils";
import { Label } from "@/components/FormElements/Label";
import { Select } from "@/components/FormElements/Select";
import { Input } from "@/components/FormElements/Input";
import { ObjectData } from "@/types/ObjectData";
import { cn } from "@/lib/utils";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";
import { useFTTHComponentsFatStore } from "@/store/FTTHComponentsFatStore";

interface FatDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectData: ObjectData | null;
  onSubmit: (
    updatedData: ObjectData & {
      OLT?: string;
      POP?: string;
      Plan_Type?: string;
      FAT?: string;
      City?: string;
    }
  ) => void;
}

const FatDetailModal: React.FC<FatDetailModalProps> = ({
  isOpen,
  onClose,
  objectData,
  onSubmit,
}) => {
  const [formValues, setFormValues] = useState({
    Name: objectData?.Name || "",
    Type: objectData?.Type || "FAT",
    OLT: "",
    POP: "",
    Plan_Type: "0", // Ensure this is a string to avoid type conflicts
    FAT: "",
    City: "NEKA",
  });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [loading, setLoading] = useState(false); // Ensure 'loading' is defined to avoid errors
  const { cities } = useFTTHCitiesStore((state) => ({
    cities: state.cities,
  }));
  const fats = useFTTHComponentsFatStore((state) => state.fats); // Fetch fats from Zustand store

  useEffect(() => {
    if (objectData) {
      setFormValues((prev) => ({
        ...prev,
        Name: objectData.Name || "",
        Type: objectData.Type || "FAT",
      }));

      // Check if type is SFAT or MFAT to show extra fields and fetch data from local store
      if (objectData.Type === "SFAT" || objectData.Type === "MFAT") {
        setShowExtraFields(true);
        fetchLocalObjectDetails(Number(objectData.ID)); // Ensure ID is passed as a number
      } else {
        setShowExtraFields(false);
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
  }, [objectData]);

  const fetchLocalObjectDetails = (id: number) => {
    // Filter the `fats` data from the Zustand store based on the ID
    const filteredFat = fats.find((fat) => fat.FAT_ID === id);
    if (filteredFat) {
      // Set default values for OLT, POP, FAT, and Plan_Type from the local store
      setFormValues((prev) => ({
        ...prev,
        OLT: filteredFat.OLT || "",
        POP: filteredFat.POP || "",
        FAT: filteredFat.FAT || "",
        Plan_Type: filteredFat.Plan_Type.toString() || "0", // Convert Plan_Type to string
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (name === "Type") {
      if (value === "SFAT" || value === "MFAT") {
        setShowExtraFields(true);
        fetchLocalObjectDetails(Number(objectData?.ID || 0)); // Ensure ID is a number
      } else if (value === "FAT") {
        // Clear extra fields when switching to FAT
        setFormValues((prev) => ({
          ...prev,
          OLT: "",
          POP: "",
          FAT: "",
          Plan_Type: "0", // Keep Plan_Type as a string
        }));
        setShowExtraFields(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!objectData) return;

    const updatedData: any = {
      ...objectData,
      Name: formValues.Name || objectData.Name,
      Type: formValues.Type || objectData.Type,
      City: formValues.City,
    };

    if (formValues.Type === "FAT") {
      updatedData.OLT = "";
      updatedData.POP = "";
      updatedData.Plan_Type = "";
      updatedData.FAT = "";
    } else {
      updatedData.OLT = formValues.OLT;
      updatedData.POP = formValues.POP;
      updatedData.Plan_Type = formValues.Plan_Type;
      updatedData.FAT = formValues.FAT;
    }

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
          <h2 className="text-center text-sm font-semibold mb-6 dark:text-white ">
            Edit {""}
            <span className="gap-2">{objectData?.Name}</span> Details
          </h2>

          <div className="space-y-4">
            {showExtraFields && (
              <>
                <LabelInputContainer>
                  <Label htmlFor="OLT">OLT</Label>
                  <Input
                    type="text"
                    name="OLT"
                    value={formValues.OLT}
                    onChange={handleChange}
                    className="border p-3 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="POP">POP</Label>
                  <Input
                    type="text"
                    name="POP"
                    value={formValues.POP}
                    onChange={handleChange}
                    className="border p-3 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="FAT">FAT</Label>
                  <Input
                    type="text"
                    name="FAT"
                    value={formValues.FAT}
                    onChange={handleChange}
                    className="border p-3 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="Plan_Type">Plan Type</Label>
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
                </LabelInputContainer>
              </>
            )}

            <LabelInputContainer>
              <Label htmlFor="City">City</Label>
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
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="Type">Type</Label>
              <Select
                name="Type"
                value={formValues.Type}
                onChange={handleChange}
                className="border p-3 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                {objectData?.Type === "FAT" && <option value="FAT">FAT</option>}
                <option value="SFAT">SFAT</option>
                <option value="MFAT">MFAT</option>
              </Select>
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
              onClick={handleSubmit}
              className={cn(
                "bg-blue-500 text-sm px-4 py-2 text-white rounded-md hover:bg-blue-600 transition-colors",
                { "dark:bg-primary dark:hover:bg-primary-dark": isDarkMode }
              )}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};

export default FatDetailModal;
