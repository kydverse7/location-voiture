/**
 * Transforme une URL Cloudinary pour obtenir la qualité maximale (100%)
 * et le format automatique adapté au navigateur.
 */
export function cloudinaryBestQuality(url: string) {
  if (!url) return url;
  // Only rewrite classic Cloudinary delivery URLs
  // Example: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/id
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const after = url.slice(idx + marker.length);
  // If there is already a transformation part, keep as-is.
  // Transformation URLs have something like: <transforms>/v123...
  // If it starts with v<digits>/ we consider no transforms yet.
  if (!/^v\d+\//.test(after)) return url;

  // q_100 = qualité 100% (pas de compression)
  // f_auto = format optimal pour le navigateur (webp, avif, etc.)
  // dpr_auto = adapte la résolution à l'écran (retina)
  const transforms = 'f_auto,q_100,dpr_auto';
  return url.slice(0, idx + marker.length) + transforms + '/' + after;
}
