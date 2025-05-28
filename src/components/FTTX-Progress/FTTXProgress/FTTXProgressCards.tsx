"use client";

import React from "react";
import {
  FiActivity,
  FiHome,
  FiSettings,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
import { FaCity, FaHouseUser, FaArrowUp, FaArrowDown } from "react-icons/fa";

interface DeploymentData {
  Cities: number;
  Households: number;
  Percentage: string;
  AdditionalCities?: number;
}

interface FTTXProgressData {
  Deployment: Record<string, DeploymentData>;
}

interface FTTXDeploymentCardsProps {
  data: FTTXProgressData;
}

const deploymentChanges: Record<string, number> = {
  Ongoing: 2.5,
  InHouse: -1.2,
  FTK: 0.8,
  ServCo: -3.4,
  FCP: 1.7,
};

const deploymentIcons: { [key: string]: React.ElementType } = {
  Ongoing: FiActivity,
  InHouse: FiHome,
  FTK: FiSettings,
  ServCo: FiUsers,
  FCP: FiTrendingUp,
};

const FTTXDeploymentCards: React.FC<FTTXDeploymentCardsProps> = ({ data }) => {
 
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Object.entries(data.Deployment).map(([key, value]) => {
        const deployment = value as DeploymentData;
        const IconComponent = deploymentIcons[key] || FiActivity;
        const percentValue = parseFloat(deployment.Percentage);
        const changeValue = deploymentChanges[key] || 0;
        const isPositive = changeValue >= 0;
        const ArrowIcon = isPositive ? FaArrowUp : FaArrowDown;
        const arrowColor = isPositive ? "text-green-500" : "text-red-500";

        return (
          <div
            key={key}
            className="relative p-6 overflow-hidden rounded-lg bg-white dark:bg-[#122031] bg-grid-black/[0.1] dark:bg-grid-white/[0.05] shadow-md hover:shadow-lg transform transition-transform hover:scale-105 group border border-gray-200 dark:border-gray-700"
          >
            {/* Background Overlay */}
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-[#122031] bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

            <div className="relative z-10 flex flex-col items-center space-y-5">
              {/* Main Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light dark:bg-secondary-dark transition-shadow duration-300 group-hover:animate-rotate-shine">
                <IconComponent size={30} className="text-primary" />
              </div>

              {/* Card Title */}
              <h4 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-100">
                {key}
              </h4>

              {/* Statistics */}
              <div className="w-full space-y-3">
                {/* Cities Row */}
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                  <FaCity className="text-lg" />
                  <span className="font-semibold">Cities:</span>
                  <span className="text-xl font-semibold">{deployment.Cities}</span>
                  {deployment.AdditionalCities != null && (
                    <span className="ml-1 text-xs text-gray-500">
                      (+{deployment.AdditionalCities})
                    </span>
                  )}
                </div>

                {/* Households Row */}
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                  <FaHouseUser className="text-lg" />
                  <span className="font-semibold">HH:</span>
                  <span className="text-xl font-semibold">
                    {deployment.Households.toLocaleString()}
                  </span>
                </div>

                {/* Percentage & Change */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-bold text-primary">
                      {deployment.Percentage}
                    </span>
                    <span className={`flex items-center gap-1 ${arrowColor}`}>
                      <ArrowIcon />
                      <span className="text-sm">{Math.abs(changeValue)}%</span>
                    </span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentValue}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Border Effect */}
            <div className="absolute inset-0 border-2 border-transparent rounded-lg group-hover:border-primary transition-colors"></div>
          </div>
        );
      })}
    </div>
  );
};

export default FTTXDeploymentCards;
