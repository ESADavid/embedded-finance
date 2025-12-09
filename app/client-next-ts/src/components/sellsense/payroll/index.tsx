'use client';

import { useState } from 'react';
import { PayrollOverview } from './payroll-overview';
import { EmployeeManagement } from './employee-management';
import { PayrollProcessing } from './payroll-processing';
import { PayrollHistory } from './payroll-history';

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
        return <EmployeeManagement />;
      case 'process':
        return <PayrollProcessing />;
      case 'history':
        return <PayrollHistory />;
      default:
        return <PayrollOverview onNavigate={handleNavigate} />;
    }
  };

  return <div className="h-full overflow-auto">{renderView()}</div>;
}
