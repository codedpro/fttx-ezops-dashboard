import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserService } from "@/services/userService";

interface ModeModalProps {
  isOpen: boolean;
  chainId: number;
  onClose: () => void;
  onSubmit: (mode: number) => void;
}

const ModeModal: React.FC<ModeModalProps> = ({
  isOpen,
  chainId,
  onClose,
  onSubmit,
}) => {
  const [connectedLines, setConnectedLines] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const userservice = new UserService();
  useEffect(() => {
    if (isOpen && chainId) {
      axios
        .post(
          `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHHowManyLinesConnected`,

          chainId,

          {
            headers: {
              Authorization: `Bearer ${userservice.getToken()}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          const numLines = response.data;
          setConnectedLines(numLines);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching connected lines:", error);
          setLoading(false);
        });
    }
  }, [isOpen, chainId]);

  useEffect(() => {
    if (connectedLines !== null) {
      if (connectedLines === 0) {
        onSubmit(0);
        onClose();
      } else if (connectedLines === 1) {
        onSubmit(2);
        onClose();
      } else if (connectedLines > 2) {
        onSubmit(2);
        onClose();
      }
    }
  }, [connectedLines, onSubmit, onClose]);

  const handleMergeOrDelete = (mode: number) => {
    onSubmit(mode);
    onClose();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg">
          <h2 className="text-lg font-semibold dark:text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          {connectedLines === 2
            ? "There are 2 lines connected. Do you want to merge or delete all lines?"
            : "Choose Mode"}
        </h2>

        {connectedLines === 2 && (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handleMergeOrDelete(1)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Merge Lines
            </button>
            <button
              onClick={() => handleMergeOrDelete(2)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete All Lines
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="px-4 py-2 mt-4 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ModeModal;
