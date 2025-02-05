import React from "react";
import FTTXProgressCards from "./FTTXProgressCards";
import Excavation from "./Excavation";

interface FTTXProgressProps {
  region: string;
}

const FTTXProgress: React.FC<FTTXProgressProps> = ({ region }) => {
  return (
    <div>
      <h2 className="text-4xl mb-2 text-center font-bold text-gray-800 dark:text-gray-100">
        FTTX Progress of {region}
      </h2>

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12">
          <FTTXProgressCards />
        </div>
        <div className="col-span-12">
          <Excavation />
        </div>
      </div>
    </div>
  );
};

export default FTTXProgress;
