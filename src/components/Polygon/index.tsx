import React from "react";

interface PolygonToolProps {
  startPolygonMode: () => void;
  deleteLastPolygon: () => void;
}

const PolygonTool: React.FC<PolygonToolProps> = ({
  startPolygonMode,
  deleteLastPolygon,
}) => {
  return (
    <>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10   rounded-lg p-4 flex flex-col items-center">
        <div className="flex flex-row space-x-2">
          <button
            onClick={startPolygonMode}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
          >
            Draw
          </button>
          <button
            onClick={deleteLastPolygon}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default PolygonTool;
