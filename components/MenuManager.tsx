import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory, MenuOption, OptionType, GlobalAddon } from '../types';
import { 
  getMenuItems, saveMenuItem, deleteMenuItem, resetMenuToDefault, toggleItemSoldOut,
  getGlobalAddons, saveGlobalAddon, deleteGlobalAddon
} from '../services/menuService';
import { formatCurrency } from '../utils/dateUtils';

export const MenuManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'ADDONS'>('ITEMS');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [addons, setAddons] = useState<GlobalAddon[]>([]);
  
  // Item Form State
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [itemFormData, setItemFormData] = useState<Partial<MenuItem>>({});
  
  // Addon Form State
  const [isAddonFormOpen, setIsAddonFormOpen] = useState(false);
  const [addonFormData, setAddonFormData] = useState<Partial<GlobalAddon>>({});

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setItems(getMenuItems());
    setAddons(getGlobalAddons());
  };

  const handleReset = () => {
    if (window.confirm("This will completely reset the menu and add-ons to original defaults. Continue?")) {
      resetMenuToDefault();
      localStorage.removeItem('vendasta_patio_global_addons_v1'); // Trigger reset for addons too
      refreshData();
    }
  };

  // --- MENU ITEM LOGIC ---

  const handleAddNewItem = () => {
    setItemFormData({
      id: `custom_${Date.now()}`,
      name: '',
      description: '',
      basePrice: 0,
      category: MenuCategory.REGULAR,
      options: [],
      isSoldOut: false
    });
    setIsItemFormOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setItemFormData(JSON.parse(JSON.stringify(item))); // Deep copy
    setIsItemFormOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name || itemFormData.basePrice === undefined) {
      alert("Name and Price are required");
      return;
    }
    
    // Clean up empty choices in options
    const cleanedOptions = itemFormData.options?.map(opt => ({
      ...opt,
      choices: opt.choices?.filter(c => c.trim() !== '') || []
    }));

    const itemToSave: MenuItem = {
      ...itemFormData as MenuItem,
      basePrice: Number(itemFormData.basePrice),
      options: cleanedOptions
    };

    saveMenuItem(itemToSave);
    setIsItemFormOpen(false);
    refreshData();
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Delete this item?")) {
      deleteMenuItem(id);
      refreshData();
    }
  };

  // Option Handling within Item Form
  const addOptionToItem = () => {
    const newOption: MenuOption = {
      id: `opt_${Date.now()}`,
      name: 'New Option',
      type: OptionType.SELECT,
      choices: ['Option 1'],
      required: true
    };
    setItemFormData({ ...itemFormData, options: [...(itemFormData.options || []), newOption] });
  };

  const removeOptionFromItem = (index: number) => {
    const newOpts = [...(itemFormData.options || [])];
    newOpts.splice(index, 1);
    setItemFormData({ ...itemFormData, options: newOpts });
  };

  const updateOptionField = (index: number, field: keyof MenuOption, value: any) => {
    const newOpts = [...(itemFormData.options || [])];
    newOpts[index] = { ...newOpts[index], [field]: value };
    setItemFormData({ ...itemFormData, options: newOpts });
  };

  const updateOptionChoice = (optIndex: number, choiceIndex: number, value: string) => {
    const newOpts = [...(itemFormData.options || [])];
    if (!newOpts[optIndex].choices) newOpts[optIndex].choices = [];
    newOpts[optIndex].choices![choiceIndex] = value;
    setItemFormData({ ...itemFormData, options: newOpts });
  };

  const addChoiceToOption = (optIndex: number) => {
    const newOpts = [...(itemFormData.options || [])];
    if (!newOpts[optIndex].choices) newOpts[optIndex].choices = [];
    newOpts[optIndex].choices!.push('New Choice');
    setItemFormData({ ...itemFormData, options: newOpts });
  };

  const removeChoiceFromOption = (optIndex: number, choiceIndex: number) => {
    const newOpts = [...(itemFormData.options || [])];
    if (newOpts[optIndex].choices) {
      newOpts[optIndex].choices!.splice(choiceIndex, 1);
    }
    setItemFormData({ ...itemFormData, options: newOpts });
  };

  // Price Modifier Helper
  const setChoicePrice = (optIndex: number, choiceIndex: number, baseName: string, price: string) => {
    const p = parseFloat(price);
    let newVal = baseName;
    // Remove existing price tag if present to get clean name
    const existingNameMatch = baseName.match(/^(.*?)\s*\(\+\$/);
    if (existingNameMatch) newVal = existingNameMatch[1];
    else if (baseName.includes('(+$')) newVal = baseName.split(' (+')[0]; // simple fallback

    if (!isNaN(p) && p > 0) {
      newVal = `${newVal} (+$${p.toFixed(2)})`;
    }
    updateOptionChoice(optIndex, choiceIndex, newVal);
  };

  const getChoicePrice = (val: string) => {
    const match = val.match(/\(\+\$(\d+(?:\.\d{2})?)\)/);
    return match ? match[1] : '';
  };
  
  const getChoiceName = (val: string) => {
     return val.replace(/\s*\(\+\$\d+(?:\.\d{2})?\)/, '');
  };

  // --- ADDON LOGIC ---

  const handleAddNewAddon = () => {
    setAddonFormData({
      id: `addon_${Date.now()}`,
      name: '',
      price: 0
    });
    setIsAddonFormOpen(true);
  };

  const handleEditAddon = (addon: GlobalAddon) => {
    setAddonFormData({ ...addon });
    setIsAddonFormOpen(true);
  };

  const handleSaveAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonFormData.name) return;
    saveGlobalAddon(addonFormData as GlobalAddon);
    setIsAddonFormOpen(false);
    refreshData();
  };

  const handleDeleteAddon = (id: string) => {
    if (window.confirm("Delete this add-on?")) {
      deleteGlobalAddon(id);
      refreshData();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Top Bar */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800">Menu Management</h2>
        </div>
        
        <div className="flex bg-gray-200 rounded p-1">
          <button 
            onClick={() => setActiveTab('ITEMS')}
            className={`px-4 py-1.5 rounded text-sm font-bold ${activeTab === 'ITEMS' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Menu Items
          </button>
          <button 
            onClick={() => setActiveTab('ADDONS')}
            className={`px-4 py-1.5 rounded text-sm font-bold ${activeTab === 'ADDONS' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Global Add-ons
          </button>
        </div>

        <div className="flex gap-2">
           <button 
             onClick={handleReset}
             className="px-3 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 text-xs font-medium"
           >
             Reset Defaults
           </button>
           <button 
             onClick={activeTab === 'ITEMS' ? handleAddNewItem : handleAddNewAddon}
             className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 font-bold shadow-sm text-sm"
           >
             + Add New {activeTab === 'ITEMS' ? 'Item' : 'Add-on'}
           </button>
        </div>
      </div>

      {/* --- ADDON FORM --- */}
      {isAddonFormOpen && activeTab === 'ADDONS' && (
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h3 className="font-bold text-lg mb-4 text-brand-900">Edit Add-on</h3>
          <form onSubmit={handleSaveAddon} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700">Name</label>
              <input 
                className="w-full border p-2 rounded mt-1" 
                value={addonFormData.name || ''} 
                onChange={e => setAddonFormData({...addonFormData, name: e.target.value})}
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-bold text-gray-700">Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full border p-2 rounded mt-1" 
                value={addonFormData.price || ''} 
                onChange={e => setAddonFormData({...addonFormData, price: parseFloat(e.target.value)})}
                required
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded font-bold">Save</button>
            <button type="button" onClick={() => setIsAddonFormOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          </form>
        </div>
      )}

      {/* --- ADDON LIST --- */}
      {activeTab === 'ADDONS' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Add-on Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {addons.map(addon => (
                <tr key={addon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{addon.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-bold">{formatCurrency(addon.price)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => handleEditAddon(addon)} className="text-brand-600 hover:text-brand-900 mr-4">Edit</button>
                    <button onClick={() => handleDeleteAddon(addon.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* --- MENU ITEM FORM --- */}
      {isItemFormOpen && activeTab === 'ITEMS' && (
        <div className="p-6 bg-blue-50 border-b border-blue-100 max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4 text-brand-900">{itemFormData.id?.startsWith('custom') ? 'New Item' : 'Edit Item'}</h3>
          <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Basic Info */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700">Item Name</label>
              <input 
                className="w-full border p-2 rounded mt-1" 
                value={itemFormData.name || ''} 
                onChange={e => setItemFormData({...itemFormData, name: e.target.value})}
                required
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700">Price ($)</label>
              <input 
                type="number" step="0.01"
                className="w-full border p-2 rounded mt-1" 
                value={itemFormData.basePrice || ''} 
                onChange={e => setItemFormData({...itemFormData, basePrice: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700">Description</label>
              <input 
                className="w-full border p-2 rounded mt-1" 
                value={itemFormData.description || ''} 
                onChange={e => setItemFormData({...itemFormData, description: e.target.value})}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-gray-700">Category</label>
              <select 
                className="w-full border p-2 rounded mt-1"
                value={itemFormData.category} 
                onChange={e => setItemFormData({...itemFormData, category: e.target.value as MenuCategory})}
              >
                {Object.values(MenuCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
               <label className="block text-sm font-bold text-gray-700">Available Day</label>
               <select 
                className="w-full border p-2 rounded mt-1"
                value={itemFormData.availableDay !== undefined ? itemFormData.availableDay : -1} 
                onChange={e => setItemFormData({...itemFormData, availableDay: parseInt(e.target.value)})}
              >
                <option value={-1}>Everyday</option>
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>

            {/* OPTIONS EDITOR */}
            <div className="col-span-2 mt-4 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-900">Customization Options (Sides, Flavor, etc.)</label>
                <button type="button" onClick={addOptionToItem} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 font-bold">+ Add Option</button>
              </div>
              
              <div className="space-y-4">
                {itemFormData.options?.map((opt, optIdx) => (
                  <div key={optIdx} className="border rounded bg-white p-3 shadow-sm">
                    <div className="flex gap-2 mb-2">
                       <input 
                          className="flex-1 border p-1 rounded text-sm font-bold" 
                          placeholder="Option Name (e.g., Choice of Side)"
                          value={opt.name}
                          onChange={(e) => updateOptionField(optIdx, 'name', e.target.value)}
                       />
                       <select 
                          className="border p-1 rounded text-sm"
                          value={opt.type}
                          onChange={(e) => updateOptionField(optIdx, 'type', e.target.value)}
                       >
                         <option value={OptionType.SELECT}>Single Choice (Radio)</option>
                         <option value={OptionType.TEXT}>Text Input</option>
                       </select>
                       <label className="flex items-center space-x-1 text-xs">
                          <input type="checkbox" checked={!!opt.required} onChange={(e) => updateOptionField(optIdx, 'required', e.target.checked)} />
                          <span>Req?</span>
                       </label>
                       <button type="button" onClick={() => removeOptionFromItem(optIdx)} className="text-red-500 text-xs font-bold px-2">X</button>
                    </div>

                    {/* Choices Editor for SELECT type */}
                    {opt.type === OptionType.SELECT && (
                      <div className="pl-4 border-l-2 border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Choices:</p>
                        {opt.choices?.map((choice, cIdx) => (
                           <div key={cIdx} className="flex gap-2 mb-1 items-center">
                              <input 
                                className="flex-1 border p-1 rounded text-sm"
                                placeholder="Choice Name"
                                value={getChoiceName(choice)}
                                onChange={(e) => {
                                  // Preserve existing price if name changes
                                  const price = getChoicePrice(choice);
                                  setChoicePrice(optIdx, cIdx, e.target.value, price);
                                }}
                              />
                              <div className="flex items-center gap-1 bg-gray-50 px-2 rounded border">
                                <span className="text-xs text-gray-500">+$</span>
                                <input 
                                  className="w-12 p-1 text-sm bg-transparent outline-none"
                                  placeholder="0.00"
                                  type="number"
                                  value={getChoicePrice(choice)}
                                  onChange={(e) => setChoicePrice(optIdx, cIdx, getChoiceName(choice), e.target.value)}
                                />
                              </div>
                              <button type="button" onClick={() => removeChoiceFromOption(optIdx, cIdx)} className="text-red-400 text-xs">&times;</button>
                           </div>
                        ))}
                        <button type="button" onClick={() => addChoiceToOption(optIdx)} className="text-xs text-brand-600 hover:underline mt-1">+ Add Choice</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 flex justify-end gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setIsItemFormOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-brand-600 text-white rounded font-bold hover:bg-brand-700"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- MENU ITEM LIST --- */}
      {activeTab === 'ITEMS' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.isSoldOut && (
                        <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                          SOLD OUT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {formatCurrency(item.basePrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => {
                        toggleItemSoldOut(item.id, !item.isSoldOut);
                        refreshData();
                      }} 
                      className={`mr-4 text-xs font-bold px-3 py-1 rounded border transition-colors ${
                        item.isSoldOut 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {item.isSoldOut ? 'Mark Available' : 'Mark Sold Out'}
                    </button>
                    <button onClick={() => handleEditItem(item)} className="text-brand-600 hover:text-brand-900 mr-4">Edit</button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};