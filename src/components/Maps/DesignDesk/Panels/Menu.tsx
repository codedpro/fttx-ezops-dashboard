import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaDrawPolygon,
  FaMapMarkerAlt,
  FaFolderOpen,
  FaArrowLeft,
  FaCheck,
  FaUndo,
  FaTimes,
  FaMapMarkedAlt,
} from "react-icons/fa";

import { OBJECTS, LINES, KMZ_FILES, DRAFTS } from "@/data/designdeskMenu";
import { ActionButton } from "@/components/Buttons/ActionButton";

interface MenuPanelProps {
  onAddObject: (
    object: string,
    lat: number,
    lng: number,
    selectedObjectImage: string
  ) => void;
  onStartLineDraw: (lineType: string, lineColor: string) => void;
  onFinishLineDraw: () => void;
  onCancelLineDraw: () => void;
  onFlyToObject: (lat: number, lng: number) => void;
  onFlyToLine: (points: { lat: number; lng: number }[]) => void;
  onAddKMZ: () => void;
  onSelectKMZ: (kmz: string) => void;
  onSelectDraft: (draft: string) => void;
  onIsAddingObjectChange: (
    isAdding: boolean,
    objectDetails: {
      object: string | null;
      lat: number | null;
      lng: number | null;
      image: string | null;
    } | null
  ) => void;
  setObjectLat: (lat: number) => void;
  setObjectLng: (lng: number) => void;
  objectLat: number | null;
  objectLng: number | null;
  linePoints: { lat: number; lng: number }[]; 
}

