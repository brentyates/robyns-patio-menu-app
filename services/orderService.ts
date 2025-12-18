import { OrderData, OrderStatus } from "../types";
import { formatToSaskatoonTime } from "../utils/dateUtils";

const STORAGE_KEY = 'vendasta_patio_orders_v1';

export const submitOrder = async (orderData: OrderData): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate slight network delay
    setTimeout(() => {
      saveOrderToHistory(orderData);
      resolve(true);
    }, 500);
  });
};

const saveOrderToHistory = (orderData: OrderData) => {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    const history: OrderData[] = current ? JSON.parse(current) : [];
    history.push(orderData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save order history", e);
  }
}

export const getOrderHistory = (): OrderData[] => {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    return current ? JSON.parse(current) : [];
  } catch (e) {
    return [];
  }
}

export const getActiveOrders = (): OrderData[] => {
  const all = getOrderHistory();
  return all.filter(o => o.status !== OrderStatus.COMPLETED);
}

export const getOrdersByDateRange = (startDate: string, endDate: string): OrderData[] => {
  const all = getOrderHistory();
  
  // We compare string YYYY-MM-DD directly for simplicity and robustness in this context,
  // relying on the helper to extract the Saskatoon local date from the stored ISO timestamp.
  return all.filter(o => {
    const { date } = formatToSaskatoonTime(o.timestamp);
    return date >= startDate && date <= endDate;
  });
};

export const updateOrderStatus = (orderId: string, status: OrderStatus, buzzerNumber?: string): boolean => {
  try {
    const all = getOrderHistory();
    const index = all.findIndex(o => o.id === orderId);
    
    if (index !== -1) {
      console.log(`Updating order ${orderId} to ${status}`);
      
      // Create a shallow copy of the order to ensure reference change
      const updatedOrder = { ...all[index] };
      updatedOrder.status = status;
      
      if (status === OrderStatus.COMPLETED) {
        // Explicitly remove buzzer number key
        delete updatedOrder.buzzerNumber;
      } else if (buzzerNumber) {
        updatedOrder.buzzerNumber = buzzerNumber;
      }
      
      // Update array
      all[index] = updatedOrder;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return true;
    } else {
      console.error(`Order ${orderId} not found`);
      return false;
    }
  } catch (e) {
    console.error("Error updating order status", e);
    return false;
  }
}

// --- REPORTING FUNCTIONS ---

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Report 1: Payroll
 * Columns: Date, Time, User Name/Email, Total Cost
 */
export const generatePayrollCSV = (orders: OrderData[], filename: string) => {
  if (orders.length === 0) {
    alert("No orders to export.");
    return;
  }

  let csv = 'Date,Time,User Email,Total Cost\n';
  
  orders.forEach(order => {
    const { date, time } = formatToSaskatoonTime(order.timestamp);
    const row = [
      `"${date}"`,
      `"${time}"`,
      `"${order.employeeEmail}"`,
      order.finalTotal.toFixed(2)
    ].join(',');
    csv += row + '\n';
  });

  downloadCSV(csv, filename);
};

/**
 * Report 2: Happy Hour Tracking
 * Filter: discountApplied == true (After 5pm)
 * Columns: Date, Item, Quantity
 */
export const generateHappyHourStatsCSV = (orders: OrderData[], filename: string) => {
  // Filter for Happy Hour orders only
  const happyHourOrders = orders.filter(o => o.discountApplied);

  if (happyHourOrders.length === 0) {
    alert("No Happy Hour (50% off) orders found in this date range.");
    return;
  }

  let csv = 'Date,Item,Quantity\n';

  happyHourOrders.forEach(order => {
    const { date } = formatToSaskatoonTime(order.timestamp);
    
    order.items.forEach(item => {
      const row = [
        `"${date}"`,
        `"${item.menuItem.name}"`,
        item.quantity
      ].join(',');
      csv += row + '\n';
    });
  });

  downloadCSV(csv, filename);
};

// Legacy generic export
export const generateCSV = (orders: OrderData[], filename: string) => {
  // Use payroll as default if called generically, or implement full dump if needed.
  // Implementing full dump for backward compat:
  let csv = 'ID,Date,Time,Status,Employee Email,Items,Subtotal,Discount,Total\n';
  orders.forEach(order => {
    const { date, time } = formatToSaskatoonTime(order.timestamp);
    const itemSummary = order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join('; ');
    const row = [
      order.id, date, time, order.status, order.employeeEmail, `"${itemSummary}"`, 
      order.subtotal.toFixed(2), order.discountApplied ? 'Yes' : 'No', order.finalTotal.toFixed(2)
    ].join(',');
    csv += row + '\n';
  });
  downloadCSV(csv, filename);
};