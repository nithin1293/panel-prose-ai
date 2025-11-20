import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FacialExpression, ComicElement } from "@/types/comic";

interface ExpressionSelectorProps {
  characterElement: ComicElement;
  onExpressionChange: (newImageUrl: string) => void;
  artStyle: string;
  characterDetails: string;
}

export const ExpressionSelector = ({
  characterElement,
  onExpressionChange,
  artStyle,
  characterDetails
}: ExpressionSelectorProps) => {
  const [expressions, setExpressions] = useState<FacialExpression[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateExpressions = async () => {
    setIsGenerating(true);
    toast({ title: "Generating expressions...", description: "This may take a moment" });

    try {
      const { data, error } = await supabase.functions.invoke("generate-facial-expressions", {
        body: {
          character_details: characterDetails,
          art_style: artStyle,
          base_description: characterElement.description || ""
        }
      });

      if (error) throw error;
      if (!data?.expressions) throw new Error("No expressions generated");

      setExpressions(data.expressions);
      toast({ title: "Expressions ready!", description: `Generated ${data.expressions.length} expressions` });
    } catch (error: any) {
      console.error("Error generating expressions:", error);
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Change Expression</h3>
          {expressions.length === 0 && (
            <Button
              onClick={generateExpressions}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Expressions"
              )}
            </Button>
          )}
        </div>

        {expressions.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {expressions.map((expr, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onExpressionChange(expr.imageUrl);
                  toast({ title: `Expression changed to ${expr.expression}` });
                }}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
              >
                <img
                  src={expr.imageUrl}
                  alt={expr.expression}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center">
                  {expr.expression}
                </div>
              </button>
            ))}
          </div>
        )}

        {expressions.length === 0 && !isGenerating && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Click "Generate Expressions" to see options
          </p>
        )}
      </div>
    </Card>
  );
};
