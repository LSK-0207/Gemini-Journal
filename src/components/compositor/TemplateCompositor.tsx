import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import type { JournalDesignSpec } from '../../types';
import { getTemplate, type TemplateDefinition, type TemplateSlot } from '../../templates';
import {
  getFontFamily,
  getDefaultFontSize,
  getAccentBulletColor,
  wrapAndFitText,
} from '../../utils/compositorUtils';
import { exportMemoryCardAsImage } from '../../utils/imageExport';
import { generateCompleteSelfContainedSvg } from '../../utils/svgRenderer';
import { getTemplateBackground } from '../../templates/templateBackgrounds';

export interface TemplateCompositorRef {
  getCanvas: () => HTMLCanvasElement | null;
  getSvgString: () => string;
  exportAsPng: (fileName?: string) => Promise<string>;
}

interface TemplateCompositorProps {
  spec: JournalDesignSpec;
  className?: string;
  onRenderReady?: (svgMarkup: string) => void;
}

export const TemplateCompositor = forwardRef<TemplateCompositorRef, TemplateCompositorProps>(
  ({ spec, className = '', onRenderReady }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [template, setTemplate] = useState<TemplateDefinition>(() =>
      getTemplate(spec.template_id)
    );

    useEffect(() => {
      setTemplate(getTemplate(spec.template_id));
    }, [spec.template_id]);

    const titleSlot = template.slots.find((s) => s.slot_id === 'title') || template.slots[0];
    const feelingSlot = template.slots.find((s) => s.slot_id === 'feeling_block') || template.slots[1];
    const gratitudeSlot = template.slots.find((s) => s.slot_id === 'gratitude_list') || template.slots[2];
    const quoteSlot = template.slots.find((s) => s.slot_id === 'quote') || template.slots[3];

    const textColor = template.text_color;
    const bulletColor = getAccentBulletColor(template.vibe);

    // Draw to HTML5 Canvas (Zero-Cost Local Compositor)
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = template.background_asset;

      bgImg.onload = () => {
        canvas.width = template.width;
        canvas.height = template.height;

        // Draw background asset
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // Draw each slot deterministically using template-defined slots and template.text_color
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
              // Accent bullet
              ctx.fillStyle = bulletColor;
              ctx.fillText('♥', slot.x, currentY);

              // Text in template.text_color
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

        // Notify parent that render is ready with guaranteed self-contained SVG
        if (onRenderReady) {
          const completeSvg = generateCompleteSelfContainedSvg(spec, template.template_id);
          onRenderReady(completeSvg);
        }
      };
    }, [spec, template, onRenderReady, textColor, bulletColor]);

    // Imperative methods for downloading and SVG string generation
    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      getSvgString: () => {
        return generateCompleteSelfContainedSvg(spec, template.template_id);
      },
      exportAsPng: async (fileName = `scrapbook-${template.template_id}.png`) => {
        return await exportMemoryCardAsImage(
          {
            templateId: template.template_id,
            designSpec: spec,
          },
          'png'
        );
      },
    }));

    return (
      <div
        className={`relative w-full ${
          template.orientation === 'vertical' ? 'max-w-md sm:max-w-lg' : 'max-w-3xl'
        } mx-auto select-none ${className}`}
      >
        {/* Hidden HTML5 Canvas for measureText passes */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scalable SVG Rendered Page (Client-Side Composited, Zero-Cost) */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${template.width} ${template.height}`}
          className="w-full h-auto drop-shadow-xl rounded-xl overflow-hidden bg-[#faf5ea]"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          {/* 1. Inlined Vector Background Asset Layer (No external image network requests) */}
          <g dangerouslySetInnerHTML={{ __html: getTemplateBackground(template.template_id) }} />

          {/* 2. Measured Text Slots Layer */}
          {/* Title Slot */}
          {titleSlot && (
            <g transform={`translate(${titleSlot.x}, ${titleSlot.y})`}>
              <text
                x="0"
                y={template.orientation === 'vertical' ? 32 : 36}
                fontFamily="'Caveat', cursive, serif"
                fontSize={template.orientation === 'vertical' ? '34' : '38'}
                fontWeight="bold"
                fill={textColor}
              >
                {spec.title || 'Sunlit Thoughts'}
              </text>
              <text
                x="0"
                y={template.orientation === 'vertical' ? 52 : 58}
                fontFamily="'Kalam', cursive"
                fontSize="13"
                fontWeight="bold"
                fill={textColor}
                opacity="0.75"
              >
                Vibe: {spec.mood || template.vibe} ✦ {spec.date_display || 'Today'}
              </text>
            </g>
          )}

          {/* Feeling Block Slot */}
          {feelingSlot && (
            <g transform={`translate(${feelingSlot.x}, ${feelingSlot.y})`}>
              <text
                x="0"
                y="18"
                fontFamily="'Kalam', cursive"
                fontSize="15"
                fontWeight="bold"
                fill={textColor}
                opacity="0.9"
              >
                Today I feel:
              </text>
              <foreignObject
                x="0"
                y="26"
                width={feelingSlot.width}
                height={Math.max(40, feelingSlot.height - 26)}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontFamily: "'Kalam', cursive",
                    fontSize: template.orientation === 'vertical' ? '17px' : '18px',
                    lineHeight: '1.4',
                    color: textColor,
                    wordBreak: 'break-word',
                  }}
                >
                  {spec.feeling_block}
                </div>
              </foreignObject>
            </g>
          )}

          {/* Gratitude List Slot */}
          {gratitudeSlot && (
            <g transform={`translate(${gratitudeSlot.x}, ${gratitudeSlot.y})`}>
              <text
                x="0"
                y="18"
                fontFamily="'Kalam', cursive"
                fontSize="15"
                fontWeight="bold"
                fill={textColor}
                opacity="0.9"
              >
                Things I'm grateful for : ♡
              </text>
              <foreignObject
                x="0"
                y="26"
                width={gratitudeSlot.width}
                height={Math.max(60, gratitudeSlot.height - 26)}
              >
                <ul
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontFamily: "'Kalam', cursive",
                    fontSize: template.orientation === 'vertical' ? '17px' : '18px',
                    lineHeight: '1.35',
                    color: textColor,
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {(spec.gratitude_list || []).slice(0, gratitudeSlot.max_items || 3).map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>
                      <span style={{ color: bulletColor, marginRight: '8px' }}>♥</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </foreignObject>
            </g>
          )}

          {/* Quote Slot */}
          {quoteSlot && spec.quote && (
            <g transform={`translate(${quoteSlot.x}, ${quoteSlot.y})`}>
              <text
                x={quoteSlot.width / 2}
                y="18"
                fontFamily="'Caveat', cursive"
                fontSize="16"
                fontWeight="bold"
                fill={textColor}
                opacity="0.85"
                textAnchor="middle"
              >
                ✦ Insight &amp; Takeaway ✦
              </text>
              <foreignObject
                x="0"
                y="26"
                width={quoteSlot.width}
                height={Math.max(40, quoteSlot.height - 26)}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontFamily: "'Lora', serif",
                    fontStyle: 'italic',
                    fontSize: template.orientation === 'vertical' ? '16px' : '17px',
                    lineHeight: '1.35',
                    color: textColor,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '0 8px',
                  }}
                >
                  "{spec.quote}"
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
    );
  }
);
TemplateCompositor.displayName = 'TemplateCompositor';
