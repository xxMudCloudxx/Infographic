import type { ParsedInfographicOptions } from '../../options';
import { getPaletteColor } from '../../renderer';

const DEFAULT_COLOR = '#1890FF';

export function getColorPrimary(options: ParsedInfographicOptions) {
  return options?.themeConfig?.colorPrimary || DEFAULT_COLOR;
}

export function getPaletteColors(options: ParsedInfographicOptions): string[] {
  const { themeConfig = {}, data } = options;
  const { colorPrimary, palette } = themeConfig;

  if (!palette || palette.length === 0) {
    return Array(data?.items?.length || 1).fill(colorPrimary || DEFAULT_COLOR);
  }

  return data.items.map(
    (_, i) => getPaletteColor(palette, [i], data.items.length) || DEFAULT_COLOR,
  );
}
