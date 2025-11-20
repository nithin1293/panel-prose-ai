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

// Canvas-based comic types
export type ElementType = "background" | "character_body" | "character_face" | "prop" | "text_bubble";

export interface ComicElement {
  id: string;
  type: ElementType;
  imageUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  description?: string;
  text?: string; // For text bubbles
  characterId?: string; // Link face to body
}

export interface CanvasPanel {
  id: string;
  elements: ComicElement[];
  width: number;
  height: number;
}

export interface FacialExpression {
  expression: string;
  imageUrl: string;
  fullDescription: string;
}