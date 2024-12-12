"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import ClickOutside from "@/components/ClickOutside";
import { FaTimes } from "react-icons/fa";
import { UserService } from "@/services/userService";
import { fetchFTTHGetPayloadUseDaily } from "@/lib/actions";
import TableThree from "../Tables/TableThree";

interface PayloadDayModalProps {
  date: string;
  city: string; // Added city prop
  onClose: () => void;
}

interface Column {
  key: string;
  label: string;
  isClickable?: boolean;
  formatter?: (value: any) => string | JSX.Element;
}

interface PayloadData {
  City: string | null;
  Usage: number;
  ftth_id: number;
  modem_id: string;
}

const PayloadDayModal: React.FC<PayloadDayModalProps> = ({ date, city, onClose }) => {
  const [data, setData] = useState<PayloadData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const userServiceRef = useRef<UserService>(new UserService());

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    triggerElementRef.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();
    return () => {
      triggerElementRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = userServiceRef.current.getToken() || "";
        let payloadData = await fetchFTTHGetPayloadUseDaily(token, date);

        // If city is not "all", filter the payload data to only include that city
        if (city !== "all") {
          payloadData = payloadData.filter((item: PayloadData) => item.City === city);
        }

        setData(payloadData);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, city]);

  const formatNumberWithCommas = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace(/\s/g, ",");
  };

  const columns = useMemo<Column[]>(
    () => [
      { key: "ftth_id", label: "FTTH ID", isClickable: true },
      { key: "City", label: "City" },
      { key: "Usage", label: "Usage (MB)", formatter: formatNumberWithCommas },
    ],
    []
  );

  const tableHeader = "FTTH Payload Usage";
  const tableEmoji = "📊";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payload-modal-title"
    >
      <ClickOutside
        onClick={handleClose}
        className="bg-white dark:bg-[#122031] rounded-lg p-0 w-11/12 max-w-4xl max-h-[80vh] shadow-lg relative flex flex-col"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-[#122031] z-10 p-6 border-b dark:border-[#1F2B37]">
          <button
            onClick={handleClose}
            ref={closeButtonRef}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Close Modal"
          >
            <FaTimes size={20} />
          </button>
          <h2
            id="payload-modal-title"
            className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100"
          >
            Payload Details for {date}
          </h2>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <svg
                className="animate-spin h-10 w-10 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && data.length === 0 && (
            <div className="p-4 bg-yellow-100 text-yellow-700 rounded mb-4">
              <p>No data available.</p>
            </div>
          )}
          {!loading && !error && data.length > 0 && (
            <TableThree
              data={data}
              columns={columns}
              header={tableHeader}
              emoji={tableEmoji}
              initialLimit={10}
            />
          )}
        </div>
      </ClickOutside>
    </div>
  );
};

export default PayloadDayModal;
