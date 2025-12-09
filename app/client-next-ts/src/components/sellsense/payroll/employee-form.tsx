'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Employee, EmployeeStatus, PaymentFrequency, EmploymentType } from '@/types/payroll';
import { validateEmployeeData, generateEmployeeNumber } from '@/lib/payroll-utils';

interface EmployeeFormProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => Promise<void>;
}

export function EmployeeForm({ employee, isOpen, onClose, onSave }: EmployeeFormProps) {
  const isEditMode = !!employee;
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeNumber: '',
    department: '',
    position: '',
    salary: '',
    paymentFrequency: 'bi_weekly' as PaymentFrequency,
    employmentType: 'full_time' as EmploymentType,
    status: 'active' as EmployeeStatus,
    hireDate: '',
    taxId: '',
    bankAccount: {
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking' as 'checking' | 'savings',
      bankName: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize form with employee data if editing
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || '',
        employeeNumber: employee.employeeNumber,
        department: employee.department,
        position: employee.position,
        salary: employee.salary.toString(),
        paymentFrequency: employee.paymentFrequency,
        employmentType: employee.employmentType,
        status: employee.status,
        hireDate: employee.hireDate,
        taxId: employee.taxId || '',
        bankAccount: employee.bankAccount || {
          accountNumber: '',
          routingNumber: '',
          accountType: 'checking',
          bankName: '',
        },
      });
    } else {
      // Generate employee number for new employees
      setFormData(prev => ({
        ...prev,
        employeeNumber: generateEmployeeNumber(),
        hireDate: new Date().toISOString().split('T')[0],
      }));
    }
  }, [employee]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBankAccountChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value,
      },
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // Prepare data for validation
    const employeeData: Partial<Employee> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      department: formData.department,
      position: formData.position,
      salary: parseFloat(formData.salary),
      paymentFrequency: formData.paymentFrequency,
      employmentType: formData.employmentType,
      status: formData.status,
      hireDate: formData.hireDate,
      taxId: formData.taxId || undefined,
      bankAccount: formData.bankAccount.accountNumber ? formData.bankAccount : undefined,
    };

    // Validate
    const validation = validateEmployeeData(employeeData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Save
    try {
      setSaving(true);
      await onSave({
        ...employeeData,
        employeeNumber: formData.employeeNumber,
        id: employee?.id,
      });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {saveError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold">Error Saving Employee</h3>
                <p className="text-red-600 text-sm">{saveError}</p>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john.doe@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Number
                </label>
                <input
                  type="text"
                  value={formData.employeeNumber}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID (SSN)
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Engineering"
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Software Engineer"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Salary <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.salary ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="75000"
                    min="0"
                    step="1000"
                  />
                </div>
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => handleChange('paymentFrequency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi_weekly">Bi-Weekly</option>
                  <option value="semi_monthly">Semi-Monthly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleChange('employmentType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Information</h3>
            <p className="text-sm text-gray-600 mb-4">
              Required for direct deposit payments
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankAccount.bankName}
                  onChange={(e) => handleBankAccountChange('bankName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Chase Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  value={formData.bankAccount.accountType}
                  onChange={(e) => handleBankAccountChange('accountType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccount.routingNumber}
                  onChange={(e) => handleBankAccountChange('routingNumber', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.routingNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123456789"
                  maxLength={9}
                />
                {errors.routingNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.routingNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccount.accountNumber}
                  onChange={(e) => handleBankAccountChange('accountNumber', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234567890"
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>{isEditMode ? 'Update Employee' : 'Add Employee'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
