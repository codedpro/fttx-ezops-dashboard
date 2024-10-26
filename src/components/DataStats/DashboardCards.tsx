"use client";
import React from "react";
import Image from "next/image";
import axios from "axios";

import {
  FaTicketAlt,
  FaMoneyBillWave,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useFTTHComponentsOtherStore } from "@/store/FTTHComponentsOtherStore";
import { useFTTHComponentsFatStore } from "@/store/FTTHComponentsFatStore";
import { FaCloudDownloadAlt } from "react-icons/fa";
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
  const others = useFTTHComponentsOtherStore((state) => state.others);
  const fats = useFTTHComponentsFatStore((state) => state.fats);

  const getIconOrImage = (label: string) => {
    switch (label) {
      case "Preorder Not Paid":
        return <FaExclamationTriangle size={30} className="text-yellow-500" />;
      case "Preorder Paid":
        return <FaMoneyBillWave size={30} className="text-green-500" />;
      case "UT Closed":
        return <FaTicketAlt size={30} className="text-blue-500" />;
      case "UT Open":
        return <FaTicketAlt size={30} className="text-red-500" />;
      case "OLT":
        return (
          <Image src="/images/map/OLT.png" alt="OLT" width={40} height={40} />
        );
      case "Hand Hole":
        return (
          <Image
            src="/images/map/HandHole.png"
            alt="Hand Hole"
            width={40}
            height={40}
          />
        );
      case "ODC":
        return (
          <Image src="/images/map/ODC.png" alt="ODC" width={40} height={40} />
        );
      case "TC":
        return (
          <Image src="/images/map/TC.png" alt="TC" width={40} height={40} />
        );
      case "MFAT":
        return (
          <Image src="/images/map/MFAT.png" alt="MFAT" width={40} height={40} />
        );
      case "SFAT":
        return (
          <Image src="/images/map/SFAT.png" alt="SFAT" width={40} height={40} />
        );
      default:
        return <FaTicketAlt size={30} className="text-gray-500" />;
    }
  };

  const userservice = new UserService();
  const handleDownload = async (id: string) => {
    try {
      let data: any[] = [];
      let fileName: string = "";

      switch (id) {
        case "preorder_Notpaid":
          const responseNotPaid = await axios.get(
            `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportPreOrderNotPaid`,
            {
              headers: {
                Authorization: `Bearer ${userservice.getToken()}`,
                "Content-Type": "application/json",
              },
            }
          );
          data = responseNotPaid.data;
          fileName = "preorder_not_paid";
          break;
        case "preorder_Paid":
          const responsePaid = await axios.get(
            `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportPreorderPaid`,
            {
              headers: {
                Authorization: `Bearer ${userservice.getToken()}`,
                "Content-Type": "application/json",
              },
            }
          );
          data = responsePaid.data;
          fileName = "preorder_paid";
          break;
        case "sfat":
          data = fats.filter((fat) => fat.Type === "SFAT");
          fileName = "sfat";
          break;
        case "mfat":
          data = data = fats.filter((fat) => fat.Type === "MFAT");
          fileName = "mfat";
          break;
        case "olt":
          data = others.filter((component) => component.Type === "OLT");
          fileName = "olt";
          break;
        case "hh":
          data = others.filter((component) => component.Type === "HH");
          fileName = "hand_hole";
          break;
        case "odc":
          data = others.filter((component) => component.Type === "ODC");
          fileName = "odc";
          break;
        case "tc":
          data = others.filter((component) => component.Type === "TC");
          fileName = "tc";
          break;
        default:
          console.error("No handler for this card ID");
          return;
      }

      if (data.length === 0) {
        alert("No data available to download.");
        return;
      }

      exportToXLSX(data, fileName);
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to download data. Please try again.");
    }
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
      {cardData.map((item: CardDataItem, idx: number) => (
        <div
          key={idx}
          className="relative p-6 overflow-hidden rounded-lg bg-white dark:bg-[#122031] bg-grid-black/[0.01] dark:bg-grid-white/[0.01] shadow-md transition-transform transform hover:scale-105 hover:shadow-lg group"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-opacity-10 bg-white dark:bg-primary-dark mb-4 transition-shadow duration-300 mx-auto">
            {getIconOrImage(item.label)}
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
            className="absolute top-2 z-50  right-2 cursor-pointer text-gray-500 dark:text-gray-300 text-2xl"
            onClick={() => handleDownload(item.id)}
            title={`Export ${item.label} data`}
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
