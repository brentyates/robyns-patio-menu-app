import React, { useState, useEffect } from 'react';
import { getOrdersByDateRange, generatePayrollCSV, generateHappyHourStatsCSV } from '../services/orderService';
import { OrderData } from '../types';
import { formatCurrency, formatToSaskatoonTime } from '../utils/dateUtils';
import { MenuManager } from './MenuManager';

interface Props {
  onLogout: () => void;
}

enum Tab {
  REPORTS = 'REPORTS',
  MENU = 'MENU'
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.REPORTS);
  
  // Reporting State
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    if (startDate && endDate) {
      const orders = getOrdersByDateRange(startDate, endDate);
      // Sort by newest first
      setFilteredOrders(orders.reverse());
    }
  }, [startDate, endDate]);

  const handlePayrollDownload = () => {
    generatePayrollCSV(filteredOrders, `vendasta_payroll_${startDate}_to_${endDate}.csv`);
  };

  const handleHappyHourDownload = () => {
    generateHappyHourStatsCSV(filteredOrders, `vendasta_happy_hour_stats_${startDate}_to_${endDate}.csv`);
  };

  const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.finalTotal, 0);
  const totalOrders = filteredOrders.length;
  const happyHourCount = filteredOrders.filter(o => o.discountApplied).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <nav className="hidden sm:flex space-x-4">
              <button 
                onClick={() => setActiveTab(Tab.REPORTS)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === Tab.REPORTS ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              >
                Reports
              </button>
              <button 
                onClick={() => setActiveTab(Tab.MENU)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === Tab.MENU ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              >
                Menu Management
              </button>
            </nav>
          </div>
          <button 
            onClick={onLogout} 
            className="text-sm bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Tab Nav */}
      <div className="sm:hidden bg-gray-800 p-2 flex justify-around">
          <button 
            onClick={() => setActiveTab(Tab.REPORTS)}
            className={`flex-1 text-center py-2 text-sm font-medium ${activeTab === Tab.REPORTS ? 'text-white border-b-2 border-brand-500' : 'text-gray-400'}`}
          >
            Reports
          </button>
          <button 
            onClick={() => setActiveTab(Tab.MENU)}
            className={`flex-1 text-center py-2 text-sm font-medium ${activeTab === Tab.MENU ? 'text-white border-b-2 border-brand-500' : 'text-gray-400'}`}
          >
            Menu
          </button>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 w-full space-y-6">
        
        {activeTab === Tab.MENU && <MenuManager />}

        {activeTab === Tab.REPORTS && (
          <>
            {/* Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Report Configuration</h2>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 p-2 border"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 p-2 border"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handlePayrollDownload}
                  disabled={filteredOrders.length === 0}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                    filteredOrders.length === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Download Payroll Report
                </button>
                <button 
                  onClick={handleHappyHourDownload}
                  disabled={happyHourCount === 0}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                    happyHourCount === 0 
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Download 50% Off Item Report
                </button>
              </div>
              {happyHourCount === 0 && filteredOrders.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center sm:text-right w-full">No 50% off orders found in selected range.</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Payroll Revenue</p>
                <p className="text-3xl font-bold text-brand-600 mt-1">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Happy Hour Orders</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {happyHourCount}
                </p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Orders Preview</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                          No orders found for this date range.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const { date, time } = formatToSaskatoonTime(order.timestamp);
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="font-medium">{date}</div>
                              <div className="text-gray-500 text-xs">{time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.employeeEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                order.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                              {order.discountApplied && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">50% Off</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {formatCurrency(order.finalTotal)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};