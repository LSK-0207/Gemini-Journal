/**
 * Types and interfaces for the Scrapbook Journal application.
 */

export interface JournalSection {
  id: string;
  type: 'feeling' | 'gratitude' | 'quote' | 'goals' | 'reminder' | 'reflection' | 'moment';
  heading: string;
  content: string[];
  card_style: 'torn_pink_gingham' | 'torn_kraft_note' | 'torn_grid_paper' | 'torn_lined_paper' | 'cream_tag' | 'wax_sealed_note';
  rotation_deg: number;
}

export interface JournalPolaroid {
  caption: string;
  photo_asset: string; // e.g. '/assets/scrapbook/photo-sunflower.svg'
  tape_color: 'pink' | 'sage' | 'gold' | 'plaid' | 'kraft';
  rotation_deg: number;
}

export interface JournalDecorations {
  stickers: Array<{
    asset: string;
    x: number; // percentage 0 - 100
    y: number; // percentage 0 - 100
    rotation: number;
    scale?: number;
  }>;
  botanicals: Array<{
    asset: string;
    x: number;
    y: number;
    rotation: number;
    scale?: number;
  }>;
  stamps: Array<{
    asset: string;
    x: number;
    y: number;
    rotation: number;
  }>;
  tapes: Array<{
    asset: string;
    x: number;
    y: number;
    rotation: number;
    width: number; // percentage
  }>;
  accents: Array<{
    asset: string; // bow-pink, bow-green, paperclip-gold, wax-seal-daisy, butterfly-vintage
    x: number;
    y: number;
    rotation: number;
  }>;
  doodles: Array<{
    type: 'star' | 'heart' | 'sparkle' | 'swirl';
    x: number;
    y: number;
    color?: string;
  }>;
}

export interface JournalDesignSpec {
  template_id: string; // must match a Fixed Template Library id, e.g. "sunlit-botanical-horizontal"
  mood: string; // e.g. "sunlit-botanical", "grateful", "peaceful", "reflective", "warm"
  orientation?: 'horizontal' | 'vertical';
  title: string; // <= 28 chars
  feeling_block: string; // <= 140 chars
  gratitude_list: string[]; // length <= 3, each item <= 40 chars
  quote?: string; // <= 60 chars, optional
  date_display?: string;
  palette?: {
    text_color?: string;
    accent_color?: string;
  };
}

export interface SavedInteraction {
  id: string;
  userId: string;
  userEmail?: string | null;
  createdAt: string; // ISO date string
  updatedAt?: string;
  rawFragments: string;
  designSpec: JournalDesignSpec;
  renderedSvg: string; // Sanitized vector SVG markup
  templateId: string;
  mood?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type AppTheme = 'two-tone-dark' | 'two-tone-light';

