'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import type { PayrollSummary } from '@/types/payroll';
import { formatCurrency, formatDate } from '@/lib/payroll-utils';
import { getMockPayrollSummary } from '@/mocks/payroll.mock';

interface PayrollOverviewProps {
  onNavigate?: (view: 'employees' | 'process' | 'history') => void;
}

export function PayrollOverview({ onNavigate }: PayrollOverviewProps) {
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const data = getMockPayrollSummary();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching payroll summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Failed to load payroll summary
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total Employees',
      value: summary.totalEmployees,
      subtitle: `${summary.activeEmployees} active`,
      icon: Users,
      color: 'bg-blue-500',
      action: () => onNavigate?.('employees'),
    },
    {
      title: 'Next Payroll',
      value: formatDate(summary.nextPayrollDate),
      subtitle: formatCurrency(summary.upcomingPayrollAmount || 0),
      icon: Calendar,
      color: 'bg-green-500',
      action: () => onNavigate?.('process'),
    },
    {
      title: 'Last Payroll',
      value: summary.lastPayrollDate
        ? formatDate(summary.lastPayrollDate)
        : 'N/A',
      subtitle: summary.lastPayrollAmount
        ? formatCurrency(summary.lastPayrollAmount)
        : 'N/A',
      icon: DollarSign,
      color: 'bg-purple-500',
      action: () => onNavigate?.('history'),
    },
    {
      title: 'YTD Payroll',
      value: formatCurrency(summary.yearToDatePayroll),
      subtitle: `MTD: ${formatCurrency(summary.monthToDatePayroll)}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      action: () => onNavigate?.('history'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payroll Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage employee payroll and view payment history
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={index}
              onClick={card.action}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </p>
                  <p className="text-sm text-gray-600">{card.subtitle}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate?.('process')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <DollarSign className="h-5 w-5" />
            Run Payroll
          </button>
          <button
            onClick={() => onNavigate?.('employees')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            <Users className="h-5 w-5" />
            Manage Employees
          </button>
          <button
            onClick={() => onNavigate?.('history')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            <Calendar className="h-5 w-5" />
            View History
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {summary.lastPayrollDate && (
            <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Payroll Completed
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(summary.lastPayrollAmount || 0)} paid to{' '}
                  {summary.activeEmployees} employees
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(summary.lastPayrollDate)}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Upcoming Payroll
              </p>
              <p className="text-sm text-gray-500">
                Next payment scheduled for {formatDate(summary.nextPayrollDate)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Estimated: {formatCurrency(summary.upcomingPayrollAmount || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Active Employees
              </p>
              <p className="text-sm text-gray-500">
                {summary.activeEmployees} active employees,{' '}
                {summary.inactiveEmployees} inactive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
