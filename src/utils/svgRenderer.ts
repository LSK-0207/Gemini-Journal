import type { JournalDesignSpec, SavedInteraction } from '../types';
import { getTemplate } from '../templates';
import { getTemplateBackground } from '../templates/templateBackgrounds';

/**
 * Escapes XML/SVG special characters to ensure valid SVG markup
 */
export function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wraps text into lines matching a maximum character count per line
 */
export function wrapTextToLines(text: string, maxCharsPerLine: number = 42): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export function getAccentBulletColor(vibe?: string): string {
  switch (vibe) {
    case 'sage-affirmation':
      return '#6b8e23';
    case 'dusty-rose-diary':
      return '#c26d7c';
    case 'dark-academia':
      return '#8b5a2b';
    case 'kraft-vintage':
      return '#b8860b';
    case 'sunlit-botanical':
    default:
      return '#e8763c';
  }
}

/**
 * Generates a 100% self-contained, high-fidelity SVG string.
 * Uses native SVG <text> and <tspan> rather than <foreignObject>,
 * guaranteeing flawless rendering across mobile Safari, Android Chrome,
 * sandboxed iframes, and exported image canvases.
 */
export function generateCompleteSelfContainedSvg(
  spec: JournalDesignSpec,
  templateIdOverride?: string,
  options: {
    className?: string;
    style?: string;
  } = {}
): string {
  const templateId = templateIdOverride || spec.template_id || 'sunlit-botanical-horizontal';
  const template = getTemplate(templateId);
  const backgroundMarkup = getTemplateBackground(template.template_id);
  const textColor = template.text_color || '#4a3b2a';
  const bulletColor = getAccentBulletColor(template.vibe);
  const isVertical = template.orientation === 'vertical';

  const titleSlot = template.slots.find((s) => s.slot_id === 'title');
  const feelingSlot = template.slots.find((s) => s.slot_id === 'feeling_block');
  const gratitudeSlot = template.slots.find((s) => s.slot_id === 'gratitude_list');
  const quoteSlot = template.slots.find((s) => s.slot_id === 'quote');

  const titleText = escapeXml(spec.title || 'Quiet Moments & Reflections');
  const vibeText = escapeXml(spec.mood || template.vibe || 'Warm');
  const feelingLines = wrapTextToLines(
    spec.feeling_block || 'A quiet pause in the day to take note of what matters.',
    isVertical ? 38 : 42
  );
  const quoteLines = wrapTextToLines(spec.quote || '', isVertical ? 36 : 30);

  // SVG Slot Components
  let titleSvg = '';
  if (titleSlot) {
    const titleY = isVertical ? 34 : 36;
    const subtitleY = isVertical ? 56 : 58;
    titleSvg = `
    <!-- Title Slot -->
    <g transform="translate(${titleSlot.x}, ${titleSlot.y})">
      <text x="0" y="${titleY}" font-family="'Caveat', cursive, serif" font-size="${isVertical ? '32' : '36'}" font-weight="bold" fill="${textColor}">
        ${titleText}
      </text>
      <text x="0" y="${subtitleY}" font-family="'Kalam', cursive" font-size="13" font-weight="bold" fill="${textColor}" opacity="0.75">
        Vibe: ${vibeText} ✦ Memory Flash Card
      </text>
    </g>`;
  }

  let feelingSvg = '';
  if (feelingSlot) {
    const lineSpacing = isVertical ? 22 : 22;
    const tspanMarkup = feelingLines
      .slice(0, isVertical ? 6 : 5)
      .map((line, idx) => `<tspan x="0" dy="${idx === 0 ? 0 : lineSpacing}">${escapeXml(line)}</tspan>`)
      .join('');

    feelingSvg = `
    <!-- Feeling Block Slot -->
    <g transform="translate(${feelingSlot.x}, ${feelingSlot.y})">
      <text x="0" y="16" font-family="'Kalam', cursive" font-size="14" font-weight="bold" fill="${textColor}" opacity="0.9">
        Today I feel:
      </text>
      <text x="0" y="40" font-family="'Kalam', cursive" font-size="${isVertical ? '16' : '17'}" fill="${textColor}">
        ${tspanMarkup}
      </text>
    </g>`;
  }

  let gratitudeSvg = '';
  if (gratitudeSlot) {
    const items = (spec.gratitude_list || []).slice(0, gratitudeSlot.max_items || 3);
    const itemMarkup = items
      .map((item, idx) => {
        const itemY = 42 + idx * (isVertical ? 48 : 42);
        const itemLines = wrapTextToLines(item, isVertical ? 36 : 38);
        const itemTspans = itemLines
          .slice(0, 2)
          .map((l, lIdx) => `<tspan x="18" dy="${lIdx === 0 ? 0 : 18}">${escapeXml(l)}</tspan>`)
          .join('');

        return `
        <g transform="translate(0, ${itemY})">
          <text x="0" y="0" font-family="'Kalam', cursive" font-size="15" fill="${bulletColor}">♥</text>
          <text x="18" y="0" font-family="'Kalam', cursive" font-size="${isVertical ? '15' : '16'}" fill="${textColor}">
            ${itemTspans}
          </text>
        </g>`;
      })
      .join('');

    gratitudeSvg = `
    <!-- Gratitude Slot -->
    <g transform="translate(${gratitudeSlot.x}, ${gratitudeSlot.y})">
      <text x="0" y="16" font-family="'Kalam', cursive" font-size="14" font-weight="bold" fill="${textColor}" opacity="0.9">
        Things I'm grateful for : ♡
      </text>
      ${itemMarkup}
    </g>`;
  }

  let quoteSvg = '';
  if (quoteSlot && spec.quote) {
    const quoteCenterX = quoteSlot.width / 2;
    const quoteTspans = quoteLines
      .slice(0, 3)
      .map((l, idx) => `<tspan x="${quoteCenterX}" dy="${idx === 0 ? 0 : 20}">${escapeXml(l)}</tspan>`)
      .join('');

    quoteSvg = `
    <!-- Quote Slot -->
    <g transform="translate(${quoteSlot.x}, ${quoteSlot.y})">
      <text x="${quoteCenterX}" y="16" font-family="'Caveat', cursive" font-size="15" font-weight="bold" fill="${textColor}" opacity="0.85" text-anchor="middle">
        ✦ Insight &amp; Takeaway ✦
      </text>
      <text x="${quoteCenterX}" y="44" font-family="'Lora', serif" font-style="italic" font-size="${isVertical ? '15' : '16'}" fill="${textColor}" text-anchor="middle">
        ${quoteTspans}
      </text>
    </g>`;
  }

  const customStyle = options.style ? `style="${options.style}"` : 'style="width: 100%; height: 100%; max-width: 100%; max-height: 100%; display: block;"';
  const customClass = options.className ? `class="${options.className}"` : '';

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${template.width} ${template.height}"
  width="100%"
  height="100%"
  preserveAspectRatio="xMidYMid meet"
  ${customClass}
  ${customStyle}
>
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&amp;family=Kalam:wght@400;700&amp;family=Lora:ital,wght@1,400;1,600&amp;display=swap');
      text { user-select: none; }
    </style>
  </defs>

  <!-- 1. Embedded Vector Background & Decals -->
  <g id="template-background-layer">
    ${backgroundMarkup}
  </g>

  <!-- 2. Measured Text Slots -->
  <g id="template-text-slots">
    ${titleSvg}
    ${feelingSvg}
    ${gratitudeSvg}
    ${quoteSvg}
  </g>
</svg>`.trim();
}

/**
 * Returns a guaranteed valid, self-contained SVG for any memory item.
 * If the saved SVG contains broken external <image> tags, foreignObject issues,
 * is missing critical vector layers, or is empty, it dynamically generates the full self-contained vector graphic.
 */
export function getSafeMemorySvg(
  memory: Partial<SavedInteraction>,
  options: {
    className?: string;
    style?: string;
  } = {}
): string {
  if (!memory) return '';

  const templateId = memory.templateId || memory.designSpec?.template_id || 'sunlit-botanical-horizontal';
  const spec: JournalDesignSpec = memory.designSpec || {
    template_id: templateId,
    mood: memory.mood || 'warm',
    title: (memory as any).title || 'Memory Flash Card',
    feeling_block: memory.rawFragments || '',
    gratitude_list: [],
  };

  // If options are explicitly provided, always generate with the requested options
  if (options.style || options.className) {
    return generateCompleteSelfContainedSvg(spec, templateId, options);
  }

  // If memory already has renderedSvg, check if it contains valid background & slots without broken external links
  if (
    memory.renderedSvg &&
    typeof memory.renderedSvg === 'string' &&
    memory.renderedSvg.length > 200 &&
    memory.renderedSvg.includes('viewBox') &&
    memory.renderedSvg.includes('template-background-layer') &&
    memory.renderedSvg.includes('template-text-slots')
  ) {
    const hasExternalImage = memory.renderedSvg.includes('<image') && memory.renderedSvg.includes('/assets/templates/');
    const hasForeignObject = memory.renderedSvg.includes('<foreignObject');

    // If it has no broken external images and no problematic foreignObjects, return it
    if (!hasExternalImage && !hasForeignObject) {
      return memory.renderedSvg;
    }
  }

  // Generate a clean, 100% reliable self-contained SVG
  return generateCompleteSelfContainedSvg(spec, templateId, options);
}
