// ColorPicker.tsx
import React from "react";
import { TwitterPicker } from "react-color";
import ClickOutside from "@/components/ClickOutside";

interface ColorPickerProps {
  color: string;
  onChange: (color: any) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  isVisible,
  toggleVisibility,
}) => {
  return (
    <>
      {isVisible && (
        <div className="absolute z-20">
          <ClickOutside onClick={toggleVisibility}>
            <TwitterPicker color={color} onChangeComplete={onChange} />
          </ClickOutside>
        </div>
      )}
    </>
  );
};

export default ColorPicker;
