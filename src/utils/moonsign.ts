export const MOONSIGN_CHARACTERS = new Set([
  "ineffa", "flins", "lauma", "nefer", "zibai",
  "columbina", "aino", "jahoda", "illuga",
]);

export function isMoonsignCharacter(characterId: string): boolean {
  return MOONSIGN_CHARACTERS.has(characterId);
}
