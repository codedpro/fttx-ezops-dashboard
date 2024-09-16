import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { gsap, Power3, Power2, Back } from "gsap";

interface ModalProps {
  data: Record<string, any>;
  onClose: () => void;
  onEdit: (point: any) => void;
}

export const Modal: React.FC<ModalProps> = ({ data, onClose, onEdit }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

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

    gsap.fromTo(
      cardRefs.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: Power3.easeOut,
        delay: 0.3,
      }
    );

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    const copiedElement = document.getElementById(`copied-${key}`);
    if (copiedElement) {
      gsap.fromTo(
        copiedElement,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: Back.easeOut }
      );
      gsap.to(copiedElement, { opacity: 0, duration: 0.5, delay: 1.5 });
    }

    setTimeout(() => setCopied(null), 1500);
  };

  const formatLatLong = (lat: number, long: number) => {
    return `${lat}, ${long}`;
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
        <h2 className="text-2xl font-bold dark:text-white mb-4">Details</h2>

        <div className="custom-scrollbar max-h-[50vh] overflow-auto pr-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.keys(data)
              .filter(
                (key) =>
                  key !== "icon" &&
                  key !== "LayerID" &&
                  key !== "iconSize" &&
                  key !== "Component_ID" &&
                  key !== "Chain_ID" &&
                  key !== "FAT_ID" &&
                  key !== "Long"
              )
              .map((key, idx) => {
                const displayValue =
                  key === "Lat" && data.Long
                    ? formatLatLong(data.Lat, data.Long)
                    : data[key];

                const displayKey =
                  key === "Lat" && data.Long ? "Lat/Long" : key;

                return (
                  <div
                    key={idx}
                    ref={(el) => {
                      if (el) cardRefs.current[idx] = el;
                    }}
                    className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-transform transform hover:scale-105 hover:shadow-2xl hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    <p className="text-md text-gray-500 dark:text-gray-400 mb-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      {displayKey}
                    </p>
                    <p
                      className={`font-semibold text-xs text-gray-900 dark:text-white cursor-pointer transition-colors hover:text-blue-500 dark:hover:text-gray-400 ${
                        copied === displayKey ? "text-green-500" : ""
                      }`}
                      onClick={() => copyToClipboard(displayValue, displayKey)}
                    >
                      {displayValue || "N/A"}
                      {copied === displayKey && (
                        <span
                          id={`copied-${displayKey}`}
                          className="ml-2 text-xs text-green-500"
                        >
                          Copied!
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        {data.LayerID === "preorders" && (
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
      </div>
    </div>
  );
};
