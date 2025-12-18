import React, { useState } from 'react';
import { CartItem, OrderData, OrderStatus } from '../types';
import { formatCurrency, getSaskatoonDate } from '../utils/dateUtils';
import { submitOrder } from '../services/orderService';

interface Props {
  cart: CartItem[];
  userEmail: string;
  isHappyHour: boolean;
  onClose: () => void;
  onClear: () => void;
  onRemoveItem: (id: string) => void;
  onOrderComplete: () => void;
}

export const Cart: React.FC<Props> = ({ cart, userEmail, isHappyHour, onClose, onClear, onRemoveItem, onOrderComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
  // Dynamic Pricing Logic: 50% off total if Happy Hour
  const discount = isHappyHour ? subtotal * 0.5 : 0;
  const finalTotal = subtotal - discount;

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    console.log("Submitting order...");

    const orderData: OrderData = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
      timestamp: getSaskatoonDate().toISOString(), // Standard ISO format for backend
      employeeEmail: userEmail,
      items: cart,
      subtotal,
      discountApplied: isHappyHour,
      finalTotal,
      status: OrderStatus.PENDING
    };

    try {
      await submitOrder(orderData);
      console.log("Order submitted successfully");
      onClear();
      onClose();
      onOrderComplete();
    } catch (e) {
      console.error("Order failed", e);
      alert("Error sending order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
      <div className="absolute inset-0 bg-black bg-opacity-25 pointer-events-auto" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300">
        
        <div className="p-4 border-b bg-brand-900 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold">Your Order</h2>
          <button onClick={onClose} className="text-brand-100 hover:text-white">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">Cart is empty</div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="border rounded-lg p-3 bg-gray-50 relative">
                 <button 
                  onClick={() => onRemoveItem(item.cartId)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                >
                  &times;
                </button>
                <div className="flex justify-between font-bold text-gray-800">
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span>{formatCurrency(item.itemTotal)}</span>
                </div>
                {item.selectedOptions.length > 0 && (
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    {item.selectedOptions.map((opt, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {opt.optionName}: {Array.isArray(opt.value) ? opt.value.join(', ') : opt.value}</span>
                        {opt.extraCost > 0 && <span>+{formatCurrency(opt.extraCost * item.quantity)}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {isHappyHour && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Happy Hour (50% Off)</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mb-4">
             By clicking submit, I agree to have this amount taken off my next pay check.
          </p>

          <button
            onClick={handleSubmitOrder}
            disabled={cart.length === 0 || isSubmitting}
            className={`w-full py-4 rounded-lg font-bold text-lg text-white shadow-md transition-all ${
              cart.length === 0 || isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-brand-600 hover:bg-brand-700 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'SUBMIT ORDER'}
          </button>
        </div>
      </div>
    </div>
  );
};