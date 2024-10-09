import React, { useEffect, useRef } from "react";
import { gsap, Power3 } from "gsap";
import { OBJECTS } from "@/data/designdeskMenu";

interface ObjectMenuProps {
  onBack: () => void;
  onSelectObject: (objectLabel: string) => void;
}

export const ObjectMenu: React.FC<ObjectMenuProps> = ({
  onBack,
  onSelectObject,
}) => {
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
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
  }, []);

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        Back
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {OBJECTS.map((obj, idx) => (
          <div
            key={idx}
            ref={(el) => {
              if (el) cardRefs.current[idx] = el;
            }}
            onClick={() => onSelectObject(obj.label)}
            className="cursor-pointer bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-70 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-transform transform hover:scale-105 hover:shadow-2xl hover:border-gray-400 dark:hover:border-gray-500 flex flex-col items-center justify-center h-40"
          >
            <img src={obj.image} alt={obj.label} className="w-16 h-16 mb-2" />
            <p className="font-semibold text-xs text-gray-900 dark:text-white">
              {obj.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
