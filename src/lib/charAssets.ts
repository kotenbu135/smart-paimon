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

export function weaponIcon(id: string, awaken: boolean): string {
  return `${ROOT}weapons/${id}/${awaken ? "awaken" : "icon"}.png`;
}

export type ArtifactSlot = "flower" | "plume" | "sands" | "goblet" | "circlet";

export function artifactIcon(setId: string, slot: ArtifactSlot): string {
  return `${ROOT}artifacts/${setId}/${slot}.png`;
}
