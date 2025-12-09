'use client';

import { useState } from 'react';
import { PayrollOverview } from './payroll-overview';

type PayrollView = 'overview' | 'employees' | 'process' | 'history';

export function Payroll() {
  const [activeView, setActiveView] = useState<PayrollView>('overview');

  const handleNavigate = (view: 'employees' | 'process' | 'history') => {
    setActiveView(view);
  };

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <PayrollOverview onNavigate={handleNavigate} />;
      case 'employees':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Employee Management
              </h2>
              <p className="text-gray-500 mb-4">
                Employee management component coming soon...
              </p>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Overview
              </button>
            </div>
          </div>
        );
      case 'process':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Process Payroll
              </h2>
              <p className="text-gray-500 mb-4">
                Payroll processing component coming soon...
              </p>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Overview
              </button>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Payroll History
              </h2>
              <p className="text-gray-500 mb-4">
                Payroll history component coming soon...
              </p>
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Overview
              </button>
            </div>
          </div>
        );
      default:
        return <PayrollOverview onNavigate={handleNavigate} />;
    }
  };

  return <div className="h-full overflow-auto">{renderView()}</div>;
}
