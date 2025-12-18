import { MenuItem, GlobalAddon } from "../types";
import { INITIAL_MENU_ITEMS, INITIAL_GLOBAL_ADDONS } from "../constants";

const MENU_STORAGE_KEY = 'vendasta_patio_menu_items_v1';
const ADDONS_STORAGE_KEY = 'vendasta_patio_global_addons_v1';

// --- Menu Items ---

export const getMenuItems = (): MenuItem[] => {
  try {
    const stored = localStorage.getItem(MENU_STORAGE_KEY);
    if (!stored) {
      // Seed initial data
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load menu", e);
    return INITIAL_MENU_ITEMS;
  }
};

export const saveMenuItem = (item: MenuItem): void => {
  const current = getMenuItems();
  const index = current.findIndex(i => i.id === item.id);
  
  if (index >= 0) {
    current[index] = item; // Update
  } else {
    current.push(item); // Add
  }
  
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(current));
};

export const toggleItemSoldOut = (id: string, isSoldOut: boolean): void => {
  const current = getMenuItems();
  const index = current.findIndex(i => i.id === id);
  
  if (index >= 0) {
    current[index].isSoldOut = isSoldOut;
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(current));
  }
};

export const deleteMenuItem = (id: string): void => {
  const current = getMenuItems();
  const filtered = current.filter(i => i.id !== id);
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(filtered));
};

export const resetMenuToDefault = (): MenuItem[] => {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
  return INITIAL_MENU_ITEMS;
};

// --- Global Addons ---

export const getGlobalAddons = (): GlobalAddon[] => {
  try {
    const stored = localStorage.getItem(ADDONS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(INITIAL_GLOBAL_ADDONS));
      return INITIAL_GLOBAL_ADDONS;
    }
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_GLOBAL_ADDONS;
  }
};

export const saveGlobalAddon = (addon: GlobalAddon): void => {
  const current = getGlobalAddons();
  const index = current.findIndex(a => a.id === addon.id);
  
  if (index >= 0) {
    current[index] = addon;
  } else {
    current.push(addon);
  }
  
  localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(current));
};

export const deleteGlobalAddon = (id: string): void => {
  const current = getGlobalAddons();
  const filtered = current.filter(a => a.id !== id);
  localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(filtered));
};