import { useState, useRef } from "react";
import ClickOutside from "@/components/ClickOutside";

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});

  const confirm = (callback: () => void) => {
    setIsOpen(true);
    setOnConfirm(() => callback);
  };

  const cancel = () => {
    setIsOpen(false);
  };

  const ConfirmationModal = ({ message }: { message: string }) => {
    const exceptionRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <ClickOutside onClick={cancel} exceptionRef={exceptionRef}>
          <div
            ref={exceptionRef}
            className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 dark:text-white text-gray-900"
          >
            <p className="mb-4 text-lg">{message}</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={cancel}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  transition: "opacity 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#c53537";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                }}
                onClick={() => {
                  setIsOpen(false);
                  onConfirm();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </ClickOutside>
      </div>
    );
  };

  return { confirm, ConfirmationModal };
};
