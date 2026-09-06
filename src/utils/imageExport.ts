import type { SavedInteraction, JournalDesignSpec } from '../types';
import { getTemplate } from '../templates';
import {
  getFontFamily,
  getDefaultFontSize,
  getAccentBulletColor,
  wrapAndFitText,
} from './compositorUtils';

export type ImageFormat = 'png' | 'jpeg';

/**
 * Universal high-resolution image exporter for scrapbook memory cards.
 * Renders at 2x retina scale (1640x1000 or 1120x1600) for razor-sharp prints and downloads.
 */
export async function exportMemoryCardAsImage(
  memory: SavedInteraction | {
    title?: string;
    templateId?: string;
    designSpec?: JournalDesignSpec;
    renderedSvg?: string;
    mood?: string;
    rawFragments?: string;
  },
  format: ImageFormat = 'png',
  quality = 0.95
): Promise<string> {
  const templateId =
    memory.templateId ||
    memory.designSpec?.template_id ||
    'sunlit-botanical-horizontal';

  const template = getTemplate(templateId);

  const spec: JournalDesignSpec = memory.designSpec || {
    template_id: templateId,
    mood: memory.mood || 'warm',
    title: (memory as { title?: string }).title || memory.designSpec?.title || 'Memory Flash Card',
    feeling_block: memory.rawFragments || '',
    gratitude_list: [],
  };

  // 2x Retina scale factor
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = template.width * scale;
  canvas.height = template.height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not obtain 2D canvas context');
  }

  // Base background fill (crucial for JPEG to prevent black alpha artifacting)
  ctx.fillStyle = '#faf5ea';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load template background asset
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';

  await new Promise<void>((resolve) => {
    bgImg.onload = () => resolve();
    bgImg.onerror = () => {
      console.warn(`Could not load background asset ${template.background_asset}, using soft fallback`);
      resolve();
    };
    bgImg.src = template.background_asset;
  });

  // Scale context for high-DPI rasterization
  ctx.scale(scale, scale);

  // Draw background asset
  if (bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, template.width, template.height);
  }

  const textColor = template.text_color;
  const bulletColor = getAccentBulletColor(template.vibe);

  // Draw slots deterministically
  for (const slot of template.slots) {
    ctx.save();
    const fontFamily = getFontFamily(slot.font);
    const initialFontSize = getDefaultFontSize(slot);

    if (slot.slot_id === 'title') {
      const rawTitle = spec.title || 'Sunlit Thoughts';
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';

      let fSize = initialFontSize;
      ctx.font = `bold ${fSize}px ${fontFamily}`;
      while (ctx.measureText(rawTitle).width > slot.width && fSize > initialFontSize * 0.85) {
        fSize -= 1;
        ctx.font = `bold ${fSize}px ${fontFamily}`;
      }

      let displayTitle = rawTitle;
      if (ctx.measureText(displayTitle).width > slot.width) {
        while (displayTitle.length > 0 && ctx.measureText(`${displayTitle}...`).width > slot.width) {
          displayTitle = displayTitle.slice(0, -1);
        }
        displayTitle = `${displayTitle}...`;
      }

      ctx.fillText(displayTitle, slot.x, slot.y + slot.height / 2);
    } else if (slot.slot_id === 'feeling_block') {
      const feelingText = spec.feeling_block || '';
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';

      const { lines, finalFontSize } = wrapAndFitText(
        ctx,
        feelingText,
        slot.width,
        slot.height,
        initialFontSize,
        fontFamily,
        1.35
      );

      ctx.font = `${finalFontSize}px ${fontFamily}`;
      lines.forEach((line, idx) => {
        ctx.fillText(line, slot.x, slot.y + idx * (finalFontSize * 1.35));
      });
    } else if (slot.slot_id === 'gratitude_list') {
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';
      ctx.font = `${initialFontSize}px ${fontFamily}`;

      const items = (spec.gratitude_list || []).slice(0, slot.max_items || 3);
      let currentY = slot.y;

      items.forEach((item) => {
        ctx.fillStyle = bulletColor;
        ctx.fillText('♥', slot.x, currentY);

        ctx.fillStyle = textColor;
        const textX = slot.x + 22;
        const textMaxWidth = slot.width - 24;

        const { lines, finalFontSize } = wrapAndFitText(
          ctx,
          item,
          textMaxWidth,
          40,
          initialFontSize,
          fontFamily,
          1.2
        );

        ctx.font = `${finalFontSize}px ${fontFamily}`;
        lines.forEach((l, lIdx) => {
          ctx.fillText(l, textX, currentY + lIdx * (finalFontSize * 1.2));
        });

        currentY += Math.max(34, lines.length * (finalFontSize * 1.2) + 10);
      });
    } else if (slot.slot_id === 'quote' && spec.quote) {
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';

      const quoteText = `"${spec.quote}"`;
      const { lines, finalFontSize } = wrapAndFitText(
        ctx,
        quoteText,
        slot.width,
        slot.height,
        initialFontSize,
        fontFamily,
        1.3
      );

      ctx.font = `italic ${finalFontSize}px ${fontFamily}`;
      const totalTextHeight = lines.length * (finalFontSize * 1.3);
      const startY = slot.y + Math.max(0, (slot.height - totalTextHeight) / 2);

      lines.forEach((line, idx) => {
        const metrics = ctx.measureText(line);
        const drawX =
          slot.align === 'center'
            ? slot.x + (slot.width - metrics.width) / 2
            : slot.x;
        ctx.fillText(line, drawX, startY + idx * (finalFontSize * 1.3));
      });
    }

    ctx.restore();
  }

  // Generate output MIME type & file extension
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const extension = format === 'jpeg' ? 'jpg' : 'png';
  const dataUrl = canvas.toDataURL(mimeType, quality);

  // Filename sanitation
  const cleanTitle = (spec.title || 'memory-flash-card')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-');

  const downloadName = `${cleanTitle || 'memory'}.${extension}`;

  // Trigger browser download
  const link = document.createElement('a');
  link.download = downloadName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}
