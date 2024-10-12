import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { gsap, Power2, Back } from "gsap";
import { useRouter } from "next/navigation";
import { Feature } from "geojson";
import { DataCards } from "./DataCards";
import { ObjectMenu } from "./ObjectMenu";
import { ActionButtons } from "./ActionButtons";
import { ActionButtonsObject } from "./ActionButtonsObject";
import { LineData } from "@/types/LineData";
import { ObjectData } from "@/types/ObjectData";

interface ModalProps {
  data: Record<string, any>;
  onClose: () => void;
  onEdit?: (point: any) => void;
  onEditLine?: (lineData: LineData) => void;
  lineData?: Feature;
  onDeleteLine?: (lineData: LineData) => void;
  onAddObjectToLine?: (
    lineData: LineData,
    objectLabel: string,
    clickedLatLng: { lat: number; lng: number }
  ) => void;
  clickedLatLng?: { lat: number; lng: number } | null;
  onEditObject?: (ObjectData: ObjectData) => void;
  onDeleteObject?: (ObjectData: ObjectData) => void;
}

export const Modal: React.FC<ModalProps> = ({
  data,
  onClose,
  onEdit,
  onEditLine,
  lineData,
  onDeleteLine,
  onAddObjectToLine,
  clickedLatLng,
  onEditObject,
  onDeleteObject,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showObjectMenu, setShowObjectMenu] = useState(false);
  const [selectedLineData, setSelectedLineData] = useState<LineData | null>(
    null
  );

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.7, y: 100, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 1,
          ease: Back.easeOut.config(1.4),
        }
      );
    }

    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: Power2.easeInOut,
          onStart: () => {
            document.body.style.overflow = "hidden";
          },
        }
      );
    }

    const handleOutsideClick = (e: any) => {
      if (e.target.id === "modal-overlay") {
        handleClose();
      }
    };

    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      scale: 0.7,
      y: 100,
      opacity: 0,
      duration: 0.8,
      ease: Back.easeIn.config(1.4),
      onComplete: () => {
        onClose();
      },
    });

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: Power2.easeInOut,
    });
  };

  const handleShowDetails = () => {
    if (data.Modem_ID) {
      router.push(`/modem/${data.Modem_ID}`);
    }
  };

  const handleEditLine = (feature: any) => {
    if (!onEditLine) {
      return;
    }
    const coordinates = feature.geometry?.coordinates || [];
    const chainId = feature.properties?.Chain_ID || null;
    const type = feature.properties?.Type || null;

    onEditLine({
      coordinates,
      chainId,
      type,
    });
  };

  const handleDeleteLine = (feature: any) => {
    if (!onDeleteLine) {
      return;
    }
    const coordinates = feature.geometry?.coordinates || [];
    const chainId = feature.properties?.Chain_ID || null;
    const type = feature.properties?.Type || null;

    onDeleteLine({
      coordinates,
      chainId,
      type,
    });
  };

  const handleDeleteObject = (feature: any) => {
    if (!onDeleteObject) {
      return;
    }
    const lat = feature.Lat;
    const lng = feature.Long;
    const type = feature.Type;
    const id = feature.FAT_ID || feature.Component_ID;
    const name = feature.Name;
    const chain_ID = feature.Chain_ID;

    onDeleteObject({
      Lat: lat,
      Long: lng,
      Type: type,
      ID: id,
      Name: name,
      Chain_ID: chain_ID,
    });
  };

  const handleEditObject = (feature: any) => {
    if (!onEditObject) {
      return;
    }
    const lat = feature.Lat;
    const lng = feature.Long;
    const type = feature.Type;
    const id = feature.FAT_ID || feature.Component_ID;
    const name = feature.Name;
    const chain_ID = feature.Chain_ID;
    console.log(name, lat, lng, type, id, name, chain_ID);
    console.log(feature);
    if (feature) {
      onEditObject({
        Lat: lat,
        Long: lng,
        Type: type,
        ID: id,
        Name: name,
        Chain_ID: chain_ID,
      });
    }
  };

  const handleAddObjectClick = (feature: any) => {
    const coordinates = feature.geometry?.coordinates || [];
    const chainId = feature.properties?.Chain_ID || null;
    const type = feature.properties?.Type || null;

    const lineData = {
      coordinates,
      chainId,
      type,
    };

    setSelectedLineData(lineData);
    setShowObjectMenu(true);
  };

  return (
    <div
      id="modal-overlay"
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div
        ref={modalRef}
        className="bg-white bg-opacity-50 dark:bg-[#1F2937] dark:bg-opacity-50 backdrop-blur-lg rounded-lg shadow-lg w-3/4 max-w-lg p-6 relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-2xl font-bold dark:text-white mb-4">
          {showObjectMenu ? "Select Object" : "Details"}
        </h2>

        {showObjectMenu ? (
          <ObjectMenu
            onBack={() => setShowObjectMenu(false)}
            onSelectObject={(objectLabel) => {
              if (onAddObjectToLine && selectedLineData) {
                onAddObjectToLine(
                  selectedLineData,
                  objectLabel,
                  clickedLatLng ?? { lat: 0, lng: 0 }
                );
                onClose();
              }
            }}
          />
        ) : (
          <>
            <DataCards data={data} />

            {data.LayerID === "modems" && (
              <button
                onClick={handleShowDetails}
                className="mt-6 px-6 py-3 bg-primary  w-full text-white text-lg rounded-lg hover:opacity-80 transition-all transform scale-110"
              >
                Show Details
              </button>
            )}

            {onEditLine &&
              onDeleteLine &&
              lineData &&
              onAddObjectToLine &&
              (data.Type === "Metro" ||
                data.Type === "FAT" ||
                data.Type === "ODC" ||
                data.Type === "Drop Cable") && (
                <ActionButtons
                  handleEditLine={() => {
                    handleEditLine(lineData);
                    onClose();
                  }}
                  handleAddObjectClick={() => {
                    handleAddObjectClick(lineData);
                  }}
                  handleDeleteLine={() => {
                    handleDeleteLine(lineData);
                    onClose();
                  }}
                />
              )}

            {onEditObject &&
              onDeleteObject &&
              (data.Type === "MFAT" ||
                data.Type === "SFAT" ||
                data.Type === "HH" ||
                data.Type === "TC" ||
                data.Type === "ODC") && (
                <ActionButtonsObject
                  handleEditObject={() => {
                    handleEditObject(data);
                    onClose();
                  }}
                  handleDeleteObject={() => {
                    handleDeleteObject(data);
                    onClose();
                  }}
                />
              )}

            {onEdit && data.LayerID === "preorders" && (
              <button
                onClick={() => {
                  onEdit(data);
                  onClose();
                }}
                className="mt-6 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all transform scale-110"
              >
                Edit
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
