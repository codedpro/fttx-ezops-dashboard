import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import ClickOutside from "@/components/ClickOutside";
import useCanvas from "@/hooks/useCanvas";
import TextEditingPanel from "./TextEditingPanel";
import Toolbar from "./Toolbar";

interface ScreenshotEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshotData: string | null;
}

const ScreenshotEditorModal: React.FC<ScreenshotEditorModalProps> = ({
  isOpen,
  onClose,
  screenshotData,
}) => {
  const [drawColor, setDrawColor] = useState<string>("#FF0000");

  const {
    canvasRef,
    canvasWidth,
    canvasHeight,
    isEditingNewText,
    editingText,
    setEditingText,
    editingFontSize,
    setEditingFontSize,
    editingColor,
    setEditingColor,
    editingOpacity,
    setEditingOpacity,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    handleAddText,
    applyTextEdits,
    cancelTextEditing,
    undo,
    isDraggingText,
    selectedTextIndex,
  } = useCanvas({ screenshotData, drawColor, isOpen });

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current?.toBlob((blob) => resolve(blob))
      );
      if (blob) {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        alert("Copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to copy image to clipboard:", error);
      alert("Unable to copy. Ensure you have permission and try again.");
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "edited-screenshot.png";
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 custom-scrollbar">
      <ClickOutside onClick={onClose} className="w-full max-w-3xl px-4">
        <div className="relative bg-white dark:bg-darkgray-2 p-6 rounded-[10px] w-full h-[80vh] space-y-4 overflow-auto shadow-lg dark:shadow-card">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-darkgray hover:text-gray-700 dark:text-white dark:hover:text-gray-500 transition duration-200"
          >
            <FiX size={24} />
          </button>

          <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">
            Screenshot Editor
          </h2>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="border border-stroke dark:border-darkgray-3 rounded-[10px]"
              style={{ cursor: "crosshair" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={handleContextMenu}
            />
          </div>

          {(isEditingNewText ||
            (selectedTextIndex !== null && !isDraggingText)) && (
            <TextEditingPanel
              editingText={editingText}
              setEditingText={setEditingText}
              editingFontSize={editingFontSize}
              setEditingFontSize={setEditingFontSize}
              editingColor={editingColor}
              setEditingColor={setEditingColor}
              editingOpacity={editingOpacity}
              setEditingOpacity={setEditingOpacity}
              applyTextEdits={applyTextEdits}
              cancelTextEditing={cancelTextEditing}
            />
          )}

          <Toolbar
            drawColor={drawColor}
            setDrawColor={setDrawColor}
            handleAddText={handleAddText}
            undo={undo}
            handleCopyToClipboard={handleCopyToClipboard}
            handleDownload={handleDownload}
          />
        </div>
      </ClickOutside>
    </div>
  );
};

export default ScreenshotEditorModal;
