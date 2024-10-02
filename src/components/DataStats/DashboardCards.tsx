import React from "react";
import Image from "next/image";
import {
  FaTicketAlt,
  FaMoneyBillWave,
  FaExclamationTriangle,
} from "react-icons/fa";

// Define the structure of each card's data
interface CardDataItem {
  label: string;
  value: number | string;
}

interface DashboardCardsProps {
  cardData: CardDataItem[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ cardData }) => {
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
          <Image src="/images/map/olt.png" alt="OLT" width={40} height={40} />
        );
      case "Hand Hole":
        return (
          <Image
            src="/images/map/HandHole.png"
            alt="Household"
            width={40}
            height={40}
          />
        );
      case "ODC":
        return (
          <Image src="/images/map/odc.png" alt="ODC" width={40} height={40} />
        );
      case "TC":
        return (
          <Image src="/images/map/tc.png" alt="TC" width={40} height={40} />
        );
      case "MFAT":
        return (
          <Image src="/images/map/MFAT.png" alt="TC" width={40} height={40} />
        );
      case "SFAT":
        return (
          <Image src="/images/map/SFAT.png" alt="TC" width={40} height={40} />
        );
      default:
        return <FaTicketAlt size={30} className="text-gray-500" />;
    }
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:gap-8">
      {cardData.map((item: CardDataItem, idx: number) => (
        <div
          key={idx}
          className="relative  p-6 overflow-hidden rounded-lg bg-white dark:bg-[#122031]  bg-grid-black/[0.01] dark:bg-grid-white/[0.01]   shadow-md transition-transform transform hover:scale-105 hover:shadow-lg group"
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

          <div className="absolute inset-0 border-2 border-transparent rounded-lg group-hover:border-primary dark:group-hover:border-secondary transition-colors duration-300"></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
