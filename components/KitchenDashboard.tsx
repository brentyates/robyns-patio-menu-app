import React, { useState, useEffect } from 'react';
import { getOrderHistory, updateOrderStatus } from '../services/orderService';
import { OrderData, OrderStatus } from '../types';

// Extracted Component
const OrderCard: React.FC<{
  order: OrderData;
  status: OrderStatus;
  buzzerInput: string;
  onBuzzerChange: (val: string) => void;
  onAssignBuzzer: () => void;
  onComplete: () => void;
}> = ({ order, status, buzzerInput, onBuzzerChange, onAssignBuzzer, onComplete }) => {
  const isHistory = status === OrderStatus.COMPLETED;

  return (
    <div className={`rounded-lg shadow-sm border-l-4 flex flex-col 
      ${status === OrderStatus.PENDING ? 'bg-yellow-50 border-yellow-500 p-4' : 
        status === OrderStatus.IN_PROGRESS ? 'bg-green-50 border-green-500 p-4' : 
        'bg-white border-gray-300 p-2 opacity-75'}`}>
      
      {/* Header */}
      <div className={`flex justify-between items-center ${isHistory ? 'mb-1' : 'mb-3 border-b border-gray-200 pb-2'}`}>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-gray-500 ${isHistory ? 'text-[10px]' : 'text-xs'}`}>
            #{order.id.slice(0, 5)}
          </span>
          <h3 className={`font-bold text-gray-900 ${isHistory ? 'text-sm' : 'text-base'}`}>
            {order.employeeEmail.split('@')[0]}
          </h3>
        </div>
        <div className="text-right">
          <div className={`text-gray-500 ${isHistory ? 'text-[10px]' : 'text-xs'}`}>
            {order.timestamp.split(',')[1] || order.timestamp.split('T')[1]?.slice(0,5)}
          </div>
          {!isHistory && order.buzzerNumber && (
            <div className="text-sm font-bold bg-gray-800 text-white px-2 rounded mt-1">
              Buzzer: {order.buzzerNumber}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className={`flex-1 ${isHistory ? 'text-xs text-gray-700' : 'space-y-2 mb-4 overflow-y-auto max-h-60'}`}>
        {isHistory ? (
          // Compact View for History
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {order.items.map((item, idx) => (
              <span key={idx} className="whitespace-nowrap">
                <span className="font-bold">{item.quantity}x</span> {item.menuItem.name}
              </span>
            ))}
          </div>
        ) : (
          // Detailed View for Active Orders
          order.items.map((item, idx) => (
            <div key={idx} className="text-sm">
              <div className="font-bold">
                {item.quantity} x {item.menuItem.name}
              </div>
              {item.selectedOptions.length > 0 && (
                <ul className="pl-4 text-xs text-gray-600 list-disc">
                  {item.selectedOptions.map((opt, oIdx) => (
                    <li key={oIdx}>{opt.optionName}: {Array.isArray(opt.value) ? opt.value.join(', ') : opt.value}</li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer / Actions (Hidden for History) */}
      {!isHistory && (
        <div className="mt-auto pt-3 border-t border-gray-200">
          {status === OrderStatus.PENDING && (
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Buzzer #"
                className="w-20 p-2 border rounded text-center font-bold"
                value={buzzerInput}
                onChange={(e) => onBuzzerChange(e.target.value)}
              />
              <button 
                onClick={onAssignBuzzer}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded transition-colors"
              >
                Start
              </button>
            </div>
          )}
          {status === OrderStatus.IN_PROGRESS && (
            <button 
              onClick={onComplete}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors"
            >
              Complete Order
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const KitchenDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [buzzerInputs, setBuzzerInputs] = useState<Record<string, string>>({});

  const fetchOrders = () => {
    const all = getOrderHistory();
    // Sort logic handled in render, just set state here
    setOrders(all);
  };

  useEffect(() => {
    fetchOrders(); // Initial load
    const interval = setInterval(fetchOrders, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleBuzzerChange = (orderId: string, val: string) => {
    setBuzzerInputs(prev => ({ ...prev, [orderId]: val }));
  };

  const assignBuzzer = (orderId: string) => {
    const buzzer = buzzerInputs[orderId];
    if (!buzzer) {
      alert("Please enter a buzzer number");
      return;
    }
    const success = updateOrderStatus(orderId, OrderStatus.IN_PROGRESS, buzzer);
    if (success) fetchOrders();
  };

  const completeOrder = (orderId: string) => {
    const success = updateOrderStatus(orderId, OrderStatus.COMPLETED);
    if (success) {
        fetchOrders(); // Immediate refresh
    } else {
        alert("Failed to complete order.");
    }
  };

  // Derived state
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const inProgressOrders = orders.filter(o => o.status === OrderStatus.IN_PROGRESS);
  const completedOrders = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .reverse(); // Show newest completed first

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
           <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
           <h1 className="text-xl font-bold tracking-wider">KITCHEN DISPLAY SYSTEM</h1>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={onLogout} className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">Logout</button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-[1000px] pb-4">
          
          {/* PENDING */}
          <div className="flex-1 flex flex-col bg-gray-200 rounded-xl p-4 shadow-inner min-w-[300px]">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex justify-between items-center">
              <span>PENDING</span>
              <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-sm">{pendingOrders.length}</span>
            </h2>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {pendingOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  status={OrderStatus.PENDING}
                  buzzerInput={buzzerInputs[order.id] || ''}
                  onBuzzerChange={(val) => handleBuzzerChange(order.id, val)}
                  onAssignBuzzer={() => assignBuzzer(order.id)}
                  onComplete={() => {}} 
                />
              ))}
              {pendingOrders.length === 0 && <div className="text-center text-gray-400 mt-10">No pending orders</div>}
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="flex-1 flex flex-col bg-gray-200 rounded-xl p-4 shadow-inner min-w-[300px]">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex justify-between items-center">
              <span>IN PROGRESS</span>
              <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-sm">{inProgressOrders.length}</span>
            </h2>
             <div className="flex-1 space-y-4 overflow-y-auto">
               {inProgressOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  status={OrderStatus.IN_PROGRESS}
                  buzzerInput=""
                  onBuzzerChange={() => {}}
                  onAssignBuzzer={() => {}}
                  onComplete={() => completeOrder(order.id)}
                />
              ))}
              {inProgressOrders.length === 0 && <div className="text-center text-gray-400 mt-10">No active orders</div>}
            </div>
          </div>

           {/* COMPLETED */}
           <div className="flex-1 flex flex-col bg-gray-300 rounded-xl p-4 shadow-inner min-w-[300px]">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex justify-between items-center">
              <span>HISTORY</span>
              <span className="bg-gray-500 text-white px-2 py-0.5 rounded-full text-sm">{completedOrders.length}</span>
            </h2>
             <div className="flex-1 space-y-2 overflow-y-auto">
               {completedOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  status={OrderStatus.COMPLETED}
                  buzzerInput=""
                  onBuzzerChange={() => {}}
                  onAssignBuzzer={() => {}}
                  onComplete={() => {}}
                />
              ))}
              {completedOrders.length === 0 && <div className="text-center text-gray-500 mt-10">History empty</div>}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};