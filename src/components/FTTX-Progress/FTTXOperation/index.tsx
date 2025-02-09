import React from "react";
import FATAndComplexCharts from "./FAT&ComplexCharts";
import OperationWeeklyProgressChart from "./WeeklyProgressChart";
import JCCAndOLTCharts from "./JCCAndOLTCharts";
import { FTTX_OPERATION_PROGRESS_DATA } from "@/data/fttxOperationProgressData";

interface FTTXProgressProps {
  region: string;
}

const FTTXProgress: React.FC<FTTXProgressProps> = ({ region }) => {
  return (
    <div>
      <h2 className="text-4xl mb-8 text-center font-bold text-gray-800 dark:text-gray-100">
        FTTX Operation Progress of {region}
      </h2>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <FATAndComplexCharts />
        </div>

        <div className="col-span-12 mt-4">
          <OperationWeeklyProgressChart
            title="Weekly Progress"
            weeklyProgressData={
              FTTX_OPERATION_PROGRESS_DATA.Performance.WeeklyProgress
            }
          />
        </div>

        <div className="col-span-12 mt-4">
          <JCCAndOLTCharts />
        </div>
        <div className="col-span-12 mt-4">
          <OperationWeeklyProgressChart
            title="Weekly  Progress"
            weeklyProgressData={FTTX_OPERATION_PROGRESS_DATA.WeeklyProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default FTTXProgress;