const MenuPanel: React.FC<MenuPanelProps> = ({
  onAddObject,
  onStartLineDraw,
  onFinishLineDraw,
  onCancelLineDraw,
  onFlyToObject,
  onFlyToLine,
  onAddKMZ,
  onSelectKMZ,
  onSelectDraft,
  onIsAddingObjectChange,
  setObjectLat,
  setObjectLng,
  objectLat,
  objectLng,
  linePoints,
}) => {
  const [currentMenu, setCurrentMenu] = useState<
    | "main"
    | "objects"
    | "lines"
    | "kmz"
    | "drafts"
    | "objectDetails"
    | "lineDetails"
  >("main");

  const [previousMenu, setPreviousMenu] = useState<"objects" | "lines" | null>(
    null
  );
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [isAddingObject, setIsAddingObject] = useState(false);

  useEffect(() => {
    if (selectedLine) {
      const selectedLineData = LINES.find(
        (line) => line.label === selectedLine
      );
      if (selectedLineData) {
        onStartLineDraw(selectedLine, selectedLineData.color);
      }
    }
  }, [selectedLine]);

  const handleCancel = () => {
    const objectDetails = selectedObject
      ? {
          object: selectedObject,
          lat: null,
          lng: null,
          image: null,
        }
      : null;

    setSelectedObject(null);
    setSelectedLine(null);
    setIsAddingObject(false);
    onIsAddingObjectChange(false, objectDetails);
    onCancelLineDraw(); 

    if (previousMenu) {
      setCurrentMenu(previousMenu);
    } else {
      setCurrentMenu("main");
    }
  };

  const renderMainMenu = () => (
    <>
      <ActionButton
        label="Add Objects"
        icon={<FaPlus />}
        onClick={() => setCurrentMenu("objects")}
      />
      <ActionButton
        label="Draw Lines"
        icon={<FaDrawPolygon />}
        onClick={() => setCurrentMenu("lines")}
      />
      <ActionButton
        label="KMZ"
        icon={<FaMapMarkerAlt />}
        onClick={() => setCurrentMenu("kmz")}
      />
      <ActionButton
        label="Drafts"
        icon={<FaFolderOpen />}
        onClick={() => setCurrentMenu("drafts")}
      />
      <ActionButton
        label="Submit"
        icon={<FaCheck />}
        onClick={() => console.log("Submit action triggered")}
      />
    </>
  );

  const renderSubMenu = (
    title: string,
    items: any[],
    onItemClick: (item: string) => void,
    showAddButton: boolean = false,
    onAddNewItem?: () => void
  ) => (
    <>
      {items.map((item) => (
        <ActionButton
          key={typeof item === "string" ? item : item.label}
          label={typeof item === "string" ? item : item.label}
          icon={
            typeof item === "object" && item.image ? (
              <img src={item.image} alt={item.label} className="w-6 h-6" />
            ) : typeof item === "object" && item.color ? (
              <span
                className="w-4 h-4 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              />
            ) : undefined
          }
          onClick={() =>
            onItemClick(typeof item === "string" ? item : item.label)
          }
        />
      ))}
      {showAddButton && (
        <ActionButton
          label="Add"
          icon={<FaPlus />}
          onClick={onAddNewItem || (() => console.log("Default add action"))}
        />
      )}
      <ActionButton
        label="Back"
        icon={<FaArrowLeft />}
        onClick={() => setCurrentMenu("main")}
      />
    </>
  );

  // Render the object details input
  const renderObjectDetails = () => {
    const selectedObjectData = OBJECTS.find(
      (object) => object.label === selectedObject
    );

    return (
      <div className="flex items-center space-x-2">
        <ActionButton
          label={selectedObject || ""}
          icon={
            selectedObjectData ? (
              <img src={selectedObjectData.image} className="w-6" />
            ) : null
          }
          onClick={() => {}}
        />
        <input
          type="number"
          placeholder="Latitude"
          value={objectLat !== null ? objectLat : ""}
          onChange={(e) => {
            const newLat = parseFloat(e.target.value);
            if (!isNaN(newLat)) {
              setObjectLat(newLat); // Update object's latitude in the map
            }
          }}
          className="p-2 border rounded w-24"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={objectLng !== null ? objectLng : ""}
          onChange={(e) => {
            const newLng = parseFloat(e.target.value);
            if (!isNaN(newLng)) {
              setObjectLng(newLng); // Update object's longitude in the map
            }
          }}
          className="p-2 border rounded w-24"
        />
        <ActionButton
          label="Done"
          icon={<FaCheck />}
          onClick={() => {
            if (
              selectedObject &&
              objectLat !== null &&
              objectLat !== 0 &&
              objectLng !== null &&
              objectLng !== 0 &&
              selectedObjectData
            ) {
              onAddObject(
                selectedObject,
                objectLat,
                objectLng,
                selectedObjectData.image
              );
              handleCancel();
            }
          }}
        />
        <ActionButton
          label="Fly to"
          icon={<FaMapMarkedAlt />}
          onClick={() => {
            if (objectLat !== null && objectLng !== null) {
              onFlyToObject(objectLat, objectLng);
            }
          }}
        />
        <ActionButton
          label="Cancel"
          icon={<FaTimes />}
          onClick={handleCancel}
        />
      </div>
    );
  };

  // Render the line details input
  const renderLineDetails = () => {
    const selectedLineData = LINES.find((line) => line.label === selectedLine);
    return (
      <>
        <div className="flex items-center space-x-2">
          <ActionButton
            label={selectedLine || ""}
            icon={
              selectedLineData ? (
                <span
                  className="w-4 h-4 inline-block rounded-full"
                  style={{ backgroundColor: selectedLineData.color }}
                />
              ) : null
            }
            onClick={() => {}}
          />
          {/*       <input
            type="number"
            placeholder="Latitude"
            value={objectLat !== null ? objectLat : ""}
            onChange={(e) => {
              const newLat = parseFloat(e.target.value);
              if (!isNaN(newLat)) {
                setObjectLat(newLat);
              }
            }}
            className="p-2 border rounded w-24"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={objectLng !== null ? objectLng : ""}
            onChange={(e) => {
              const newLng = parseFloat(e.target.value);
              if (!isNaN(newLng)) {
                setObjectLng(newLng);
              }
            }}
            className="p-2 border rounded w-24"
          />
          <ActionButton
            label="Add Point"
            icon={<FaPlus />}
            onClick={() => {
              if (objectLat !== null && objectLng !== null) {
                onAddLinePoint({ lat: objectLat, lng: objectLng });
              }
            }}
          /> */}

          <ActionButton
            label="Fly to"
            icon={<FaMapMarkedAlt />}
            onClick={() => {
              if (linePoints.length > 0) {
                onFlyToLine(linePoints);
              }
            }}
          />
          <ActionButton
            label="Cancel"
            icon={<FaTimes />}
            onClick={handleCancel}
          />
          <ActionButton
            label="Done"
            icon={<FaCheck />}
            onClick={() => {
              onFinishLineDraw();
              handleCancel();
            }}
          />
        </div>
      </>
    );
  };

  return (
    <div className="absolute text-xs bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-row flex-wrap justify-center space-x-2 sm:space-x-4">
      {currentMenu === "main" && renderMainMenu()}
      {currentMenu === "objects" &&
        renderSubMenu("Add Objects", OBJECTS, (object) => {
          setPreviousMenu("objects");
          setSelectedObject(object);
          const selectedObjectData = OBJECTS.find(
            (obj) => obj.label === object
          );

          setIsAddingObject(true);
          onIsAddingObjectChange(true, {
            object,
            lat: objectLat,
            lng: objectLng,
            image: selectedObjectData?.image || null,
          });
          setCurrentMenu("objectDetails");
        })}

      {currentMenu === "lines" &&
        renderSubMenu("Draw Lines", LINES, (line) => {
          setPreviousMenu("lines");
          setSelectedLine(line);
          setCurrentMenu("lineDetails");
        })}
      {currentMenu === "kmz" &&
        renderSubMenu("KMZ Files", KMZ_FILES, onSelectKMZ, true, onAddKMZ)}
      {currentMenu === "drafts" &&
        renderSubMenu("Drafts", DRAFTS, onSelectDraft, true, () =>
          console.log("Add new draft")
        )}
      {currentMenu === "objectDetails" && renderObjectDetails()}
      {currentMenu === "lineDetails" && renderLineDetails()}
    </div>
  );
};

export default MenuPanel;
