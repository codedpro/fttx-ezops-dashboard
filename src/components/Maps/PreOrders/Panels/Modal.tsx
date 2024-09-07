import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  data: any;
  onClose: () => void;
  onEdit: (point: any) => void;
}

export const Modal: React.FC<ModalProps> = ({ data, onClose, onEdit }) => {
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (e.target.id === "modal-overlay") {
        onClose();
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-3/4 max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300"
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-2xl font-bold dark:text-white mb-4">Details</h2>
        <div className="text-gray-800 dark:text-gray-200">
          {Object.keys(data).map((key) => (
            <p key={key}>
              <strong>{key}:</strong> {data[key]}
            </p>
          ))}
        </div>
        <button
          onClick={() => onEdit(data)} // Trigger edit mode
          className="mt-6 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Edit
        </button>
      </div>
    </div>
  );
};
