/**
 * Image utility helpers for optimized loading and error handling
 */

/**
 * Normalize image path for consistent loading across environments
 * @param src - Image source path
 * @returns Normalized path starting with /
 */
export const normalizeImagePath = (src: string | undefined): string => {
  if (!src) return '';

  // If it's already a full URL, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Ensure path starts with /
  return src.startsWith('/') ? src : `/${src}`;
};

const RASTER_EXT_RE = /\.(png|jpe?g)$/i;

/**
 * Build a WebP variant path for a local raster image (.png/.jpg/.jpeg).
 * Returns null when the source isn't a local raster (e.g., remote URL or SVG),
 * so callers can fall back to the original src.
 */
export const toWebpPath = (src: string | undefined): string | null => {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return null;
  if (!RASTER_EXT_RE.test(src)) return null;
  return src.replace(RASTER_EXT_RE, '.webp');
};
