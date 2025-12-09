import { describe, it, expect } from 'vitest';
import {
  calculateGrossPay,
  calculateDeductions,
  calculateNetPay,
  formatCurrency,
  formatDate,
  formatPaymentFrequency,
  getEmployeeStatusColor,
  getEmployeeStatusLabel,
  validateEmployeeData,
  generateEmployeeNumber,
  generatePayrollRunNumber,
  calculateYTDPayroll,
  isValidEmail,
  isValidPhone,
  isValidRoutingNumber,
  isValidAccountNumber,
} from './payroll-utils';
import type { PaymentFrequency, Employee, PayrollRun } from '@/types/payroll';

describe('Payroll Calculations', () => {
  describe('calculateGrossPay', () => {
    it('should calculate weekly gross pay correctly', () => {
      const salary = 52000;
      const gross = calculateGrossPay(salary, 'WEEKLY' as PaymentFrequency);
      expect(gross).toBe(1000); // 52000 / 52
    });

    it('should calculate bi-weekly gross pay correctly', () => {
      const salary = 52000;
      const gross = calculateGrossPay(salary, 'BI_WEEKLY' as PaymentFrequency);
      expect(gross).toBe(2000); // 52000 / 26
    });

    it('should calculate semi-monthly gross pay correctly', () => {
      const salary = 48000;
      const gross = calculateGrossPay(salary, 'SEMI_MONTHLY' as PaymentFrequency);
      expect(gross).toBe(2000); // 48000 / 24
    });

    it('should calculate monthly gross pay correctly', () => {
      const salary = 60000;
      const gross = calculateGrossPay(salary, 'MONTHLY' as PaymentFrequency);
      expect(gross).toBe(5000); // 60000 / 12
    });
  });

  describe('calculateDeductions', () => {
    it('should calculate 30% deductions correctly', () => {
      const grossAmount = 2000;
      const deductions = calculateDeductions(grossAmount);
      expect(deductions).toBe(600); // 2000 * 0.30
    });

    it('should handle zero gross amount', () => {
      const deductions = calculateDeductions(0);
      expect(deductions).toBe(0);
    });

    it('should handle large amounts', () => {
      const grossAmount = 10000;
      const deductions = calculateDeductions(grossAmount);
      expect(deductions).toBe(3000); // 10000 * 0.30
    });
  });

  describe('calculateNetPay', () => {
    it('should calculate net pay correctly', () => {
      const grossAmount = 2000;
      const netPay = calculateNetPay(grossAmount);
      expect(netPay).toBe(1400); // 2000 - (2000 * 0.30)
    });

    it('should handle zero gross amount', () => {
      const netPay = calculateNetPay(0);
      expect(netPay).toBe(0);
    });
  });
});

describe('Formatting Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency with dollar sign and decimals', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatPaymentFrequency', () => {
    it('should format weekly correctly', () => {
      expect(formatPaymentFrequency('weekly')).toBe('Weekly');
    });

    it('should format bi-weekly correctly', () => {
      expect(formatPaymentFrequency('bi_weekly')).toBe('Bi-Weekly');
    });

    it('should format semi-monthly correctly', () => {
      expect(formatPaymentFrequency('semi_monthly')).toBe('Semi-Monthly');
    });

    it('should format monthly correctly', () => {
      expect(formatPaymentFrequency('monthly')).toBe('Monthly');
    });

    it('should handle unknown frequency', () => {
      expect(formatPaymentFrequency('unknown' as any)).toBe('unknown');
    });
  });
});

describe('Status Functions', () => {
  describe('getEmployeeStatusColor', () => {
    it('should return green for active status', () => {
      expect(getEmployeeStatusColor('active')).toContain('green');
    });

    it('should return yellow for on_leave status', () => {
      expect(getEmployeeStatusColor('on_leave')).toContain('yellow');
    });

    it('should return red for terminated status', () => {
      expect(getEmployeeStatusColor('terminated')).toContain('red');
    });

    it('should be case insensitive', () => {
      expect(getEmployeeStatusColor('ACTIVE')).toContain('green');
      expect(getEmployeeStatusColor('Active')).toContain('green');
    });
  });

  describe('getEmployeeStatusLabel', () => {
    it('should return proper labels', () => {
      expect(getEmployeeStatusLabel('active')).toBe('Active');
      expect(getEmployeeStatusLabel('on_leave')).toBe('On Leave');
      expect(getEmployeeStatusLabel('terminated')).toBe('Terminated');
    });

    it('should be case insensitive', () => {
      expect(getEmployeeStatusLabel('ACTIVE')).toBe('Active');
    });
  });
});

