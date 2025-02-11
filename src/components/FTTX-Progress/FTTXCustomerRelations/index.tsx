import BackLog from "./BackLog";
import DistributionChart from "./DistributionChart";
import Pending195TTs from "./Pending195TTs";
import SLAPieChart from "./SLAPieChart";
import WeeklyBacklogCharts from "./WeeklyBacklogCharts";

interface FTTXProgressProps {
  region: string;
}

const FTTXProgress: React.FC<FTTXProgressProps> = ({ region }) => {
  return (
    <div>
      <h2 className="text-4xl mb-8 text-center font-bold text-gray-800 dark:text-gray-100">
        FTTX Customer Relations Progress of {region}
      </h2>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <WeeklyBacklogCharts />
        </div>
        <div className="col-span-12 md:col-span-12 2xl:col-span-5  mt-4">
          <SLAPieChart />
        </div>
        <div className="col-span-12 md:col-span-9 2xl:col-span-5 mt-4">
          <DistributionChart />
        </div>
        <div className="col-span-12 md:col-span-3 2xl:col-span-2 mt-4">
          <BackLog />
        </div>{" "}
        <div className="col-span-12">
          <Pending195TTs />
        </div>
      </div>
    </div>
  );
};

export default FTTXProgress;
