import type { TemplateSlot } from '../templates';

/**
 * Map slot font styles to CSS font families
 */
export function getFontFamily(font: TemplateSlot['font']): string {
  switch (font) {
    case 'handwritten-display':
      return "'Caveat', cursive, serif";
    case 'handwritten-accent':
      return "'Lora', serif, italic";
    case 'handwritten-body':
    default:
      return "'Kalam', cursive, sans-serif";
  }
}

export function getDefaultFontSize(slot: TemplateSlot): number {
  switch (slot.kind) {
    case 'heading':
      return 34;
    case 'bullet_list':
      return 19;
    case 'paragraph':
    default:
      return slot.slot_id === 'quote' ? 20 : 19;
  }
}

export function getAccentBulletColor(vibe: string): string {
  switch (vibe) {
    case 'dark-academia':
      return '#8a3a45';
    case 'sage-affirmation':
      return '#5b704c';
    case 'dusty-rose-diary':
      return '#b85d6d';
    case 'kraft-vintage':
      return '#9c5b29';
    case 'sunlit-botanical':
    default:
      return '#e11d48';
  }
}

/**
 * Word-wrap helper with measureText auto-shrink and ellipsis fallback
 */
export function wrapAndFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  initialFontSize: number,
  fontFamily: string,
  lineHeightMultiplier = 1.3
): { lines: string[]; finalFontSize: number } {
  let fontSize = initialFontSize;
  const minFontSize = Math.floor(initialFontSize * 0.85); // Auto-shrink up to 15%

  while (fontSize >= minFontSize) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    const totalHeight = lines.length * (fontSize * lineHeightMultiplier);
    if (totalHeight <= maxHeight) {
      return { lines, finalFontSize: fontSize };
    }

    fontSize -= 1;
  }

  // Safety net: truncate with ellipsis if still overflowing
  ctx.font = `${minFontSize}px ${fontFamily}`;
  const maxLines = Math.max(1, Math.floor(maxHeight / (minFontSize * lineHeightMultiplier)));
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    if (lines.length >= maxLines) {
      while (currentLine.length > 0 && ctx.measureText(`${currentLine}...`).width > maxWidth) {
        currentLine = currentLine.slice(0, -1);
      }
      lines[lines.length - 1] = `${currentLine}...`;
    } else {
      lines.push(currentLine);
    }
  }

  return { lines: lines.slice(0, maxLines), finalFontSize: minFontSize };
}
