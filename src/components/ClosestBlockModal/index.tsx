import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { gsap, Power2, Back } from "gsap";
import { DataCardsClosestBlock, ClosestBlockItem } from "./DataCardsClosestBlock";

interface ClosestBlockModalProps {
  data: ClosestBlockItem[];
  onClose: () => void;
}

export const ClosestBlockModal: React.FC<ClosestBlockModalProps> = ({ data, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate modal entrance
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, y: 100, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.8, ease: Back.easeOut.config(1.2) }
      );
    }
    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          ease: Power2.easeInOut,
          onStart: () => {
            document.body.style.overflow = "hidden";
          },
        }
      );
    }

    // Close modal when clicking outside
    const handleOutsideClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === "closest-block-modal-overlay") {
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
    // Animate modal exit
    gsap.to(modalRef.current, {
      scale: 0.8,
      y: 100,
      opacity: 0,
      duration: 0.6,
      ease: Back.easeIn.config(1.2),
      onComplete: onClose,
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: Power2.easeInOut,
    });
  };

  return (
    <div
      id="closest-block-modal-overlay"
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none"
        >
          <FaTimes size={24} />
        </button>
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
            Closest Block Details
          </h2>
          {data && data.length > 0 ? (
            <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-6">
              Found <span className="font-semibold">{data.length}</span>{" "}
              household{data.length > 1 ? "s" : ""} in this block.
            </p>
          ) : (
            <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-6">
              No data found for this location.
            </p>
          )}
          <DataCardsClosestBlock data={data} />
        </div>
      </div>
    </div>
  );
};
