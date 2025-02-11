import SiteEntryCards from "./SiteEntryCards";

interface FTTXProgressProps {
  region: string;
}

const FTTXProgress: React.FC<FTTXProgressProps> = ({ region }) => {
  return (
    <div>
      <h2 className="text-4xl mb-8 text-center font-bold text-gray-800 dark:text-gray-100">
        FTTX Site Entry Progress of {region}
      </h2>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <SiteEntryCards />
        </div>
      </div>
    </div>
  );
};

export default FTTXProgress;
