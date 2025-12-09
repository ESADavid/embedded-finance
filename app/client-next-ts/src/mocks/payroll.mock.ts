/**
 * Mock Payroll Handlers
 * 
 * MSW handlers for the Owlban Group Payroll API endpoints
 */

import {
  mockEmployees,
  mockPayrollRuns,
  mockPayrollSummary,
  getAllEmployees,
  getEmployeeById,
  getAllPayrollRuns,
  getPayrollRunById,
  getPayrollSummary,
} from './payroll-data';
import {
  EmployeeStatus,
  PayrollStatus,
  PaymentStatus,
  type Employee,
  type PayrollRun,
  type PayrollRunRequest,
  type EmployeeFormData,
} from '@/types/payroll';
import {
  generateEmployeeNumber,
  generatePayrollRunNumber,
  generatePaymentRecords,
  calculatePayrollTotals,
  getPayrollRunMetadata,
} from '@/lib/payroll-utils';

// In-memory storage for mock data (simulates database)
let employees: Employee[] = [...mockEmployees];
let payrollRuns: PayrollRun[] = [...mockPayrollRuns];

/**
 * Reset mock data to initial state
 */
export function resetPayrollMockData() {
  employees = [...mockEmployees];
  payrollRuns = [...mockPayrollRuns];
}

/**
 * Get all employees with optional filtering
 */
export function getMockEmployees(params?: {
  status?: EmployeeStatus[];
  department?: string[];
  search?: string;
}): Employee[] {
  let filtered = [...employees];

  if (params?.status && params.status.length > 0) {
    filtered = filtered.filter((emp) => params.status!.includes(emp.status));
  }

  if (params?.department && params.department.length > 0) {
    filtered = filtered.filter((emp) =>
      params.department!.includes(emp.department),
    );
  }

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (emp) =>
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.employeeNumber.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower) ||
        emp.position.toLowerCase().includes(searchLower),
    );
  }

  return filtered;
}

/**
 * Get employee by ID
 */
export function getMockEmployeeById(id: string): Employee | undefined {
  return employees.find((emp) => emp.id === id);
}

/**
 * Create new employee
 */
