import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory, CartItem } from './types';
import { getMenuItems } from './services/menuService';
import { getDayOfWeek, isHappyHourActive, formatCurrency } from './utils/dateUtils';
import { LoginScreen } from './components/LoginScreen';
import { ItemModal } from './components/ItemModal';
import { Cart } from './components/Cart';
import { OrderSuccess } from './components/OrderSuccess';
import { KitchenDashboard } from './components/KitchenDashboard';
import { AdminDashboard } from './components/AdminDashboard';

const App: React.FC = () => {
  // State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  // Time state
  const [isHappyHour, setIsHappyHour] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);

  // Load menu whenever user logs in (to ensure fresh data if Admin made changes)
  useEffect(() => {
    setMenuItems(getMenuItems());
  }, [userEmail]);

  // Update time logic periodically
  useEffect(() => {
    const checkTime = () => {
      setIsHappyHour(isHappyHourActive());
      setCurrentDay(getDayOfWeek());
    };
    
    checkTime(); // Initial check
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (item: CartItem) => {
    setCart([...cart, item]);
    setSelectedItem(null);
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(i => i.cartId !== id));
  };

  // Filter menu items based on day (for specials)
  const visibleItems = menuItems.filter(item => {
    if (item.category === MenuCategory.SPECIAL) {
      return item.availableDay === currentDay;
    }
    return true;
  });

  // Group items by category
  const groupedItems = visibleItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Determine categories order: Specials first, then Regular
  const categories = [MenuCategory.SPECIAL, MenuCategory.REGULAR];

  if (!userEmail) {
    return <LoginScreen onLogin={setUserEmail} />;
  }

  // === ROLE BASED ROUTING ===
  if (userEmail === 'kitchen@vendasta.com') {
    return <KitchenDashboard onLogout={() => setUserEmail(null)} />;
  }

  if (userEmail === 'admin@vendasta.com') {
    return <AdminDashboard onLogout={() => setUserEmail(null)} />;
  }

  return (
    <div className="min-h-screen pb-24 relative bg-gray-50">
      
      {/* Header */}
      <header className="bg-brand-900 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Vendasta Patio Menu</h1>
            <p className="text-xs text-brand-200">Logged in as: {userEmail}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            <button 
              onClick={() => setUserEmail(null)}
              className="text-sm text-brand-200 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Happy Hour Banner */}
        {isHappyHour && (
          <div className="mt-3 bg-yellow-400 text-brand-900 px-3 py-1 rounded font-bold text-center text-sm animate-pulse">
            🎉 Staff Happy Hour Active: 50% Off Total!
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-8">
        {categories.map(cat => {
          const items = groupedItems[cat as MenuCategory] || [];
          if (items.length === 0) return null;

          return (
            <section key={cat}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 border-brand-200">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      if (!item.isSoldOut) {
                        setSelectedItem(item);
                      }
                    }}
                    className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all flex justify-between items-start relative overflow-hidden
                      ${item.isSoldOut 
                        ? 'opacity-60 grayscale cursor-not-allowed bg-gray-100' 
                        : 'cursor-pointer hover:shadow-md hover:border-brand-300'
                      }`}
                  >
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center flex-wrap gap-2">
                        {item.name}
                        {item.isSoldOut && (
                          <span className="text-red-600 font-extrabold text-xs border border-red-600 px-1 rounded uppercase tracking-wide">
                            SOLD OUT
                          </span>
                        )}
                      </h3>
                      {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                    </div>
                    <div className="text-brand-600 font-bold ml-4 whitespace-nowrap">
                      {formatCurrency(item.basePrice)}
                    </div>
                    
                    {/* Visual strikethrough effect for sold out items */}
                    {item.isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                         <span className="text-6xl font-black text-gray-900 -rotate-12">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCart={handleAddToCart} 
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <Cart 
          cart={cart}
          userEmail={userEmail}
          isHappyHour={isHappyHour}
          onClose={() => setIsCartOpen(false)}
          onClear={() => setCart([])}
          onRemoveItem={handleRemoveItem}
          onOrderComplete={() => setShowSuccess(true)}
        />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <OrderSuccess onDismiss={() => {
          setShowSuccess(false);
          setUserEmail(null);
        }} />
      )}
      
      {/* Floating Bottom Action Button (Mobile Only) if Cart closed */}
      {!isCartOpen && !showSuccess && cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-20">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-brand-900 text-white py-3 rounded-lg shadow-lg font-bold flex justify-between px-6"
          >
            <span>View Cart</span>
            <span>{cart.length} items</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default App;