import { OrderData } from "../types";
import { formatCurrency } from "../utils/dateUtils";

export const sendToKitchenPrinter = (orderData: OrderData): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      
      const divider = '--------------------------------';
      
      const itemsOutput = orderData.items.map(item => {
        let details = `${item.quantity} x ${item.menuItem.name} @ ${formatCurrency(item.menuItem.basePrice)}`;
        
        if (item.selectedOptions.length > 0) {
           item.selectedOptions.forEach(opt => {
             const val = Array.isArray(opt.value) ? opt.value.join(', ') : opt.value;
             const cost = opt.extraCost > 0 ? ` (+${formatCurrency(opt.extraCost)})` : '';
             details += `\n   - ${opt.optionName}: ${val}${cost}`;
           });
        }
        return details;
      }).join('\n');

      const ticket = `
${divider}
      PATIO KITCHEN TICKET
${divider}
Time:  ${orderData.timestamp}
Staff: ${orderData.employeeEmail}
${divider}
ITEMS:
${itemsOutput}
${divider}
Subtotal: ${formatCurrency(orderData.subtotal)}
Discount: ${orderData.discountApplied ? '50% OFF (Happy Hour)' : 'None'}
TOTAL:    ${formatCurrency(orderData.finalTotal)}
${divider}
AGREEMENT SIGNED: YES
${divider}
      `;

      console.log('%c KITCHEN PRINTER OUTPUT ', 'background: #222; color: #bada55; padding: 5px; font-weight: bold;');
      console.log(ticket);

      // TODO: Integration Point
      // 1. ePOS Integration: fetch('https://api.pos-system.com/orders', { method: 'POST', body: JSON.stringify(orderData) ... })
      // 2. Google Cloud Print (Deprecated) or CUPS/IPP printing service.

      resolve(true);
    }, 800);
  });
};