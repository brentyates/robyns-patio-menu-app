export enum MenuCategory {
  SPECIAL = 'Weekly Specials',
  REGULAR = 'Regular Menu',
  SIDES = 'Sides & Apps'
}

export enum OptionType {
  SELECT = 'SELECT', // Radio button style single choice
  TEXT = 'TEXT',     // Free text input
  CHECKBOX = 'CHECKBOX' // Multi-select (mostly for global add-ons)
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface GlobalAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuOption {
  id: string;
  name: string; // Display label (e.g., "Protein", "Degree of Doneness")
  type: OptionType;
  choices?: string[]; // For SELECT type
  priceMod?: number; // Extra cost if selected (mostly for Add-ons)
  required?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  category: MenuCategory;
  availableDay?: number; // 0=Sun, 1=Mon, 2=Tue... undefined = always available
  options?: MenuOption[];
  isSoldOut?: boolean;
}

export interface CartItemOptionSelection {
  optionName: string;
  value: string | string[]; // String for text/select, array for checkbox
  extraCost: number;
}

export interface CartItem {
  cartId: string; // Unique ID for the cart entry
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: CartItemOptionSelection[];
  itemTotal: number; // (Base + Extras) * Quantity
}

export interface OrderData {
  id: string;
  timestamp: string;
  employeeEmail: string;
  items: CartItem[];
  subtotal: number;
  discountApplied: boolean;
  finalTotal: number;
  status: OrderStatus;
  buzzerNumber?: string;
}