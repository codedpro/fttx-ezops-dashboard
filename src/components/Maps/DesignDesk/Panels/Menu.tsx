import React, { useState } from "react";
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
  onAddObject: (object: string, lat: string, lng: string) => void;
  onDrawLine: (
    lineType: string,
    points: { lat: string; lng: string }[]
  ) => void;
  onFlyToObject: (lat: string, lng: string) => void;
  onFlyToLine: (points: { lat: string; lng: string }[]) => void;
  onAddKMZ: () => void;
  onSelectKMZ: (kmz: string) => void;
  onSelectDraft: (draft: string) => void;
}

const MenuPanel: React.FC<MenuPanelProps> = ({
  onAddObject,
  onDrawLine,
  onFlyToObject,
  onFlyToLine,
  onAddKMZ,
  onSelectKMZ,
  onSelectDraft,
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
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [linePoints, setLinePoints] = useState<{ lat: string; lng: string }[]>(
    []
  );
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  const handleAddPoint = () => {
    if (lat && lng) {
      setLinePoints([...linePoints, { lat, lng }]);
      setLat("");
      setLng("");
    }
  };

  const handleUndoPoint = () => {
    setLinePoints(linePoints.slice(0, -1));
  };

  const handleCancel = () => {
    setLat("");
    setLng("");
    setSelectedObject(null);
    setLinePoints([]);
    if (previousMenu) {
      setCurrentMenu(previousMenu); // Go back to previous menu
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

  const renderObjectDetails = () => {
    // Find the selected object's image
    const selectedObjectData = OBJECTS.find(
      (object) => object.label === selectedObject
    );
    return (
      <>
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
            type="text"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="p-2 border rounded w-24"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="p-2 border rounded w-24"
          />
          <ActionButton
            label="Done"
            icon={<FaCheck />}
            onClick={() => {
              if (selectedObject && lat && lng) {
                onAddObject(selectedObject, lat, lng);
                handleCancel();
              }
            }}
          />
          <ActionButton
            label="Fly to"
            icon={<FaMapMarkedAlt />}
            onClick={() => {
              if (lat && lng) {
                onFlyToObject(lat, lng);
              }
            }}
          />
          <ActionButton
            label="Cancel"
            icon={<FaTimes />}
            onClick={handleCancel}
          />
        </div>
      </>
    );
  };

  const renderLineDetails = () => {
    // Find the selected line's color
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
          <input
            type="text"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="p-2 border rounded w-24"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="p-2 border rounded w-24"
          />
          <ActionButton
            label="Add Point"
            icon={<FaPlus />}
            onClick={handleAddPoint}
          />
          <ActionButton
            label="Undo"
            icon={<FaUndo />}
            onClick={handleUndoPoint}
          />
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
              if (selectedLine && linePoints.length > 0) {
                onDrawLine(selectedLine, linePoints);
                handleCancel();
              }
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
