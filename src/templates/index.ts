export type SlotKind = 'heading' | 'paragraph' | 'bullet_list';
export type SlotFont = 'handwritten-display' | 'handwritten-body' | 'handwritten-accent';

export interface TemplateSlot {
  slot_id: string;
  kind: SlotKind;
  x: number;
  y: number;
  width: number;
  height: number;
  font: SlotFont;
  max_chars?: number;
  max_items?: number;
  max_chars_per_item?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TemplateDefinition {
  template_id: string;
  vibe: string;
  orientation: 'horizontal' | 'vertical';
  text_color: string;
  background_asset: string;
  width: number;
  height: number;
  slots: TemplateSlot[];
}

export const HORIZONTAL_SLOTS: TemplateSlot[] = [
  {
    slot_id: 'title',
    kind: 'heading',
    x: 60,
    y: 40,
    width: 420,
    height: 60,
    font: 'handwritten-display',
    max_chars: 28,
    align: 'left',
  },
  {
    slot_id: 'feeling_block',
    kind: 'paragraph',
    x: 60,
    y: 140,
    width: 380,
    height: 120,
    font: 'handwritten-body',
    max_chars: 140,
    align: 'left',
  },
  {
    slot_id: 'gratitude_list',
    kind: 'bullet_list',
    x: 60,
    y: 300,
    width: 380,
    height: 160,
    font: 'handwritten-body',
    max_items: 3,
    max_chars_per_item: 40,
  },
  {
    slot_id: 'quote',
    kind: 'paragraph',
    x: 480,
    y: 300,
    width: 300,
    height: 100,
    font: 'handwritten-accent',
    max_chars: 60,
    align: 'center',
  },
];

export const VERTICAL_SLOTS: TemplateSlot[] = [
  {
    slot_id: 'title',
    kind: 'heading',
    x: 60,
    y: 100,
    width: 440,
    height: 50,
    font: 'handwritten-display',
    max_chars: 28,
    align: 'left',
  },
  {
    slot_id: 'feeling_block',
    kind: 'paragraph',
    x: 60,
    y: 190,
    width: 440,
    height: 160,
    font: 'handwritten-body',
    max_chars: 140,
    align: 'left',
  },
  {
    slot_id: 'gratitude_list',
    kind: 'bullet_list',
    x: 60,
    y: 390,
    width: 440,
    height: 200,
    font: 'handwritten-body',
    max_items: 3,
    max_chars_per_item: 40,
  },
  {
    slot_id: 'quote',
    kind: 'paragraph',
    x: 60,
    y: 630,
    width: 440,
    height: 120,
    font: 'handwritten-accent',
    max_chars: 60,
    align: 'center',
  },
];

// Registry of all 10 fixed templates matching /config/templates.json
export const TEMPLATE_LIBRARY: Record<string, TemplateDefinition> = {
  'sunlit-botanical-horizontal': {
    template_id: 'sunlit-botanical-horizontal',
    vibe: 'sunlit-botanical',
    orientation: 'horizontal',
    text_color: '#4a3b2a',
    background_asset: '/assets/templates/sunlit-botanical-horizontal.svg',
    width: 820,
    height: 500,
    slots: HORIZONTAL_SLOTS,
  },
  'sunlit-botanical-vertical': {
    template_id: 'sunlit-botanical-vertical',
    vibe: 'sunlit-botanical',
    orientation: 'vertical',
    text_color: '#4a3b2a',
    background_asset: '/assets/templates/sunlit-botanical-vertical.svg',
    width: 560,
    height: 860,
    slots: VERTICAL_SLOTS,
  },
  'sage-affirmation-horizontal': {
    template_id: 'sage-affirmation-horizontal',
    vibe: 'sage-affirmation',
    orientation: 'horizontal',
    text_color: '#4a5a3a',
    background_asset: '/assets/templates/sage-affirmation-horizontal.svg',
    width: 820,
    height: 500,
    slots: HORIZONTAL_SLOTS,
  },
  'sage-affirmation-vertical': {
    template_id: 'sage-affirmation-vertical',
    vibe: 'sage-affirmation',
    orientation: 'vertical',
    text_color: '#4a5a3a',
    background_asset: '/assets/templates/sage-affirmation-vertical.svg',
    width: 560,
    height: 860,
    slots: VERTICAL_SLOTS,
  },
  'dusty-rose-diary-horizontal': {
    template_id: 'dusty-rose-diary-horizontal',
    vibe: 'dusty-rose-diary',
    orientation: 'horizontal',
    text_color: '#7a5c5c',
    background_asset: '/assets/templates/dusty-rose-diary-horizontal.svg',
    width: 820,
    height: 500,
    slots: HORIZONTAL_SLOTS,
  },
  'dusty-rose-diary-vertical': {
    template_id: 'dusty-rose-diary-vertical',
    vibe: 'dusty-rose-diary',
    orientation: 'vertical',
    text_color: '#7a5c5c',
    background_asset: '/assets/templates/dusty-rose-diary-vertical.svg',
    width: 560,
    height: 860,
    slots: VERTICAL_SLOTS,
  },
  'dark-academia-horizontal': {
    template_id: 'dark-academia-horizontal',
    vibe: 'dark-academia',
    orientation: 'horizontal',
    text_color: '#2f2418',
    background_asset: '/assets/templates/dark-academia-horizontal.svg',
    width: 820,
    height: 500,
    slots: HORIZONTAL_SLOTS,
  },
  'dark-academia-vertical': {
    template_id: 'dark-academia-vertical',
    vibe: 'dark-academia',
    orientation: 'vertical',
    text_color: '#2f2418',
    background_asset: '/assets/templates/dark-academia-vertical.svg',
    width: 560,
    height: 860,
    slots: VERTICAL_SLOTS,
  },
  'kraft-vintage-horizontal': {
    template_id: 'kraft-vintage-horizontal',
    vibe: 'kraft-vintage',
    orientation: 'horizontal',
    text_color: '#5a4632',
    background_asset: '/assets/templates/kraft-vintage-horizontal.svg',
    width: 820,
    height: 500,
    slots: HORIZONTAL_SLOTS,
  },
  'kraft-vintage-vertical': {
    template_id: 'kraft-vintage-vertical',
    vibe: 'kraft-vintage',
    orientation: 'vertical',
    text_color: '#5a4632',
    background_asset: '/assets/templates/kraft-vintage-vertical.svg',
    width: 560,
    height: 860,
    slots: VERTICAL_SLOTS,
  },
};

// Legacy alias mapping
TEMPLATE_LIBRARY['sunlit-botanical-01'] = TEMPLATE_LIBRARY['sunlit-botanical-horizontal'];

export const DEFAULT_TEMPLATE_ID = 'sunlit-botanical-horizontal';

export function getTemplate(templateId?: string): TemplateDefinition {
  if (!templateId) return TEMPLATE_LIBRARY[DEFAULT_TEMPLATE_ID];
  return TEMPLATE_LIBRARY[templateId] || TEMPLATE_LIBRARY[DEFAULT_TEMPLATE_ID];
}

export function getAllTemplateIds(): string[] {
  return Object.keys(TEMPLATE_LIBRARY);
}
