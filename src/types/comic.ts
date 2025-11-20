export interface TextBlock {
  role: "dialogue" | "thought" | "narration" | "sfx";
  character: string | null;
  content: string;
  bubbleType: "speech" | "thought" | "caption" | "sfx";
}

export interface ComicPanel {
  panel: number;
  scene_description: string;
  textBlocks: TextBlock[];
  imageUrl?: string;
}

export interface ComicFormData {
  age_range: string;
  target_audience: string;
  book_type: string;
  story_type: string;
  num_characters: number;
  character_details: string;
  tone: string;
  pages: number;
  panels_per_page: number;
  art_style: string;
  language: string;
  special_instructions: string;
}