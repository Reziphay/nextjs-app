import type { AppStore } from "./index";

let _store: AppStore | null = null;

export function setStoreRef(store: AppStore): void {
  _store = store;
}

export function getStoreRef(): AppStore | null {
  return _store;
}
