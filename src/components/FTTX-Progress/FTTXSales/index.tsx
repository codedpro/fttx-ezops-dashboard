import FTTHSalesCities from "./FTTHSalesCities";
import SalesChart from "./SalesChart";
import SalesWeeklyProgressChart from "./SalesWeeklyProgressChart";

interface FTTXProgressProps {
  region: string;
}

const FTTXProgress: React.FC<FTTXProgressProps> = ({ region }) => {
  return (
    <div>
      <h2 className="text-4xl mb-8 text-center font-bold text-gray-800 dark:text-gray-100">
        FTTX Sales Progress of {region}
      </h2>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          {" "}
          <SalesWeeklyProgressChart />{" "}
        </div>
        <div className="col-span-8 mt-4">
          <SalesChart />
        </div>
        <div className="col-span-4 mt-4">
          <FTTHSalesCities />
        </div>
        <div className="col-span-12 mt-4"></div>
      </div>
    </div>
  );
};

export default FTTXProgress;