export function createMockEmployee(data: EmployeeFormData): Employee {
  const now = new Date().toISOString();
  const newEmployee: Employee = {
    id: `emp-${Date.now()}`,
    employeeNumber: generateEmployeeNumber(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  employees.push(newEmployee);
  return newEmployee;
}

/**
 * Update employee
 */
export function updateMockEmployee(
  id: string,
  data: Partial<EmployeeFormData>,
): Employee | undefined {
  const index = employees.findIndex((emp) => emp.id === id);
  if (index === -1) return undefined;

  const updatedEmployee: Employee = {
    ...employees[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  employees[index] = updatedEmployee;
  return updatedEmployee;
}

/**
 * Delete employee
 */
export function deleteMockEmployee(id: string): boolean {
  const index = employees.findIndex((emp) => emp.id === id);
  if (index === -1) return false;

  employees.splice(index, 1);
  return true;
}

/**
 * Get all payroll runs with optional filtering
 */
export function getMockPayrollRuns(params?: {
  status?: PayrollStatus[];
  dateFrom?: string;
  dateTo?: string;
}): PayrollRun[] {
  let filtered = [...payrollRuns];

  if (params?.status && params.status.length > 0) {
    filtered = filtered.filter((run) => params.status!.includes(run.status));
  }

  if (params?.dateFrom) {
    filtered = filtered.filter(
      (run) => new Date(run.paymentDate) >= new Date(params.dateFrom!),
    );
  }

  if (params?.dateTo) {
    filtered = filtered.filter(
      (run) => new Date(run.paymentDate) <= new Date(params.dateTo!),
    );
  }

  // Sort by payment date descending (most recent first)
  filtered.sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  );

  return filtered;
}

/**
 * Get payroll run by ID
 */
export function getMockPayrollRunById(id: string): PayrollRun | undefined {
  return payrollRuns.find((run) => run.id === id);
}

/**
 * Create and process payroll run
 */
export function createMockPayrollRun(
  request: PayrollRunRequest,
): PayrollRun {
  const now = new Date().toISOString();
  
  // Get selected employees
  const selectedEmployees = employees.filter((emp) =>
    request.employeeIds.includes(emp.id),
  );

  // Generate payment records
  const payments = generatePaymentRecords(
    selectedEmployees,
    request.paymentDate,
    request.payPeriodStart,
    request.payPeriodEnd,
  );

  // Calculate totals
  const totals = calculatePayrollTotals(payments);

  // Create payroll run
  const newRun: PayrollRun = {
    id: `pr-${Date.now()}`,
    runNumber: generatePayrollRunNumber(),
    status: PayrollStatus.PROCESSING,
    payPeriodStart: request.payPeriodStart,
    payPeriodEnd: request.payPeriodEnd,
    paymentDate: request.paymentDate,
    totalEmployees: selectedEmployees.length,
    ...totals,
    payments,
    createdBy: 'admin@owlbangroup.com',
    createdAt: now,
    processedAt: now,
    notes: request.notes,
    metadata: getPayrollRunMetadata({
      payments,
      status: PayrollStatus.PROCESSING,
    } as PayrollRun),
  };

  // Simulate processing - mark as completed after a delay
  setTimeout(() => {
    const runIndex = payrollRuns.findIndex((r) => r.id === newRun.id);
    if (runIndex !== -1) {
      payrollRuns[runIndex].status = PayrollStatus.COMPLETED;
      payrollRuns[runIndex].completedAt = new Date().toISOString();
      payrollRuns[runIndex].payments = payrollRuns[runIndex].payments.map(
        (payment) => ({
          ...payment,
          status: PaymentStatus.COMPLETED,
          transactionId: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          processedAt: new Date().toISOString(),
        }),
      );
      payrollRuns[runIndex].metadata = {
        successfulPayments: payrollRuns[runIndex].payments.length,
        failedPayments: 0,
        pendingPayments: 0,
      };
    }
  }, 2000);

  payrollRuns.unshift(newRun); // Add to beginning of array
  return newRun;
}

/**
 * Get payroll summary
 */
export function getMockPayrollSummary(): typeof mockPayrollSummary {
  const activeEmployees = employees.filter(
    (emp) => emp.status === EmployeeStatus.ACTIVE,
  );
  const inactiveEmployees = employees.filter(
    (emp) => emp.status !== EmployeeStatus.ACTIVE,
  );

  const completedRuns = payrollRuns.filter(
    (run) => run.status === PayrollStatus.COMPLETED,
  );

  const lastRun = completedRuns[0]; // Most recent completed run
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const ytdPayroll = completedRuns
    .filter((run) => new Date(run.paymentDate).getFullYear() === currentYear)
    .reduce((sum, run) => sum + run.totalAmount, 0);

  const mtdPayroll = completedRuns
    .filter((run) => {
      const runDate = new Date(run.paymentDate);
      return (
        runDate.getFullYear() === currentYear &&
        runDate.getMonth() === currentMonth
      );
    })
    .reduce((sum, run) => sum + run.totalAmount, 0);

  return {
    totalEmployees: employees.length,
    activeEmployees: activeEmployees.length,
    inactiveEmployees: inactiveEmployees.length,
    nextPayrollDate: mockPayrollSummary.nextPayrollDate,
    lastPayrollDate: lastRun?.paymentDate,
    lastPayrollAmount: lastRun?.totalAmount,
    upcomingPayrollAmount: mockPayrollSummary.upcomingPayrollAmount,
    monthToDatePayroll: mtdPayroll,
    yearToDatePayroll: ytdPayroll,
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number = 0,
  limit: number = 25,
) {
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    total: items.length,
    page,
    limit,
  };
}

/**
 * Create API success response
 */
export function createApiResponse<T>(data: T, message?: string) {
  return {
    data,
    message,
    success: true,
  };
}

/**
 * Create API error response
 */
export function createApiErrorResponse(message: string, status: number = 400) {
  return {
    error: message,
    success: false,
    status,
  };
}
