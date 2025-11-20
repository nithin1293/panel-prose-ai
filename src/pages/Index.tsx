import { useState } from "react";
import { ComicGenerator } from "@/components/ComicGenerator";
import { ComicViewer } from "@/components/ComicViewer";
import { ComicFormData, ComicPanel } from "@/types/comic";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [panelsPerPage, setPanelsPerPage] = useState(3);
  const { toast } = useToast();

  const handleGenerate = async (formData: ComicFormData) => {
    setIsGenerating(true);
    setPanels([]);
    setPanelsPerPage(formData.panels_per_page);

    try {
      // Step 1: Generate story
      toast({
        title: "Generating story...",
        description: "Creating your comic narrative"
      });

      const { data: storyData, error: storyError } = await supabase.functions.invoke(
        "generate-comic-story",
        { body: formData }
      );

      if (storyError) throw storyError;
      if (!storyData?.panels) throw new Error("No panels generated");

      const generatedPanels: ComicPanel[] = storyData.panels;
      setPanels(generatedPanels);

      toast({
        title: "Story created!",
        description: `Generating ${generatedPanels.length} illustrated panels...`
      });

      // Step 2: Generate images for each panel
      for (let i = 0; i < generatedPanels.length; i++) {
        const panel = generatedPanels[i];

        try {
          const { data: imageData, error: imageError } = await supabase.functions.invoke(
            "generate-comic-image",
            {
              body: {
                scene_description: panel.scene_description,
                character_details: formData.character_details,
                art_style: formData.art_style,
                textBlocks: panel.textBlocks,
                panelNumber: panel.panel
              }
            }
          );

          if (imageError) {
            console.error(`Error generating image for panel ${panel.panel}:`, imageError);
            continue;
          }

          if (imageData?.imageUrl) {
            setPanels(prev =>
              prev.map(p =>
                p.panel === panel.panel ? { ...p, imageUrl: imageData.imageUrl } : p
              )
            );
          }
        } catch (err) {
          console.error(`Failed to generate image for panel ${panel.panel}:`, err);
        }
      }

      toast({
        title: "Comic complete!",
        description: "Your illustrated comic story is ready"
      });
    } catch (error: any) {
      console.error("Error generating comic:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate comic",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Comic Book Creator
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate professional illustrated comics with consistent characters using AI
          </p>
        </div>

        <ComicGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />

        {panels.length > 0 && (
          <ComicViewer panels={panels} panelsPerPage={panelsPerPage} />
        )}
      </div>
    </div>
  );
};

export default Index;
