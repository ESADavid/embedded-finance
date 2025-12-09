'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, ChevronRight, CheckCircle, AlertCircle, Filter, X } from 'lucide-react';
import type { PayrollRun } from '@/types/payroll';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/payroll-utils';

export function PayrollHistory() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPayrollHistory();
  }, []);

  const fetchPayrollHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/payroll/history');
      if (!response.ok) throw new Error('Failed to fetch payroll history');
      const data = await response.json();
      setPayrollRuns(data.runs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter payroll runs
  const filteredRuns = payrollRuns.filter((run) => {
    // Date filter
    if (dateRange.start || dateRange.end) {
      const runDate = new Date(run.paymentDate);
      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        if (runDate < startDate) return false;
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        if (runDate > endDate) return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && run.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setStatusFilter('all');
  };

  const hasActiveFilters = dateRange.start || dateRange.end || statusFilter !== 'all';

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payroll history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading History</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchPayrollHistory}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Detail view
  if (selectedRun) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setSelectedRun(null)}
              className="text-blue-600 hover:text-blue-700 font-medium mb-2 flex items-center gap-1"
            >
              ← Back to History
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Payroll Run #{selectedRun.runNumber}
            </h2>
            <p className="text-gray-600 mt-1">
              {formatDate(selectedRun.payPeriodStart)} - {formatDate(selectedRun.payPeriodEnd)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedRun.status)}`}>
            {selectedRun.status}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900">{selectedRun.employeeCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Gross Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(selectedRun.totalGrossAmount)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Deductions</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(selectedRun.totalDeductions)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Net Amount</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(selectedRun.totalAmount)}
            </p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
            <p className="text-sm text-gray-600 mt-1">
              Payment Date: {formatDate(selectedRun.paymentDate)} • Processed:{' '}
              {formatDateTime(selectedRun.processedAt || selectedRun.createdAt)}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedRun.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{payment.employeeName}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatCurrency(payment.grossAmount)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(payment.deductions)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(payment.netAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payroll History</h2>
        <p className="text-gray-600 mt-1">View past payroll runs and payment details</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredRuns.length} of {payrollRuns.length} payroll runs
          </div>
        )}
      </div>

      {filteredRuns.length === 0 && payrollRuns.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600 mb-4">
            No payroll runs match your current filters. Try adjusting your search criteria.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : payrollRuns.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payroll History</h3>
          <p className="text-gray-600">
            You haven't processed any payroll runs yet. Start by processing your first payroll.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRuns.map((run) => (
            <div
              key={run.id}
              onClick={() => setSelectedRun(run)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payroll Run #{run.runNumber}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(run.status)}`}>
                      {run.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(run.payPeriodStart)} - {formatDate(run.payPeriodEnd)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{run.employeeCount} employees</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(run.totalAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      {getStatusIcon(run.status)}
                      <span>Paid {formatDate(run.paymentDate)}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
