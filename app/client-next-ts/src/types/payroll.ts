/**
 * Payroll Types
 * 
 * Type definitions for the Owlban Group Payroll feature
 */

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentFrequency {
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  SEMI_MONTHLY = 'SEMI_MONTHLY',
  MONTHLY = 'MONTHLY',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
}

export interface BankAccount {
  accountNumber: string;
  routingNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  bankName: string;
  accountHolderName: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string; // ISO date string
  terminationDate?: string; // ISO date string
  salary: number; // Annual salary or hourly rate
  paymentFrequency: PaymentFrequency;
  bankAccount: BankAccount;
  taxId?: string; // SSN or Tax ID (masked)
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PaymentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: PaymentStatus;
  transactionId?: string; // Reference to transaction API
  recipientId?: string; // Reference to recipient API
  paymentMethod: 'ACH' | 'WIRE' | 'CHECK';
  paymentDate: string; // ISO date string
  processedAt?: string; // ISO date string
  errorMessage?: string;
  metadata?: {
    period: string;
    hours?: number;
    overtimeHours?: number;
    bonuses?: number;
    deductionDetails?: {
      tax: number;
      insurance: number;
      retirement: number;
      other: number;
    };
  };
}

export interface PayrollRun {
  id: string;
  runNumber: string;
  status: PayrollStatus;
  payPeriodStart: string; // ISO date string
  payPeriodEnd: string; // ISO date string
  paymentDate: string; // ISO date string
  totalEmployees: number;
  totalAmount: number;
  totalGrossAmount: number;
  totalDeductions: number;
  totalNetAmount: number;
  payments: PaymentRecord[];
  createdBy: string;
  createdAt: string; // ISO date string
  processedAt?: string; // ISO date string
  completedAt?: string; // ISO date string
  notes?: string;
  metadata?: {
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
  };
}

export interface PayrollSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  nextPayrollDate: string; // ISO date string
  lastPayrollDate?: string; // ISO date string
  lastPayrollAmount?: number;
  upcomingPayrollAmount?: number;
  monthToDatePayroll: number;
  yearToDatePayroll: number;
}

export interface PayrollRunRequest {
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  employeeIds: string[];
  notes?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  salary: number;
  paymentFrequency: PaymentFrequency;
  bankAccount: BankAccount;
  taxId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// API Response types
export interface PayrollApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PayrollListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Filter and sort types
export interface EmployeeFilters {
  status?: EmployeeStatus[];
  department?: string[];
  employmentType?: EmploymentType[];
  search?: string;
}

export interface PayrollRunFilters {
  status?: PayrollStatus[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
