/**
 * Payroll Utilities
 * 
 * Helper functions for payroll calculations and data manipulation
 */

import {
  PaymentStatus,
  type Employee,
  type PaymentRecord,
  type PayrollRun,
  type PaymentFrequency,
  type EmployeeStatus,
  type PayrollStatus,
} from '@/types/payroll';

/**
 * Calculate gross pay based on salary and payment frequency
 */
export function calculateGrossPay(
  salary: number,
  frequency: PaymentFrequency,
): number {
  switch (frequency) {
    case 'WEEKLY':
      return salary / 52;
    case 'BI_WEEKLY':
      return salary / 26;
    case 'SEMI_MONTHLY':
      return salary / 24;
    case 'MONTHLY':
      return salary / 12;
    default:
      return salary / 12;
  }
}

/**
 * Calculate deductions (simplified - in real system would be more complex)
 * Assumes: 20% federal tax, 5% state tax, 3% insurance, 2% retirement
 */
export function calculateDeductions(grossAmount: number): number {
  const federalTax = grossAmount * 0.2;
  const stateTax = grossAmount * 0.05;
  const insurance = grossAmount * 0.03;
  const retirement = grossAmount * 0.02;
  
  return federalTax + stateTax + insurance + retirement;
}

/**
 * Calculate net pay after deductions
 */
