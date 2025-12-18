import React, { useState } from 'react';

interface Props {
  onLogin: (email: string) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const cleanEmail = email.trim().toLowerCase();
  const isPrivileged = cleanEmail === 'admin@vendasta.com' || cleanEmail === 'kitchen@vendasta.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Special handling for privileged accounts
    if (isPrivileged) {
      if (password === 'vendasta') {
        onLogin(cleanEmail);
      } else {
        setError("Invalid password.");
      }
      return;
    }
    
    // Normal employee login
    if (cleanEmail.endsWith('@vendasta.com')) {
      onLogin(cleanEmail);
    } else {
      setError("Please use a valid @vendasta.com email address.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-brand-900 mb-2">Vendasta Patio Menu</h1>
        <p className="text-center text-gray-500 mb-8">Staff Ordering Portal</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Work Email</label>
            <input
              type="email"
              id="email"
              required
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-lg py-3 px-4 border ${error && !isPrivileged ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}`}
              placeholder="jane.doe@vendasta.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                // Reset password if they switch away from a privileged email so it doesn't linger
                if (password) setPassword('');
              }}
            />
          </div>

          {isPrivileged && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-lg py-3 px-4 border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
            </div>
          )}

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
          >
            {isPrivileged ? 'Login to Dashboard' : 'Start Ordering'}
          </button>
        </form>
      </div>
    </div>
  );
};