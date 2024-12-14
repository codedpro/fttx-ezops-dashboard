"use client";
import React, { useState } from "react";
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
  FaExclamationCircle,
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
  const userService = new UserService();
  const [activeDownload, setActiveDownload] = useState<string | null>(null);
  const [completedDownload, setCompletedDownload] = useState<string | null>(
    null
  );

  const getIconById = (id: string) => {
    const iconMapping: Record<string, JSX.Element> = {
      preorder_Notpaid: (
        <FaExclamationCircle size={30} className="icon text-primary" />
      ),
      preorder_Paid: (
        <FaMoneyCheckAlt size={30} className="icon text-primary" />
      ),
      purchase_But_Not_Delivered: (
        <FaShippingFast size={30} className="icon text-primary" />
      ),
      rejected: <FaThumbsDown size={30} className="icon text-primary" />,
      canceled: <FaWindowClose size={30} className="icon text-primary" />,
      confirmed_Waiting_For_Purchase: (
        <FaHourglassHalf size={30} className="icon text-primary" />
      ),
    };
    return (
      iconMapping[id] || <FaTicketAlt size={30} className="icon text-primary" />
    );
  };

  const handleDownload = async (id: string) => {
    setActiveDownload(id);
    setCompletedDownload(null);

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
        alert("Invalid option selected.");
        setActiveDownload(null);
        return;
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${userService.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      if (!data || data.length === 0) {
        alert("No data available to download.");
        setActiveDownload(null);
        return;
      }

      const fileName = id.replace(/_/g, "-").toLowerCase();
      exportToXLSX(data, fileName);
      setCompletedDownload(id);
    } catch (error) {
      alert("Failed to download data. Please try again.");
    } finally {
      setActiveDownload(null);
    }
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:gap-8">
      {cardData.map((item) => (
        <div
          key={item.id}
          className="relative p-6 overflow-hidden rounded-lg bg-white dark:bg-[#122031] bg-grid-black/[0.01] dark:bg-grid-white/[0.01] shadow-md hover:shadow-lg transform transition-transform hover:scale-105 group"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-opacity-10 bg-primary-light dark:bg-secondary-dark mb-4 mx-auto transition-shadow duration-300">
            <div className="group-hover:animate-rotate-shine">
              {getIconById(item.id)}
            </div>
          </div>

          <div className="relative z-10 text-center">
            <h4 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors">
              {item.value}
            </h4>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
              {item.label}
            </span>
          </div>

          <div
            className={`absolute top-2 right-2 z-50 cursor-pointer text-2xl transition-transform ${
              activeDownload === item.id
                ? "text-primary animate-blink"
                : completedDownload === item.id
                  ? "text-primary animate-bounce"
                  : "text-gray-500 hover:text-primary"
            }`}
            onClick={() => handleDownload(item.id)}
            title={`Export ${item.label} data`}
          >
            {completedDownload === item.id ? (
              <FaCheckCircle />
            ) : (
              <FaCloudDownloadAlt />
            )}
          </div>

          {/* Hover Border Effect */}
          <div className="absolute inset-0 border-2 border-transparent rounded-lg group-hover:border-primary transition-colors"></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
