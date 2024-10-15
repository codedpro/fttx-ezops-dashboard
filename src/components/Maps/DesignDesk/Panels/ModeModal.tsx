import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import ClickOutside from "@/components/ClickOutside";
import { cn } from "@/lib/utils";
import { ConnectedLines } from "@/types/connectedLines";
import { ObjectData } from "@/types/ObjectData";

interface ModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    mode: number,
    objectData?: ObjectData,
    chainOrder?: number[]
  ) => void;
  ConnectedLinesToComponent: ConnectedLines;
}

const ModeModal: React.FC<ModeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ConnectedLinesToComponent,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMergeStep, setIsMergeStep] = useState(false);
  const [chainOrder, setChainOrder] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setChainOrder([
        ConnectedLinesToComponent.firstComponentChainID,
        ConnectedLinesToComponent.secondComponentChainID,
      ]);
    }
  }, [isOpen, ConnectedLinesToComponent]);

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
    if (mode === 1) {
      setIsMergeStep(true);
    } else {
      onSubmit(mode);
      onClose();
    }
  };

  const handleMergeSubmit = () => {
    onSubmit(1, undefined, chainOrder);
    onClose();
  };

  const handleReverseOrder = () => {
    setChainOrder((prevOrder) => [...prevOrder].reverse());
  };

  const renderMergeOptions = () => (
    <div className="space-y-4">
      <h3 className="text-center font-semibold mb-6 dark:text-white mt-6">
        Select the merge order:
      </h3>
      <div className="flex flex-col items-center space-y-2">
        <div className="text-lg dark:text-white">
          <strong>First:</strong>{" "}
          {chainOrder[0] === ConnectedLinesToComponent.firstComponentChainID
            ? ConnectedLinesToComponent.firstComponentName
            : ConnectedLinesToComponent.secondComponentName}
        </div>
        <div className="text-lg dark:text-white">
          <strong>Second:</strong>{" "}
          {chainOrder[1] === ConnectedLinesToComponent.firstComponentChainID
            ? ConnectedLinesToComponent.firstComponentName
            : ConnectedLinesToComponent.secondComponentName}
        </div>
        <button
          onClick={handleReverseOrder}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Reverse Order
        </button>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={handleMergeSubmit}
          className={cn(
            "bg-green-600 text-white px-4 py-2 rounded-md transition-colors",
            !chainOrder && "opacity-50 cursor-not-allowed"
          )}
        >
          Confirm Merge
        </button>
        <button
          onClick={() => setIsMergeStep(false)}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );

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

          {isMergeStep ? (
            renderMergeOptions()
          ) : (
            <>
              <h2 className="text-center font-semibold mb-6 dark:text-white mt-6">
                {`There are ${ConnectedLinesToComponent.count} lines connected to your component.`}
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
            </>
          )}
        </div>
      </ClickOutside>
    </div>
  );
};

export default ModeModal;
