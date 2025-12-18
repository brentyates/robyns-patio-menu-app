import { MenuItem, MenuCategory, OptionType, GlobalAddon } from './types';

// Reusable Options
const PROTEIN_OPTIONS = ['Chicken', 'Beef', 'Plant Based'];
// Update SIDES to include Poutine upgrade with price modifier syntax
const SIDES_OPTIONS = ['Fries', 'Onion Rings', 'Caesar Salad', 'House Salad', 'Upgrade to Poutine (+$2.00)'];
const WING_TYPE_OPTIONS = ['Tossed', 'Dip on Side'];

// Global Add-ons Seed Data
export const INITIAL_GLOBAL_ADDONS: GlobalAddon[] = [
  { id: 'addon_brisket', name: 'Add Brisket', price: 2 },
  { id: 'addon_chicken', name: 'Add Chicken', price: 2 },
  { id: 'addon_shrimp', name: 'Add Shrimp', price: 2 },
];

// Renamed to INITIAL to indicate this is just the seed data
export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- Weekly Specials ---
  {
    id: 'spec_tues',
    name: '2 Seasonal Tacos & Chips',
    description: 'Tuesday Special',
    basePrice: 8,
    category: MenuCategory.SPECIAL,
    availableDay: 2, // Tuesday
    options: [
      { id: 'opt_prot', name: 'Choice of Protein', type: OptionType.SELECT, choices: PROTEIN_OPTIONS, required: true }
    ]
  },
  {
    id: 'spec_wed',
    name: 'Chicken Wings (Special)',
    description: 'Wednesday Special',
    basePrice: 10,
    category: MenuCategory.SPECIAL,
    availableDay: 3, // Wednesday
    options: [
      { id: 'opt_wing_style', name: 'Preparation', type: OptionType.SELECT, choices: WING_TYPE_OPTIONS, required: true },
      { id: 'opt_wing_flav', name: 'Wing Flavor', type: OptionType.TEXT, required: true }
    ]
  },
  {
    id: 'spec_thurs',
    name: 'Burger',
    description: 'Thursday Special',
    basePrice: 12,
    category: MenuCategory.SPECIAL,
    availableDay: 4, // Thursday
    options: [
      { id: 'opt_prot', name: 'Choice of Protein', type: OptionType.SELECT, choices: ['Chicken', 'Beef', 'Vegetarian'], required: true },
      { id: 'opt_side', name: 'Choice of Side', type: OptionType.SELECT, choices: SIDES_OPTIONS, required: true }
    ]
  },
  {
    id: 'spec_fri',
    name: 'Steak Sandwich',
    description: 'Friday Special',
    basePrice: 16,
    category: MenuCategory.SPECIAL,
    availableDay: 5, // Friday
    options: [
      { id: 'opt_doneness', name: 'Degree of Doneness', type: OptionType.TEXT, required: true },
      { id: 'opt_side1', name: 'First Side', type: OptionType.SELECT, choices: SIDES_OPTIONS, required: true },
      { id: 'opt_side2', name: 'Second Side', type: OptionType.SELECT, choices: SIDES_OPTIONS, required: true }
    ]
  },

  // --- Regular Menu Items ---
  {
    id: 'reg_fries',
    name: 'French Fries',
    basePrice: 4,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_poutine_gouda',
    name: 'Smoked Gouda Poutine',
    basePrice: 8,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_poutine_brisket',
    name: 'Spiced Brisket Poutine',
    basePrice: 10,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_nash_chic',
    name: 'Nashville Crispy Chicken Sandwich',
    basePrice: 12,
    category: MenuCategory.REGULAR,
    options: [
      { id: 'opt_side', name: 'Choice of Side', type: OptionType.SELECT, choices: SIDES_OPTIONS, required: true }
    ]
  },
  {
    id: 'reg_buff_plant',
    name: 'Buffalo Plant Forward Crispy Chicken Sandwich',
    basePrice: 12,
    category: MenuCategory.REGULAR,
    options: [
      { id: 'opt_side', name: 'Choice of Side', type: OptionType.SELECT, choices: SIDES_OPTIONS, required: true }
    ]
  },
  {
    id: 'reg_wings',
    name: 'Chicken Wings',
    basePrice: 12,
    category: MenuCategory.REGULAR,
    options: [
      { id: 'opt_wing_style', name: 'Preparation', type: OptionType.SELECT, choices: WING_TYPE_OPTIONS, required: true },
      { id: 'opt_wing_flav', name: 'Wing Flavor', type: OptionType.TEXT, required: true }
    ]
  },
  {
    id: 'reg_ginger_bowl',
    name: 'Ginger Beef Stirfry Bowl',
    description: 'With rice noodles',
    basePrice: 14,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_coco_shrimp',
    name: 'Coconut Shrimp',
    description: 'With dip',
    basePrice: 12,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_spring_rolls',
    name: 'Vegetable Spring Rolls',
    basePrice: 6,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_salad',
    name: 'Mandarin Salad',
    description: 'Walnuts and lemon poppyseed dressing',
    basePrice: 6,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_flatbread',
    name: 'Crispy BBQ Chicken Flatbread',
    basePrice: 12,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_mac',
    name: 'Baked Mac & Cheese',
    basePrice: 6,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_tenders',
    name: 'Chicken Tenders',
    basePrice: 12,
    category: MenuCategory.REGULAR,
    options: [
      { id: 'opt_side', name: 'Choice of Side', type: OptionType.SELECT, choices: SIDES_OPTIONS, required: true }
    ]
  },
  {
    id: 'reg_mozza',
    name: 'Mozzarella Sticks',
    basePrice: 10,
    category: MenuCategory.REGULAR
  },
  {
    id: 'reg_tacos',
    name: '2 Seasonal Tacos',
    description: 'With tortilla chips',
    basePrice: 12,
    category: MenuCategory.REGULAR,
    options: [
      { id: 'opt_prot', name: 'Choice of Protein', type: OptionType.SELECT, choices: PROTEIN_OPTIONS, required: true }
    ]
  },
  {
    id: 'reg_burger',
    name: 'Vendasta Burger',
    basePrice: 14,
    category: MenuCategory.REGULAR,
    options: [
      { id: 'opt_prot', name: 'Choice of Protein', type: OptionType.SELECT, choices: PROTEIN_OPTIONS, required: true },
      { id: 'opt_side', name: 'Choice of Side', type: OptionType.SELECT, choices: SIDES_OPTIONS, required: true }
    ]
  },
  {
    id: 'reg_steak_bites',
    name: 'Steak Bites',
    description: 'With sweet heat steak sauce',
    basePrice: 14,
    category: MenuCategory.REGULAR
  }
];