export function calculateNetPay(grossAmount: number): number {
  const deductions = calculateDeductions(grossAmount);
  return grossAmount - deductions;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date and time for display
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get employee full name
 */
export function getEmployeeFullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`;
}

/**
 * Mask account number for display
 */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
}

/**
 * Mask tax ID for display
 */
export function maskTaxId(taxId: string): string {
  if (taxId.length <= 4) return taxId;
  return `***-**-${taxId.slice(-4)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (US)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Validate routing number (US - 9 digits)
 */
export function isValidRoutingNumber(routingNumber: string): boolean {
  return /^\d{9}$/.test(routingNumber);
}

/**
 * Validate account number
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  return /^\d{4,17}$/.test(accountNumber);
}

/**
 * Get status badge color
 */
export function getStatusColor(status: EmployeeStatus | PayrollStatus): string {
  switch (status) {
    case 'ACTIVE':
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
    case 'PROCESSING':
      return 'bg-yellow-100 text-yellow-800';
    case 'INACTIVE':
    case 'ON_LEAVE':
      return 'bg-gray-100 text-gray-800';
    case 'FAILED':
    case 'TERMINATED':
      return 'bg-red-100 text-red-800';
    case 'DRAFT':
      return 'bg-blue-100 text-blue-800';
    case 'PARTIALLY_COMPLETED':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get payment frequency display text
 */
export function getPaymentFrequencyText(frequency: PaymentFrequency): string {
  switch (frequency) {
    case 'WEEKLY':
      return 'Weekly';
    case 'BI_WEEKLY':
      return 'Bi-Weekly';
    case 'SEMI_MONTHLY':
      return 'Semi-Monthly';
    case 'MONTHLY':
      return 'Monthly';
    default:
      return frequency;
  }
}

/**
 * Calculate next payment date based on frequency
 */
export function calculateNextPaymentDate(
  lastPaymentDate: string,
  frequency: PaymentFrequency,
): string {
  const date = new Date(lastPaymentDate);
  
  switch (frequency) {
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'BI_WEEKLY':
      date.setDate(date.getDate() + 14);
      break;
    case 'SEMI_MONTHLY':
      date.setDate(date.getDate() + 15);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
  }
  
  return date.toISOString();
}

/**
 * Generate payment records for selected employees
 */
export function generatePaymentRecords(
  employees: Employee[],
  paymentDate: string,
  payPeriodStart: string,
  payPeriodEnd: string,
): PaymentRecord[] {
  return employees.map((employee) => {
    const grossAmount = calculateGrossPay(
      employee.salary,
      employee.paymentFrequency,
    );
    const deductions = calculateDeductions(grossAmount);
    const netAmount = grossAmount - deductions;

    return {
      id: `payment-${employee.id}-${Date.now()}`,
      employeeId: employee.id,
      employeeName: getEmployeeFullName(employee),
      amount: netAmount,
      grossAmount,
      deductions,
      netAmount,
      status: PaymentStatus.PENDING,
      paymentMethod: 'ACH' as const,
      paymentDate,
      metadata: {
        period: `${formatDate(payPeriodStart)} - ${formatDate(payPeriodEnd)}`,
        deductionDetails: {
          tax: grossAmount * 0.25, // 25% total tax
          insurance: grossAmount * 0.03,
          retirement: grossAmount * 0.02,
          other: 0,
        },
      },
    };
  });
}

/**
 * Calculate payroll run totals
 */
export function calculatePayrollTotals(payments: PaymentRecord[]): {
  totalGrossAmount: number;
  totalDeductions: number;
  totalNetAmount: number;
  totalAmount: number;
} {
  const totals = payments.reduce(
    (acc, payment) => ({
      totalGrossAmount: acc.totalGrossAmount + payment.grossAmount,
      totalDeductions: acc.totalDeductions + payment.deductions,
      totalNetAmount: acc.totalNetAmount + payment.netAmount,
    }),
    { totalGrossAmount: 0, totalDeductions: 0, totalNetAmount: 0 },
  );

  return {
    ...totals,
    totalAmount: totals.totalNetAmount,
  };
}

/**
 * Filter employees by search term
 */
export function filterEmployees(
  employees: Employee[],
  searchTerm: string,
): Employee[] {
  if (!searchTerm) return employees;

  const term = searchTerm.toLowerCase();
  return employees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(term) ||
      employee.lastName.toLowerCase().includes(term) ||
      employee.email.toLowerCase().includes(term) ||
      employee.employeeNumber.toLowerCase().includes(term) ||
      employee.department.toLowerCase().includes(term) ||
      employee.position.toLowerCase().includes(term),
  );
}

/**
 * Sort employees by field
 */
export function sortEmployees(
  employees: Employee[],
  field: keyof Employee,
  direction: 'asc' | 'desc',
): Employee[] {
  return [...employees].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (aValue === undefined || bValue === undefined) return 0;

    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Get payroll run status metadata
 */
export function getPayrollRunMetadata(run: PayrollRun): {
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
} {
  return {
    successfulPayments: run.payments.filter((p) => p.status === 'COMPLETED')
      .length,
    failedPayments: run.payments.filter((p) => p.status === 'FAILED').length,
    pendingPayments: run.payments.filter((p) => p.status === 'PENDING').length,
  };
}

/**
 * Generate unique employee number
 */
export function generateEmployeeNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `EMP${timestamp}${random}`;
}

/**
 * Generate unique payroll run number
 */
export function generatePayrollRunNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `PR${year}${month}${day}${random}`;
}

/**
 * Validate employee form data
 */
export function validateEmployeeData(data: Partial<Employee>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!data.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (!data.department?.trim()) {
    errors.department = 'Department is required';
  }

  if (!data.position?.trim()) {
    errors.position = 'Position is required';
  }

  if (!data.salary || data.salary <= 0) {
    errors.salary = 'Valid salary is required';
  }

  if (data.bankAccount) {
    if (!isValidRoutingNumber(data.bankAccount.routingNumber)) {
      errors.routingNumber = 'Invalid routing number (must be 9 digits)';
    }

    if (!isValidAccountNumber(data.bankAccount.accountNumber)) {
      errors.accountNumber = 'Invalid account number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculate year-to-date payroll from runs
 */
export function calculateYTDPayroll(runs: PayrollRun[]): number {
  const currentYear = new Date().getFullYear();
  return runs
    .filter((run) => {
      const runYear = new Date(run.paymentDate).getFullYear();
      return runYear === currentYear && run.status === 'COMPLETED';
    })
    .reduce((total, run) => total + run.totalAmount, 0);
}

/**
 * Calculate month-to-date payroll from runs
 */
export function calculateMTDPayroll(runs: PayrollRun[]): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return runs
    .filter((run) => {
      const runDate = new Date(run.paymentDate);
      return (
        runDate.getFullYear() === currentYear &&
        runDate.getMonth() === currentMonth &&
        run.status === 'COMPLETED'
      );
    })
    .reduce((total, run) => total + run.totalAmount, 0);
}
