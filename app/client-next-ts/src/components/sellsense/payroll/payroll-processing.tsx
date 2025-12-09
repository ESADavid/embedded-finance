'use client';

import { useState, useEffect } from 'react';
import { Play, CheckCircle, AlertCircle, Calendar, DollarSign, Users } from 'lucide-react';
import type { Employee, PaymentRecord } from '@/types/payroll';
import {
  formatCurrency,
  formatDate,
  calculateGrossPay,
  calculateNetPay,
  generatePaymentRecords,
} from '@/lib/payroll-utils';

type ProcessingStep = 'select' | 'review' | 'processing' | 'complete';

export function PayrollProcessing() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [payPeriodStart, setPayPeriodStart] = useState<string>('');
  const [payPeriodEnd, setPayPeriodEnd] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('select');
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
    // Set default dates
    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));

    setPayPeriodStart(twoWeeksAgo.toISOString().split('T')[0]);
    setPayPeriodEnd(today.toISOString().split('T')[0]);
    setPaymentDate(nextFriday.toISOString().split('T')[0]);
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/payroll/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      // Only show active employees
      const activeEmployees = (data.employees || []).filter(
        (emp: Employee) => emp.status === 'active'
      );
      setEmployees(activeEmployees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const toggleAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map((emp) => emp.id)));
    }
  };

  const handleReview = () => {
    if (selectedEmployees.size === 0) {
      setError('Please select at least one employee');
      return;
    }
    if (!paymentDate || !payPeriodStart || !payPeriodEnd) {
      setError('Please fill in all date fields');
      return;
    }

    const selectedEmps = employees.filter((emp) => selectedEmployees.has(emp.id));
    const records = generatePaymentRecords(
      selectedEmps,
      paymentDate,
      payPeriodStart,
      payPeriodEnd
    );
    setPaymentRecords(records);
    setCurrentStep('review');
    setError(null);
  };

  const handleProcessPayroll = async () => {
    try {
      setProcessing(true);
      setCurrentStep('processing');

      // Simulate API call
      const response = await fetch('/api/payroll/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentDate,
          payPeriodStart,
          payPeriodEnd,
          payments: paymentRecords,
        }),
      });

      if (!response.ok) throw new Error('Failed to process payroll');

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payroll');
      setCurrentStep('review');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartNew = () => {
    setSelectedEmployees(new Set());
    setPaymentRecords([]);
    setCurrentStep('select');
    setError(null);
    fetchEmployees();
  };

  const totalGross = paymentRecords.reduce((sum, record) => sum + record.grossAmount, 0);
  const totalDeductions = paymentRecords.reduce((sum, record) => sum + record.deductions, 0);
  const totalNet = paymentRecords.reduce((sum, record) => sum + record.netAmount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  // Step 1: Select Employees
  if (currentStep === 'select') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Process Payroll</h2>
          <p className="text-gray-600 mt-1">Select employees and configure payroll run</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Date Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payroll Period
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Period Start
              </label>
              <input
                type="date"
                value={payPeriodStart}
                onChange={(e) => setPayPeriodStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Period End
              </label>
              <input
                type="date"
                value={payPeriodEnd}
                onChange={(e) => setPayPeriodEnd(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Employee Selection */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Employees
              </h3>
              <button
                onClick={toggleAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedEmployees.size === employees.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {selectedEmployees.size} of {employees.length} employees selected
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {employees.map((employee) => {
              const isSelected = selectedEmployees.has(employee.id);
              const grossPay = calculateGrossPay(employee.salary, employee.paymentFrequency);
              const netPay = calculateNetPay(grossPay);

              return (
                <div
                  key={employee.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleEmployee(employee.id)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEmployee(employee.id)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {employee.department} • {employee.position}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(netPay)}</p>
                          <p className="text-sm text-gray-600">Net Pay</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleReview}
            disabled={selectedEmployees.size === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Review Payroll
            <Play className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Review
  if (currentStep === 'review') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Payroll</h2>
          <p className="text-gray-600 mt-1">
            Review payment details before processing
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900">{paymentRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gross</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGross)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Net</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalNet)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
            <p className="text-sm text-gray-600 mt-1">
              Period: {formatDate(payPeriodStart)} - {formatDate(payPeriodEnd)} • Payment Date:{' '}
              {formatDate(paymentDate)}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{record.employeeName}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatCurrency(record.grossAmount)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(record.deductions)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(record.netAmount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4 text-gray-900">Total</td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {formatCurrency(totalGross)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {formatCurrency(totalDeductions)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {formatCurrency(totalNet)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('select')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleProcessPayroll}
            disabled={processing}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {processing ? 'Processing...' : 'Process Payroll'}
            <Play className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Processing
  if (currentStep === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payroll...</h3>
          <p className="text-gray-600">
            Please wait while we process payments for {paymentRecords.length} employees
          </p>
        </div>
      </div>
    );
  }

  // Step 4: Complete
  if (currentStep === 'complete') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payroll Processed Successfully!</h3>
          <p className="text-gray-600 mb-6">
            {paymentRecords.length} payments totaling {formatCurrency(totalNet)} have been
            scheduled for {formatDate(paymentDate)}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleStartNew}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Process Another Payroll
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Payroll History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
