import { useRef, useState, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

interface DrawingAction {
  type: "drawing";
  color: string;
  lineWidth: number;
  points: Point[];
}

interface TextAction {
  type: "text";
  text: string;
  x: number;
  y: number;
  color: string;
  isDragging: boolean;
  opacity: number;
  fontSize: number;
}

type Action = DrawingAction | TextAction;

interface UseCanvasProps {
  screenshotData: string | null;
  drawColor: string;
  isOpen: boolean;
}

const useCanvas = ({ screenshotData, drawColor, isOpen }: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(600);
  const [canvasHeight, setCanvasHeight] = useState<number>(450);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingAction | null>(
    null
  );
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(
    null
  );
  const [editingText, setEditingText] = useState<string>("");
  const [editingFontSize, setEditingFontSize] = useState<number>(20);
  const [editingColor, setEditingColor] = useState<string>("#000000");
  const [editingOpacity, setEditingOpacity] = useState<number>(100);
  const [canvasHistory, setCanvasHistory] = useState<Action[][]>([]);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const [hasMoved, setHasMoved] = useState<boolean>(false);

  const [isEditingNewText, setIsEditingNewText] = useState<boolean>(false);

  const [dragOffsetX, setDragOffsetX] = useState<number>(0);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);

  const loadImageOntoCanvas = () => {
    if (screenshotData && canvasRef.current && !isImageLoaded) {
      const canvas = canvasRef.current;
      const image = new Image();
      image.src = screenshotData;

      image.onload = () => {
        imageRef.current = image;

        const { naturalWidth, naturalHeight } = image;
        const aspectRatio = naturalWidth / naturalHeight;
        const maxWidth = 600;
        const maxHeight = 450;

        let width = naturalWidth;
        let height = naturalHeight;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        setCanvasWidth(width);
        setCanvasHeight(height);

        canvas.width = width;
        canvas.height = height;

        saveCanvasState();
        redrawCanvas();
        setIsImageLoaded(true);
      };

      image.onerror = (error) => {
        console.error("Failed to load the image:", error);
      };
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsImageLoaded(false);
      setActions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (!isImageLoaded) {
      intervalId = setInterval(() => {
        loadImageOntoCanvas();
      }, 50);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [screenshotData, isImageLoaded]);

  useEffect(() => {
    redrawCanvas();
  }, [actions, currentDrawing]);

  const saveCanvasState = () => {
    setCanvasHistory((prevHistory) => [...prevHistory, [...actions]]);
  };

  const redrawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight);

    actions.forEach((action) => {
      if (action.type === "drawing") {
        ctx.beginPath();
        action.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.lineWidth;
        ctx.stroke();
      } else if (action.type === "text") {
        ctx.fillStyle = action.color;
        ctx.globalAlpha = action.opacity / 100;
        ctx.font = `${action.fontSize}px Arial`;
        ctx.textBaseline = "top";
        ctx.fillText(action.text, action.x, action.y);
        ctx.globalAlpha = 1;
      }
    });

    if (currentDrawing) {
      ctx.beginPath();
      currentDrawing.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.strokeStyle = currentDrawing.color;
      ctx.lineWidth = currentDrawing.lineWidth;
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!canvasRef.current || isEditingNewText || selectedTextIndex !== null)
      return;
    if (!isImageLoaded) {
      loadImageOntoCanvas();
      return;
    }

    const { x, y } = getCanvasCoordinates(e);

    setCurrentDrawing({
      type: "drawing",
      color: drawColor,
      lineWidth: 2,
      points: [{ x, y }],
    });
    setIsDrawing(true);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "crosshair";
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing || !canvasRef.current || !currentDrawing) return;

    const { x, y } = getCanvasCoordinates(e);

    setCurrentDrawing((prevDrawing) => {
      if (prevDrawing) {
        const updatedDrawing = {
          ...prevDrawing,
          points: [...prevDrawing.points, { x, y }],
        };
        return updatedDrawing;
      }
      return prevDrawing;
    });
  };

  const stopDrawing = () => {
    if (isDrawing && currentDrawing) {
      setActions((prevActions) => [...prevActions, currentDrawing]);
      setCurrentDrawing(null);
      setIsDrawing(false);
      saveCanvasState();
      if (canvasRef.current) {
        canvasRef.current.style.cursor = "default";
      }
    }
  };

  const handleAddText = () => {
    setIsEditingNewText(true);
    setEditingText("");
    setEditingFontSize(20);
    setEditingColor("#000000");
    setEditingOpacity(100);
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!canvasRef.current) return;

    if (!isImageLoaded) {
      loadImageOntoCanvas();
      return;
    }

    const { x, y } = getCanvasCoordinates(e);

    if (e.button === 0) {
      for (let i = actions.length - 1; i >= 0; i--) {
        const action = actions[i];
        if (action.type === "text") {
          const textWidth = measureTextWidth(action.text, action.fontSize);
          const textHeight = action.fontSize;
          if (
            x >= action.x &&
            x <= action.x + textWidth &&
            y >= action.y &&
            y <= action.y + textHeight
          ) {
            setSelectedTextIndex(i);
            action.isDragging = true;
            setIsDraggingText(true);
            setHasMoved(false);

            setDragOffsetX(x - action.x);
            setDragOffsetY(y - action.y);
            if (canvasRef.current) {
              canvasRef.current.style.cursor = "move";
            }
            return;
          }
        }
      }

      startDrawing(e);
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const { x, y } = getCanvasCoordinates(e);

    if (isDraggingText && selectedTextIndex !== null && canvasRef.current) {
      setHasMoved(true);

      setActions((prevActions) =>
        prevActions.map((action, index) => {
          if (
            index === selectedTextIndex &&
            action.type === "text" &&
            action.isDragging
          ) {
            return {
              ...action,
              x: x - dragOffsetX,
              y: y - dragOffsetY,
            };
          }
          return action;
        })
      );
    } else {
      draw(e);

      const overText = isMouseOverText(x, y);

      if (canvasRef.current) {
        if (overText) {
          canvasRef.current.style.cursor = "pointer";
        } else if (isDrawing) {
          canvasRef.current.style.cursor = "crosshair";
        } else {
          canvasRef.current.style.cursor = "default";
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (isDraggingText && selectedTextIndex !== null) {
      const action = actions[selectedTextIndex];
      if (action.type === "text") {
        action.isDragging = false;
        setIsDraggingText(false);
        setSelectedTextIndex(null);
        saveCanvasState();
        if (canvasRef.current) {
          canvasRef.current.style.cursor = "default";
        }
      }
    } else {
      stopDrawing();
    }
  };

  const handleMouseLeave = () => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
  };

  const handleContextMenu = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!canvasRef.current || !isImageLoaded) return;

    const { x, y } = getCanvasCoordinates(e);

    for (let i = actions.length - 1; i >= 0; i--) {
      const action = actions[i];
      if (action.type === "text") {
        const textWidth = measureTextWidth(action.text, action.fontSize);
        const textHeight = action.fontSize;
        if (
          x >= action.x &&
          x <= action.x + textWidth &&
          y >= action.y &&
          y <= action.y + textHeight
        ) {
          setSelectedTextIndex(i);
          setIsDraggingText(false);
          setEditingText(action.text);
          setEditingFontSize(action.fontSize);
          setEditingColor(action.color);
          setEditingOpacity(action.opacity);

          return;
        }
      }
    }
  };

  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const isMouseOverText = (x: number, y: number): boolean => {
    for (let i = actions.length - 1; i >= 0; i--) {
      const action = actions[i];
      if (action.type === "text") {
        const textWidth = measureTextWidth(action.text, action.fontSize);
        const textHeight = action.fontSize;
        if (
          x >= action.x &&
          x <= action.x + textWidth &&
          y >= action.y &&
          y <= action.y + textHeight
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const measureTextWidth = (text: string, fontSize: number): number => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.font = `${fontSize}px Arial`;
        const metrics = ctx.measureText(text);
        return metrics.width;
      }
    }
    return text.length * (fontSize / 2);
  };

  const undo = () => {
    if (canvasHistory.length === 0) return;
    const history = [...canvasHistory];
    history.pop();
    const lastState = history[history.length - 1] || [];
    setCanvasHistory(history);
    setActions(lastState);
  };

  const applyTextEdits = () => {
    if (selectedTextIndex !== null || isEditingNewText) {
      const newOpacity = Math.min(Math.max(editingOpacity, 0), 100);
      const newFontSize = Math.max(editingFontSize, 1);

      let x: number, y: number;

      if (isEditingNewText) {
        x = canvasWidth / 2;
        y = canvasHeight / 2;
      } else {
        const existingAction = actions[selectedTextIndex!];
        if (existingAction.type === "text") {
          x = existingAction.x;
          y = existingAction.y;
        } else {
          return;
        }
      }

      const updatedAction: TextAction = {
        type: "text",
        text: editingText,
        x,
        y,
        color: editingColor,
        isDragging: false,
        opacity: newOpacity,
        fontSize: newFontSize,
      };

      if (isEditingNewText) {
        setActions((prevActions) => [...prevActions, updatedAction]);
        setIsEditingNewText(false);
      } else {
        setActions((prevActions) =>
          prevActions.map((action, index) => {
            if (index === selectedTextIndex && action.type === "text") {
              return updatedAction;
            }
            return action;
          })
        );
        setSelectedTextIndex(null);
      }

      saveCanvasState();
    }
  };

  const cancelTextEditing = () => {
    if (isEditingNewText) {
      setIsEditingNewText(false);
    } else {
      setSelectedTextIndex(null);
    }
  };

  return {
    canvasRef,
    canvasWidth,
    canvasHeight,
    isEditingNewText,
    setIsEditingNewText,
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
    handleMouseLeave,
    handleContextMenu,
    handleAddText,
    applyTextEdits,
    cancelTextEditing,
    undo,
    selectedTextIndex,
    isDraggingText,
  };
};

export default useCanvas;
