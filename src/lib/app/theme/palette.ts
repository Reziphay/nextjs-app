import type { AppRole } from '../models/user';

export type RolePalette = {
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  primaryLight: string;
  // CSS variable names to inject
  vars: Record<string, string>;
};

export const UCR_PALETTE: RolePalette = {
  primary: '#CC444B',
  primaryStrong: '#B63F46',
  primarySoft: 'rgba(204,68,75,0.14)',
  primaryLight: '#DF7373',
  vars: {
    '--app-primary': '#CC444B',
    '--app-primary-strong': '#B63F46',
    '--app-primary-soft': 'rgba(204,68,75,0.14)',
    '--app-primary-light': '#DF7373',
    '--app-primary-surface': '#FDF0EF',
    '--app-nav-indicator': '#CC444B',
  },
};

export const USO_PALETTE: RolePalette = {
  primary: '#77BFA3',
  primaryStrong: '#5FA889',
  primarySoft: 'rgba(119,191,163,0.16)',
  primaryLight: '#BFD8BD',
  vars: {
    '--app-primary': '#77BFA3',
    '--app-primary-strong': '#5FA889',
    '--app-primary-soft': 'rgba(119,191,163,0.16)',
    '--app-primary-light': '#BFD8BD',
    '--app-primary-surface': '#EEF7F3',
    '--app-nav-indicator': '#77BFA3',
  },
};

export const NEUTRAL_PALETTE: RolePalette = {
  primary: '#595959',
  primaryStrong: '#474747',
  primarySoft: 'rgba(89,89,89,0.14)',
  primaryLight: '#A5A5A5',
  vars: {
    '--app-primary': '#595959',
    '--app-primary-strong': '#474747',
    '--app-primary-soft': 'rgba(89,89,89,0.14)',
    '--app-primary-light': '#A5A5A5',
    '--app-primary-surface': '#F5F5F5',
    '--app-nav-indicator': '#595959',
  },
};

export function getPalette(role: AppRole | null): RolePalette {
  if (role === 'UCR') return UCR_PALETTE;
  if (role === 'USO') return USO_PALETTE;
  return NEUTRAL_PALETTE;
}

export function applyPaletteToRoot(palette: RolePalette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  Object.entries(palette.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
