"use client";
import React from "react";
import axios from "axios";
import {
  FaTicketAlt,
  FaMoneyCheckAlt,
  FaExclamationTriangle,
  FaCloudDownloadAlt,
  FaCheckCircle,
  FaThumbsDown,
  FaWindowClose,
  FaShippingFast,
  FaHourglassHalf,
} from "react-icons/fa";
import { UserService } from "@/services/userService";
import { exportToXLSX } from "@/utils/exportToExcel";

interface CardDataItem {
  label: string;
  value: number | string;
  id: string;
}

interface DashboardCardsProps {
  cardData: CardDataItem[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ cardData }) => {
  const getIconById = (id: string) => {
    switch (id) {
      case "preorder_Notpaid":
        return <FaHourglassHalf size={30} className="text-yellow-500" />; 
      case "preorder_Paid":
        return <FaMoneyCheckAlt size={30} className="text-green-500" />;
      case "purchase_But_Not_Delivered":
        return <FaShippingFast size={30} className="text-orange-500" />;
      case "rejected":
        return <FaThumbsDown size={30} className="text-red-500" />;
      case "canceled":
        return <FaWindowClose size={30} className="text-gray-500" />;
      case "confirmed_Waiting_For_Purchase":
        return <FaCheckCircle size={30} className="text-blue-500" />;
      default:
        return <FaTicketAlt size={30} className="text-gray-500" />;
    }
  };

  const userservice = new UserService();

  const handleDownload = async (id: string) => {
    try {
      const apiEndpoints: Record<string, string> = {
        preorder_Notpaid: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportPreOrderNotPaid`,
        preorder_Paid: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportPreorderPaid`,
        purchase_But_Not_Delivered: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportPurchaseButNotDelivered`,
        rejected: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportRejected`,
        canceled: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportCanceled`,
        confirmed_Waiting_For_Purchase: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportConfirmedWaitingForPurchase`,
      };

      const apiUrl = apiEndpoints[id];

      if (!apiUrl) {
        console.error(`No API endpoint configured for ID: ${id}`);
        alert("Invalid option selected.");
        return;
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${userservice.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      if (!data || data.length === 0) {
        alert("No data available to download.");
        return;
      }

      const fileName = id.replace(/_/g, "-").toLowerCase();
      exportToXLSX(data, fileName);
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to download data. Please try again.");
    }
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:gap-8">
      {cardData.map((item: CardDataItem, idx: number) => (
        <div
          key={idx}
          className="relative p-6 overflow-hidden rounded-lg bg-white dark:bg-[#122031] bg-grid-black/[0.01] dark:bg-grid-white/[0.01] shadow-md transition-transform transform hover:scale-105 hover:shadow-lg group"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-opacity-10 bg-white dark:bg-primary-dark mb-4 transition-shadow duration-300 mx-auto">
            {getIconById(item.id)}
          </div>

          <div className="z-10 relative text-center">
            <h4 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-wide transition-colors duration-300">
              {item.value}
            </h4>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
              {item.label}
            </span>
          </div>

          <div
            className="absolute top-2 z-50 right-2 cursor-pointer text-gray-500 dark:text-gray-300 text-2xl"
            onClick={() => handleDownload(item.id)}
            title={`Export ${item.label} data`}
            id={item.label === "Preorder Paid" ? "dashboard-step2" : ""}
          >
            <FaCloudDownloadAlt />
          </div>

          <div className="absolute inset-0 border-2 border-transparent rounded-lg group-hover:border-primary dark:group-hover:border-secondary transition-colors duration-300"></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
