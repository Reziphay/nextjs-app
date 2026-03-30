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
  primaryStrong: '#B83840',
  primarySoft: 'rgba(204,68,75,0.14)',
  primaryLight: '#E4B1AB',
  vars: {
    '--app-primary': '#CC444B',
    '--app-primary-strong': '#B83840',
    '--app-primary-soft': 'rgba(204,68,75,0.14)',
    '--app-primary-light': '#E4B1AB',
    '--app-primary-surface': '#FDF0EF',
    '--app-nav-indicator': '#CC444B',
  },
};

export const USO_PALETTE: RolePalette = {
  primary: '#3D8C6E',
  primaryStrong: '#2E6E55',
  primarySoft: 'rgba(61,140,110,0.14)',
  primaryLight: '#77BFA3',
  vars: {
    '--app-primary': '#3D8C6E',
    '--app-primary-strong': '#2E6E55',
    '--app-primary-soft': 'rgba(61,140,110,0.14)',
    '--app-primary-light': '#77BFA3',
    '--app-primary-surface': '#EEF7F3',
    '--app-nav-indicator': '#3D8C6E',
  },
};

export const NEUTRAL_PALETTE: RolePalette = {
  primary: '#595959',
  primaryStrong: '#3D3D3D',
  primarySoft: 'rgba(89,89,89,0.14)',
  primaryLight: '#A0A0A0',
  vars: {
    '--app-primary': '#595959',
    '--app-primary-strong': '#3D3D3D',
    '--app-primary-soft': 'rgba(89,89,89,0.14)',
    '--app-primary-light': '#A0A0A0',
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
