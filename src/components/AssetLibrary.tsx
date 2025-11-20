import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ComicElement, ElementType } from "@/types/comic";

interface AssetLibraryProps {
  onAddElement: (element: ComicElement) => void;
  artStyle: string;
  characterDetails: string;
}

export const AssetLibrary = ({ onAddElement, artStyle, characterDetails }: AssetLibraryProps) => {
  const [description, setDescription] = useState("");
  const [elementType, setElementType] = useState<ElementType>("background");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({ title: "Please enter a description", variant: "destructive" });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-comic-element", {
        body: {
          elementType,
          description,
          art_style: artStyle,
          transparent: elementType !== "background",
          character_details: characterDetails
        }
      });

      if (error) throw error;
      if (!data?.imageUrl) throw new Error("No image generated");

      const newElement: ComicElement = {
        id: `${elementType}-${Date.now()}`,
        type: elementType,
        imageUrl: data.imageUrl,
        x: 100,
        y: 100,
        width: elementType === "background" ? 800 : elementType === "character_body" ? 200 : 150,
        height: elementType === "background" ? 600 : elementType === "character_body" ? 300 : 150,
        rotation: 0,
        zIndex: elementType === "background" ? 0 : 10,
        locked: false,
        description
      };

      onAddElement(newElement);
      setDescription("");
      toast({ title: "Element added to canvas!" });
    } catch (error: any) {
      console.error("Error generating element:", error);
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Asset Library</h3>
      
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="text">Text Bubble</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div>
            <Label>Element Type</Label>
            <Select value={elementType} onValueChange={(v) => setElementType(v as ElementType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="background">Background</SelectItem>
                <SelectItem value="character_body">Character Body</SelectItem>
                <SelectItem value="character_face">Character Face</SelectItem>
                <SelectItem value="prop">Prop/Object</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to generate..."
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Generate & Add
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <div>
            <Label>Text Content</Label>
            <Input
              placeholder="Enter dialogue or narration..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const text = e.currentTarget.value;
                  if (text.trim()) {
                    onAddElement({
                      id: `text-${Date.now()}`,
                      type: "text_bubble",
                      text,
                      x: 100,
                      y: 100,
                      width: 200,
                      height: 50,
                      rotation: 0,
                      zIndex: 100,
                      locked: false
                    });
                    e.currentTarget.value = "";
                    toast({ title: "Text bubble added!" });
                  }
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">Press Enter to add</p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
