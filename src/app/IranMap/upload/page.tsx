"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileUpload } from "@/components/FormElements/FileUpload";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import { UserService } from "@/services/userService";
import { cn } from "@/lib/utils";

const IranMapUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle file selection
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // Handle date selection from DatePickerOne
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  // Watch for dark mode changes
  useEffect(() => {
    const updateDarkMode = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDarkMode(dark);
    };
    updateDarkMode();
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Submit handler
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file to upload.");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a date to associate with the upload.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      // Format date as YYYY-MM-DD
      const isoDate = selectedDate.toISOString().split('T')[0];
      formData.append("date", isoDate);

      const userService = new UserService();
      const response = await axios.post(
        `/api/IranMapDashboardImport`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userService.getToken()}`,
          },
        }
      );

      // Display API message
      if (response.status === 200 && response.data?.message) {
        toast.success(response.data.message);
        // reset form
        setSelectedFile(null);
        setSelectedDate(null);
      } else {
        toast.error("Upload completed but no confirmation message received.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-7">
          <h3 className="mb-4 text-lg font-medium text-dark dark:text-white">
            Upload Excel File with Date
          </h3>
          <div className="mb-4">
            <DatePickerOne
              value={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>
          <FileUpload
            onChange={handleFileUpload}
            accept={{ "excel/*": [".xlsx"] }}
            acceptDes="XLSX"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="flex justify-center rounded-[7px] border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setSelectedDate(null);
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="flex justify-center rounded-[7px] bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || !selectedDate || loading}
            >
              {loading ? "Processing..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
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
    </DefaultLayout>
  );
};

export default IranMapUpload;
