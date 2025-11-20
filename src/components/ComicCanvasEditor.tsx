import { useState, useRef, useEffect } from "react";
import { Canvas as FabricCanvas, FabricImage, FabricText, util } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Lock, Unlock, ZoomIn, ZoomOut } from "lucide-react";
import { ComicElement, ElementType } from "@/types/comic";
import { useToast } from "@/hooks/use-toast";

interface ComicCanvasEditorProps {
  elements: ComicElement[];
  onElementsChange: (elements: ComicElement[]) => void;
  onSelectElement: (element: ComicElement | null) => void;
}

export const ComicCanvasEditor = ({ 
  elements, 
  onElementsChange,
  onSelectElement
}: ComicCanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedElement, setSelectedElement] = useState<ComicElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    // Clear and redraw all elements
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";

    elements.forEach(element => {
      if (element.type === "text_bubble" && element.text) {
        const text = new FabricText(element.text, {
          left: element.x,
          top: element.y,
          fontSize: 16,
          fill: "#000000",
          fontFamily: "Comic Sans MS",
        });
        text.set({ data: element.id });
        fabricCanvas.add(text);
      } else if (element.imageUrl) {
        FabricImage.fromURL(element.imageUrl).then((img) => {
          img.set({
            left: element.x,
            top: element.y,
            scaleX: element.width / (img.width || 1),
            scaleY: element.height / (img.height || 1),
            angle: element.rotation,
            selectable: !element.locked,
            data: element.id,
          });
          fabricCanvas.add(img);
          fabricCanvas.renderAll();
        });
      }
    });

    fabricCanvas.on("selection:created", (e) => {
      const selected = e.selected?.[0];
      if (selected) {
        const elementId = (selected as any).data;
        const element = elements.find(el => el.id === elementId);
        if (element) {
          setSelectedElement(element);
          onSelectElement(element);
        }
      }
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedElement(null);
      onSelectElement(null);
    });

    fabricCanvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj) return;

      const elementId = (obj as any).data;
      const updatedElements = elements.map(el => {
        if (el.id === elementId) {
          return {
            ...el,
            x: obj.left || 0,
            y: obj.top || 0,
            width: (obj.width || 0) * (obj.scaleX || 1),
            height: (obj.height || 0) * (obj.scaleY || 1),
            rotation: obj.angle || 0,
          };
        }
        return el;
      });
      onElementsChange(updatedElements);
    });

  }, [fabricCanvas, elements]);

  const handleDelete = () => {
    if (!selectedElement) return;
    
    const updatedElements = elements.filter(el => el.id !== selectedElement.id);
    onElementsChange(updatedElements);
    setSelectedElement(null);
    onSelectElement(null);
    toast({ title: "Element deleted" });
  };

  const handleToggleLock = () => {
    if (!selectedElement) return;

    const updatedElements = elements.map(el => 
      el.id === selectedElement.id ? { ...el, locked: !el.locked } : el
    );
    onElementsChange(updatedElements);
    toast({ title: selectedElement.locked ? "Element unlocked" : "Element locked" });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Canvas Editor</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleLock}
            disabled={!selectedElement}
          >
            {selectedElement?.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={!selectedElement}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-2 border-border rounded-lg overflow-hidden bg-background">
        <canvas ref={canvasRef} />
      </div>

      {selectedElement && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Selected: {selectedElement.type}</p>
          {selectedElement.description && (
            <p className="text-xs text-muted-foreground mt-1">{selectedElement.description}</p>
          )}
        </div>
      )}
    </Card>
  );
};
