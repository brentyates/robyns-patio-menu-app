import React, { useState, useEffect } from 'react';
import { MenuItem, OptionType, CartItem, CartItemOptionSelection, GlobalAddon } from '../types';
import { getGlobalAddons } from '../services/menuService';
import { formatCurrency } from '../utils/dateUtils';

interface Props {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  isHappyHour?: boolean;
}

export const ItemModal: React.FC<Props> = ({ item, onClose, onAddToCart, isHappyHour }) => {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [globalAddons, setGlobalAddons] = useState<GlobalAddon[]>([]);

  useEffect(() => {
    setGlobalAddons(getGlobalAddons());
  }, []);

  // Initialize defaults if needed
  useEffect(() => {
    const initialSelections: Record<string, string> = {};
    item.options?.forEach(opt => {
      if (opt.type === OptionType.SELECT && opt.choices && opt.choices.length > 0) {
        // We don't auto-select to force user choice
      }
    });
    setSelections(initialSelections);
  }, [item]);

  const handleOptionChange = (optionId: string, value: string) => {
    setSelections(prev => ({ ...prev, [optionId]: value }));
    setError(null);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }));
  };

  const getPriceModifier = (choiceStr: string): number => {
    // Looks for string like "Option Name (+$2.00)" or "(+$2)"
    const match = choiceStr.match(/\(\+\$(\d+(?:\.\d{2})?)\)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const calculateTotal = () => {
    let total = item.basePrice;
    
    // Add Item Options prices (e.g., Upgrade to Poutine)
    if (item.options) {
      item.options.forEach(opt => {
        const val = selections[opt.id];
        if (val) {
          total += getPriceModifier(val);
        }
      });
    }

    // Add global add-ons
    globalAddons.forEach(addon => {
      if (selectedAddons[addon.id]) {
        total += addon.price;
      }
    });

    return total * quantity;
  };

  const handleConfirm = () => {
    // Validation
    if (item.options) {
      for (const opt of item.options) {
        if (opt.required && !selections[opt.id]) {
          setError(`Please select an option for: ${opt.name}`);
          return;
        }
      }
    }

    const selectedOptionsList: CartItemOptionSelection[] = [];

    // Process Menu Options
    if (item.options) {
      item.options.forEach(opt => {
        const val = selections[opt.id];
        if (val) {
          const extraCost = getPriceModifier(val);
          selectedOptionsList.push({
            optionName: opt.name,
            value: val, // Keep the full string e.g., "Poutine (+$2.00)" for clarity on ticket
            extraCost: extraCost
          });
        }
      });
    }

    // Process Global Addons
    globalAddons.forEach(addon => {
      if (selectedAddons[addon.id]) {
        selectedOptionsList.push({
          optionName: 'Extra',
          value: addon.name,
          extraCost: addon.price
        });
      }
    });

    // Process Dietary Notes
    if (dietaryNotes.trim()) {
      selectedOptionsList.push({
        optionName: 'Dietary/Subs',
        value: dietaryNotes.trim(),
        extraCost: 0
      });
    }

    const cartItem: CartItem = {
      cartId: Math.random().toString(36).substr(2, 9),
      menuItem: item,
      quantity,
      selectedOptions: selectedOptionsList,
      itemTotal: calculateTotal()
    };

    onAddToCart(cartItem);
  };

  const total = calculateTotal();
  const discountedTotal = isHappyHour ? total * 0.5 : total;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6 backdrop-blur-sm">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            <p className="text-gray-500">
              {isHappyHour ? (
                <>
                  <span className="line-through mr-2">{formatCurrency(item.basePrice)}</span>
                  <span className="text-green-600 font-bold">{formatCurrency(item.basePrice * 0.5)} (Happy Hour)</span>
                </>
              ) : (
                formatCurrency(item.basePrice)
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 flex-1">
          
          {/* Specific Item Options */}
          {item.options?.map(opt => (
            <div key={opt.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {opt.name} {opt.required && <span className="text-red-500">*</span>}
              </label>
              
              {opt.type === OptionType.SELECT && (
                <div className="grid grid-cols-1 gap-2">
                  {opt.choices?.map(choice => (
                    <label key={choice} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={opt.id}
                        value={choice}
                        checked={selections[opt.id] === choice}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-gray-900">{choice}</span>
                    </label>
                  ))}
                </div>
              )}

              {opt.type === OptionType.TEXT && (
                <input
                  type="text"
                  placeholder="Type here..."
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 p-2 border"
                  value={selections[opt.id] || ''}
                  onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                />
              )}
            </div>
          ))}

          {/* Global Add-ons */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add-ons</h3>
            <div className="grid grid-cols-1 gap-2">
              {globalAddons.map(addon => (
                <label key={addon.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={!!selectedAddons[addon.id]}
                      onChange={() => toggleAddon(addon.id)}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 rounded"
                    />
                    <span className="text-gray-900">{addon.name}</span>
                  </div>
                  <span className="text-gray-500">+{formatCurrency(addon.price)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Restrictions or Substitutions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="E.g., No onions, gluten-free bun, sauce on side..."
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 p-2 border"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between sticky bottom-0">
          <div className="flex items-center border rounded-md bg-white">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            >-</button>
            <span className="px-3 py-2 font-medium w-8 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            >+</button>
          </div>
          <button
            onClick={handleConfirm}
            className="ml-4 flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold shadow hover:bg-brand-700 transition-colors"
          >
            Add {formatCurrency(discountedTotal)}
          </button>
        </div>

      </div>
    </div>
  );
};