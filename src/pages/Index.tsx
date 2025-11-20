import { useState } from "react";
import { ComicGenerator } from "@/components/ComicGenerator";
import { ComicCanvasEditor } from "@/components/ComicCanvasEditor";
import { AssetLibrary } from "@/components/AssetLibrary";
import { ExpressionSelector } from "@/components/ExpressionSelector";
import { ComicFormData, ComicElement } from "@/types/comic";

const Index = () => {
  const [elements, setElements] = useState<ComicElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<ComicElement | null>(null);
  const [formData, setFormData] = useState<ComicFormData | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);

  const handleGenerate = async (data: ComicFormData) => {
    setFormData(data);
    setShowCanvas(true);
    setElements([]);
  };

  const handleAddElement = (element: ComicElement) => {
    setElements(prev => [...prev, element]);
  };

  const handleElementsChange = (newElements: ComicElement[]) => {
    setElements(newElements);
  };

  const handleExpressionChange = (newImageUrl: string) => {
    if (!selectedElement) return;
    
    setElements(prev => prev.map(el => 
      el.id === selectedElement.id ? { ...el, imageUrl: newImageUrl } : el
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Interactive Comic Builder
          </h1>
          <p className="text-lg text-muted-foreground">
            Build comics with layered, editable elements. Add characters, backgrounds, and expressions!
          </p>
        </div>

        {!showCanvas ? (
          <ComicGenerator onGenerate={handleGenerate} isGenerating={false} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <ComicCanvasEditor
                elements={elements}
                onElementsChange={handleElementsChange}
                onSelectElement={setSelectedElement}
              />
            </div>

            <div className="space-y-4">
              <AssetLibrary
                onAddElement={handleAddElement}
                artStyle={formData?.art_style || "cartoon"}
                characterDetails={formData?.character_details || ""}
              />

              {selectedElement?.type === "character_face" && (
                <ExpressionSelector
                  characterElement={selectedElement}
                  onExpressionChange={handleExpressionChange}
                  artStyle={formData?.art_style || "cartoon"}
                  characterDetails={formData?.character_details || ""}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
