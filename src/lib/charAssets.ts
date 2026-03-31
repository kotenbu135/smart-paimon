const ROOT = import.meta.env.BASE_URL;
const BASE = `${ROOT}chars`;

export function charIcon(id: string): string {
  return `${BASE}/${id}/icon.png`;
}

export function charBanner(id: string): string {
  return `${BASE}/${id}/banner.png`;
}

export function charIconSide(id: string): string {
  return `${BASE}/${id}/icon-side.png`;
}

export function elementIcon(element: string): string {
  return `${ROOT}elements/${element.toLowerCase()}.png`;
}