describe('Validation Functions', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@company.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct US phone numbers', () => {
      expect(isValidPhone('(555) 123-4567')).toBe(true);
      expect(isValidPhone('555-123-4567')).toBe(true);
      expect(isValidPhone('555.123.4567')).toBe(true);
      expect(isValidPhone('5551234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('invalid')).toBe(false);
    });
  });

  describe('isValidRoutingNumber', () => {
    it('should validate 9-digit routing numbers', () => {
      expect(isValidRoutingNumber('123456789')).toBe(true);
      expect(isValidRoutingNumber('987654321')).toBe(true);
    });

    it('should reject invalid routing numbers', () => {
      expect(isValidRoutingNumber('12345678')).toBe(false); // Too short
      expect(isValidRoutingNumber('1234567890')).toBe(false); // Too long
      expect(isValidRoutingNumber('12345678a')).toBe(false); // Contains letter
    });
  });

  describe('isValidAccountNumber', () => {
    it('should validate account numbers between 4-17 digits', () => {
      expect(isValidAccountNumber('1234')).toBe(true);
      expect(isValidAccountNumber('12345678901234567')).toBe(true);
      expect(isValidAccountNumber('1234567890')).toBe(true);
    });

    it('should reject invalid account numbers', () => {
      expect(isValidAccountNumber('123')).toBe(false); // Too short
      expect(isValidAccountNumber('123456789012345678')).toBe(false); // Too long
      expect(isValidAccountNumber('123abc')).toBe(false); // Contains letters
    });
  });

  describe('validateEmployeeData', () => {
    const validEmployee: Partial<Employee> = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      department: 'Engineering',
      position: 'Software Engineer',
      salary: 75000,
    };

    it('should validate correct employee data', () => {
      const result = validateEmployeeData(validEmployee);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should require first name', () => {
      const result = validateEmployeeData({ ...validEmployee, firstName: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
    });

    it('should require last name', () => {
      const result = validateEmployeeData({ ...validEmployee, lastName: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.lastName).toBeDefined();
    });

    it('should require valid email', () => {
      const result = validateEmployeeData({ ...validEmployee, email: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should validate phone format if provided', () => {
      const result = validateEmployeeData({ ...validEmployee, phone: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });

    it('should require department', () => {
      const result = validateEmployeeData({ ...validEmployee, department: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.department).toBeDefined();
    });

    it('should require position', () => {
      const result = validateEmployeeData({ ...validEmployee, position: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.position).toBeDefined();
    });

    it('should require positive salary', () => {
      const result = validateEmployeeData({ ...validEmployee, salary: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors.salary).toBeDefined();
    });

    it('should validate bank account if provided', () => {
      const result = validateEmployeeData({
        ...validEmployee,
        bankAccount: {
          routingNumber: '12345', // Invalid
          accountNumber: '1234567890',
          accountType: 'checking',
          bankName: 'Test Bank',
        },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.routingNumber).toBeDefined();
    });
  });
});

describe('Generator Functions', () => {
  describe('generateEmployeeNumber', () => {
    it('should generate employee number with EMP prefix', () => {
      const empNumber = generateEmployeeNumber();
      expect(empNumber).toMatch(/^EMP\d+$/);
    });

    it('should generate unique numbers', () => {
      const num1 = generateEmployeeNumber();
      const num2 = generateEmployeeNumber();
      expect(num1).not.toBe(num2);
    });
  });

  describe('generatePayrollRunNumber', () => {
    it('should generate payroll run number with PR prefix', () => {
      const runNumber = generatePayrollRunNumber();
      expect(runNumber).toMatch(/^PR\d+$/);
    });

    it('should include date components', () => {
      const runNumber = generatePayrollRunNumber();
      const year = new Date().getFullYear().toString();
      expect(runNumber).toContain(year);
    });
  });
});

describe('Calculation Functions', () => {
  describe('calculateYTDPayroll', () => {
    const currentYear = new Date().getFullYear();
    
    const mockRuns: PayrollRun[] = [
      {
        id: '1',
        runNumber: 'PR001',
        paymentDate: `${currentYear}-01-15`,
        payPeriodStart: `${currentYear}-01-01`,
        payPeriodEnd: `${currentYear}-01-15`,
        status: 'COMPLETED',
        totalAmount: 10000,
        totalGrossAmount: 14285,
        totalDeductions: 4285,
        employeeCount: 5,
        payments: [],
        createdAt: `${currentYear}-01-15`,
        createdBy: 'admin',
      },
      {
        id: '2',
        runNumber: 'PR002',
        paymentDate: `${currentYear}-02-01`,
        payPeriodStart: `${currentYear}-01-16`,
        payPeriodEnd: `${currentYear}-02-01`,
        status: 'COMPLETED',
        totalAmount: 15000,
        totalGrossAmount: 21428,
        totalDeductions: 6428,
        employeeCount: 5,
        payments: [],
        createdAt: `${currentYear}-02-01`,
        createdBy: 'admin',
      },
      {
        id: '3',
        runNumber: 'PR003',
        paymentDate: `${currentYear - 1}-12-15`,
        payPeriodStart: `${currentYear - 1}-12-01`,
        payPeriodEnd: `${currentYear - 1}-12-15`,
        status: 'COMPLETED',
        totalAmount: 12000,
        totalGrossAmount: 17142,
        totalDeductions: 5142,
        employeeCount: 5,
        payments: [],
        createdAt: `${currentYear - 1}-12-15`,
        createdBy: 'admin',
      },
    ];

    it('should calculate YTD payroll for current year only', () => {
      const ytd = calculateYTDPayroll(mockRuns);
      expect(ytd).toBe(25000); // 10000 + 15000 (excludes previous year)
    });

    it('should only include completed runs', () => {
      const runsWithPending = [
        ...mockRuns,
        {
          ...mockRuns[0],
          id: '4',
          status: 'PENDING' as const,
          totalAmount: 5000,
        },
      ];
      const ytd = calculateYTDPayroll(runsWithPending);
      expect(ytd).toBe(25000); // Should not include pending run
    });

    it('should return 0 for empty array', () => {
      const ytd = calculateYTDPayroll([]);
      expect(ytd).toBe(0);
    });
  });
});
