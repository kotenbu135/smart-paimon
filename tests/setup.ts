import "@testing-library/jest-dom/vitest";

// Node.js 25+ provides a stub global localStorage that lacks standard Web Storage API methods.
// Override it with a functional in-memory implementation for tests.
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

Object.defineProperty(globalThis, "localStorage", {
  value: createLocalStorageMock(),
  writable: true,
});
