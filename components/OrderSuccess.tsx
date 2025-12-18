import React from 'react';

interface Props {
  onDismiss: () => void;
}

export const OrderSuccess: React.FC<Props> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900 bg-opacity-95 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">Order Sent to Kitchen!</h2>
        
        <p className="text-lg text-gray-600 leading-relaxed">
          Thanks for your order! <br/><br/>
          <span className="font-semibold text-brand-800">Please wait nearby for the chef to assign you a buzzer number.</span>
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-3 px-4 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg"
        >
          Finish & Sign Out
        </button>
      </div>
    </div>
  );
};