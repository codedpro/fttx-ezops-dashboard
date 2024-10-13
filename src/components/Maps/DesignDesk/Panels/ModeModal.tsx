import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import ClickOutside from "@/components/ClickOutside";
import { cn } from "@/lib/utils";

interface ModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mode: number) => void;
}

const ModeModal: React.FC<ModeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleMergeOrDelete = (mode: number) => {
    onSubmit(mode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300">
      <ClickOutside onClick={onClose} className="w-full max-w-md">
        <div
          className={cn(
            "relative bg-white dark:bg-dark-2 p-6 rounded-lg w-full shadow-2xl transition-transform duration-300 transform scale-100",
            { "dark:text-white": isDarkMode }
          )}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-white hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <FiX size={24} />
          </button>

          <h2 className="text-center  font-semibold mb-6 dark:text-white mt-6">
            There are 2 lines connected to your component
          </h2>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleMergeOrDelete(1)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Merge Lines
            </button>
            <button
              onClick={() => handleMergeOrDelete(2)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete All Lines
            </button>
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};

export default ModeModal;
