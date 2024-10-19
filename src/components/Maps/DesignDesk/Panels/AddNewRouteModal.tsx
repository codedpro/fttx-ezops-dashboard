"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Select } from "@/components/FormElements/Select";
import { LabelInputContainer } from "@/components/FormElements/InputUtils";
import { Label } from "@/components/FormElements/Label";
import { cn } from "@/lib/utils";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";
import { FaCheck, FaTimes } from "react-icons/fa";
interface AddNewRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { formValues: any; AddCP: boolean }) => void;
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
  startPointName: string;
  endPointName: string;
  endPointId: number;
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
  endPointId,
}) => {
  const [showAddCheckpointModal, setShowAddCheckpointModal] = useState(false); // State for CP confirmation modal
  const { cities } = useFTTHCitiesStore((state) => ({
    cities: state.cities,
    isLoading: state.isLoading,
    error: state.error,
  }));

  useEffect(() => {
    // Ensure initial values are set correctly on component mount
    setFormValues((prev) => ({
      ...prev,
      city: formValues.city || cities[0]?.Name || "", // Default to first city if formValues.city is empty
      planType: formValues.planType || "0", // Default to "Planning" if planType is empty
    }));
  }, [isOpen, cities, formValues.city, formValues.planType, setFormValues]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCP = () => {
    setShowAddCheckpointModal(false);
    onSubmit({ formValues, AddCP: true });
  };

  const handleSubmit = () => {
    if (endPointId === 0) {
      setShowAddCheckpointModal(true);
    } else {
      onSubmit({ formValues, AddCP: false });
    }
  };

  if (endPointId === 0 && formValues.isReverse) {
    setFormValues((prev) => ({
      ...prev,
      isReverse: false,
    }));
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
        <div
          className={cn(
            "relative bg-white p-6 rounded-lg w-full max-w-lg dark:bg-dark-2 shadow-2xl transition-transform duration-300 transform scale-100",
            { "dark:text-white": true }
          )}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <FiX size={24} />
          </button>
          <h2 className="text-center text-lg font-bold mb-6 dark:text-white">
            {endPointId != 0
              ? formValues.isReverse
                ? `${endPointName} to ${startPointName}`
                : `${startPointName} to ${endPointName}`
              : `${startPointName} to CheckPoint`}
          </h2>

          <div className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="city" className="block text-darkgray-8">
                City
              </Label>
              <Select
                name="city"
                value={formValues.city} // Properly bind the city value to formValues
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
                value={formValues.planType} // Properly bind the planType value to formValues
                onChange={handleChange}
                className="border p-2 w-full rounded-md dark:bg-dark-3 dark:border-dark-3 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value="0">Planning</option>
                <option value="1">Execution</option>
                <option value="2">Approved</option>
              </Select>
            </LabelInputContainer>

            {/* Only show Reverse Line if endPointId is not 0 */}
            {endPointId !== 0 && (
              <LabelInputContainer className="flex flex-row space-x-3 items-center">
                <div className="relative">
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
                    className="hidden"
                  />

                  <div
                    className={`w-5 h-5 mt-2 flex items-center justify-center rounded-md border-2 transition-all duration-300 ease-in-out dark:bg-dark-3 cursor-pointer transform hover:scale-105 ${
                      formValues.isReverse
                        ? "bg-primary border-primary shadow-lg hover:shadow-xl"
                        : "bg-transparent border-gray-400 hover:bg-gray-200 dark:border-dark-3 hover:shadow-lg"
                    }`}
                    onClick={() =>
                      setFormValues((prev) => ({
                        ...prev,
                        isReverse: !prev.isReverse,
                      }))
                    }
                  >
                    <div
                      className={`absolute inset-0 bg-primary transition-all duration-500 ease-in-out transform ${
                        formValues.isReverse
                          ? "opacity-100 scale-100 "
                          : "opacity-0 scale-50 rounded-full"
                      }`}
                    />
                  </div>
                </div>
                <Label
                  htmlFor="isReverse"
                  className="block text-darkgray-8 dark:text-gray-400 cursor-pointer transition-colors duration-300"
                >
                  Reverse Line
                </Label>
              </LabelInputContainer>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="bg-gray-200 text-sm px-4 py-2 rounded-md dark:bg-dark-3 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-4 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit} // Submit without validation check
              className={cn(
                "text-sm px-4 py-2 text-white rounded-md transition-colors bg-primary hover:bg-primary-dark"
              )}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Add Checkpoint Confirmation Modal */}
      {showAddCheckpointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg dark:bg-dark-2 shadow-2xl">
            <h2 className="text-center text-lg font-bold dark:text-white">
              End Point is not connected to a component!
            </h2>
            <p className="text-center text-sm text-gray-500 dark:text-gray-300 mt-2">
              Do you want to add a checkpoint at the end of the line?
            </p>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowAddCheckpointModal(false)}
                className="bg-gray-200 text-sm px-4 py-2 rounded-md dark:bg-dark-3 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-4 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCP} // Submit with AddCP=true
                className="bg-primary text-sm px-4 py-2 rounded-md text-white hover:bg-primary-dark transition-colors"
              >
                Add Checkpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNewRouteModal;
