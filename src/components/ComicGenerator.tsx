import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Loader2 } from "lucide-react";
import { ComicFormData } from "@/types/comic";
import { useToast } from "@/hooks/use-toast";

interface ComicGeneratorProps {
  onGenerate: (formData: ComicFormData) => void;
  isGenerating: boolean;
}

export const ComicGenerator = ({ onGenerate, isGenerating }: ComicGeneratorProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ComicFormData>({
    age_range: "6-8",
    target_audience: "Children",
    book_type: "Adventure",
    story_type: "Quest",
    num_characters: 2,
    character_details: "Nithin (boy), brave young boy with dark hair wearing blue shirt\nNani (girl), kind older girl with long hair wearing pink dress",
    tone: "Fun",
    pages: 2,
    panels_per_page: 3,
    art_style: "Children's book illustration",
    language: "English",
    special_instructions: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.character_details.trim()) {
      toast({
        title: "Character details required",
        description: "Please describe your characters",
        variant: "destructive"
      });
      return;
    }
    onGenerate(formData);
  };

  const updateNumber = (field: "pages" | "panels_per_page" | "num_characters", delta: number) => {
    setFormData(prev => {
      const current = prev[field];
      const max = field === "pages" ? 12 : field === "panels_per_page" ? 6 : 5;
      const min = 1;
      const newValue = Math.max(min, Math.min(max, current + delta));
      return { ...prev, [field]: newValue };
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Comic Book Creator</CardTitle>
        <CardDescription>Generate AI-powered comic stories with consistent characters</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age_range">Age Range</Label>
              <Select value={formData.age_range} onValueChange={(v) => setFormData({ ...formData, age_range: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-8">6-8 years</SelectItem>
                  <SelectItem value="8-12">8-12 years</SelectItem>
                  <SelectItem value="13-17">13-17 years</SelectItem>
                  <SelectItem value="18+">18+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="book_type">Book Type</Label>
              <Select value={formData.book_type} onValueChange={(v) => setFormData({ ...formData, book_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                  <SelectItem value="Mystery">Mystery</SelectItem>
                  <SelectItem value="Comedy">Comedy</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="story_type">Story Type</Label>
              <Select value={formData.story_type} onValueChange={(v) => setFormData({ ...formData, story_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quest">Quest</SelectItem>
                  <SelectItem value="Superhero">Superhero</SelectItem>
                  <SelectItem value="Origin Story">Origin Story</SelectItem>
                  <SelectItem value="Journey">Journey</SelectItem>
                  <SelectItem value="Friendship">Friendship</SelectItem>
                  <SelectItem value="Battle">Battle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fun">Fun</SelectItem>
                  <SelectItem value="Serious">Serious</SelectItem>
                  <SelectItem value="Dramatic">Dramatic</SelectItem>
                  <SelectItem value="Humorous">Humorous</SelectItem>
                  <SelectItem value="Inspirational">Inspirational</SelectItem>
                  <SelectItem value="Mysterious">Mysterious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="art_style">Art Style</Label>
              <Select value={formData.art_style} onValueChange={(v) => setFormData({ ...formData, art_style: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Children's book illustration">Children's Book</SelectItem>
                  <SelectItem value="Cartoon">Cartoon</SelectItem>
                  <SelectItem value="Anime/Manga">Anime/Manga</SelectItem>
                  <SelectItem value="Comic book">Comic Book</SelectItem>
                  <SelectItem value="Watercolor">Watercolor</SelectItem>
                  <SelectItem value="Digital art">Digital Art</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Chinese">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pages (1-12)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateNumber("pages", -1)}
                  disabled={formData.pages <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={formData.pages}
                  className="text-center"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateNumber("pages", 1)}
                  disabled={formData.pages >= 12}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Panels Per Page (1-6)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateNumber("panels_per_page", -1)}
                  disabled={formData.panels_per_page <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={formData.panels_per_page}
                  className="text-center"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateNumber("panels_per_page", 1)}
                  disabled={formData.panels_per_page >= 6}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Number of Characters (1-5)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateNumber("num_characters", -1)}
                  disabled={formData.num_characters <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={formData.num_characters}
                  className="text-center"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateNumber("num_characters", 1)}
                  disabled={formData.num_characters >= 5}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="character_details">
              Character Details *
              <span className="text-sm text-muted-foreground ml-2">
                (Format: Name (gender), description. E.g., "Nithin (boy), brave kid with dark hair")
              </span>
            </Label>
            <Textarea
              id="character_details"
              value={formData.character_details}
              onChange={(e) => setFormData({ ...formData, character_details: e.target.value })}
              placeholder="Nithin (boy), brave young boy with dark hair wearing blue shirt&#10;Nani (girl), kind older girl with long hair wearing pink dress"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions (Optional)</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder="Any specific requirements or themes you want in your comic..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isGenerating}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? "Generating Your Comic..." : "Generate Comic Story"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};