"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileUpload } from "@/components/FormElements/FileUpload";
import { UserService } from "@/services/userService";
import { cn } from "@/lib/utils";

const PreorderAnalyse = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
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
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file to upload.");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      const userservice = new UserService();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHCustomerCoplainUpload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userservice.getToken()}`,
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );
      if (response.status === 200) {
        const timestamp = new Date().toISOString().replace(/:/g, "-");
        const contentType = response.headers["content-type"];
        let extension = "xlsx";
        if (contentType === "text/csv") {
          extension = "csv";
        } else if (contentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
          extension = "xlsx";
        }
        
        const fileName = `preorder-analyse_${timestamp}.${extension}`;
        
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: response.headers["content-type"] })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("File downloaded successfully!");
      } else {
        toast.error("Failed to process the file.");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while uploading the file."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-7">
          <h3 className="mb-4 text-lg font-medium text-dark dark:text-white">
            Upload Excel File
          </h3>
          <FileUpload
            onChange={handleFileUpload}
            accept={{ "excel/*": [".xlsx", ".csv"] }}
            acceptDes="XLSX, CSV"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="flex justify-center rounded-[7px] border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
              type="button"
              onClick={() => window.location.reload()}
            >
              Cancel
            </button>
            <button
              className="flex justify-center rounded-[7px] bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
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

export default PreorderAnalyse;
