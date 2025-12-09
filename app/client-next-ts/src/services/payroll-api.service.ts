/**
 * Payroll API Service
 * Production-ready API service for payroll operations
 * Handles all HTTP requests to the backend API
 */

import type { Employee, PayrollRun, PaymentRecord } from '@/types/payroll';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';
const API_VERSION = 'v1';
const PAYROLL_ENDPOINT = `${API_BASE_URL}/${API_VERSION}/payroll`;

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * HTTP Client with timeout and error handling
 */
class HttpClient {
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = REQUEST_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'GET',
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, data: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, data: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await this.fetchWithTimeout(url, {
      ...options,
      method: 'DELETE',
    });
    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson ? await response.json() : { message: response.statusText };
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: errorData.message || 'An error occurred',
          details: errorData,
        },
      };
    }

    const data = isJson ? await response.json() : null;
    return {
      success: true,
      data: data as T,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: response.headers.get('x-request-id') || '',
      },
    };
  }
}

const httpClient = new HttpClient();

/**
 * Payroll API Service
 * All payroll-related API operations
 */
export class PayrollApiService {
  // Employee Operations

  /**
   * Get all employees
   */
  static async getEmployees(): Promise<ApiResponse<Employee[]>> {
    return httpClient.get<Employee[]>(`${PAYROLL_ENDPOINT}/employees`);
  }

  /**
   * Get employee by ID
   */
  static async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    return httpClient.get<Employee>(`${PAYROLL_ENDPOINT}/employees/${id}`);
  }

  /**
   * Create new employee
   */
  static async createEmployee(employee: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return httpClient.post<Employee>(`${PAYROLL_ENDPOINT}/employees`, employee);
  }

  /**
   * Update employee
   */
  static async updateEmployee(id: string, employee: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return httpClient.put<Employee>(`${PAYROLL_ENDPOINT}/employees/${id}`, employee);
  }

  /**
   * Delete employee
   */
  static async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${PAYROLL_ENDPOINT}/employees/${id}`);
  }

  // Payroll Run Operations

  /**
   * Get all payroll runs
   */
  static async getPayrollRuns(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<ApiResponse<PayrollRun[]>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);

    const url = `${PAYROLL_ENDPOINT}/runs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return httpClient.get<PayrollRun[]>(url);
  }

  /**
   * Get payroll run by ID
   */
  static async getPayrollRun(id: string): Promise<ApiResponse<PayrollRun>> {
    return httpClient.get<PayrollRun>(`${PAYROLL_ENDPOINT}/runs/${id}`);
  }

  /**
   * Create payroll run
   */
  static async createPayrollRun(data: {
    employeeIds: string[];
    paymentDate: string;
    payPeriodStart: string;
    payPeriodEnd: string;
  }): Promise<ApiResponse<PayrollRun>> {
    return httpClient.post<PayrollRun>(`${PAYROLL_ENDPOINT}/runs`, data);
  }

  /**
   * Process payroll run
   */
  static async processPayrollRun(id: string): Promise<ApiResponse<PayrollRun>> {
    return httpClient.post<PayrollRun>(`${PAYROLL_ENDPOINT}/runs/${id}/process`, {});
  }

  /**
   * Cancel payroll run
   */
  static async cancelPayrollRun(id: string): Promise<ApiResponse<void>> {
    return httpClient.post<void>(`${PAYROLL_ENDPOINT}/runs/${id}/cancel`, {});
  }

  // Payment Operations

  /**
   * Get payments for a payroll run
   */
  static async getPayments(runId: string): Promise<ApiResponse<PaymentRecord[]>> {
    return httpClient.get<PaymentRecord[]>(`${PAYROLL_ENDPOINT}/runs/${runId}/payments`);
  }

  /**
   * Get payment by ID
   */
  static async getPayment(runId: string, paymentId: string): Promise<ApiResponse<PaymentRecord>> {
    return httpClient.get<PaymentRecord>(`${PAYROLL_ENDPOINT}/runs/${runId}/payments/${paymentId}`);
  }

  // Analytics Operations

  /**
   * Get payroll analytics
   */
  static async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    totalEmployees: number;
    totalPayrollRuns: number;
    totalAmountPaid: number;
    averagePayment: number;
    ytdTotal: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const url = `${PAYROLL_ENDPOINT}/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return httpClient.get(url);
  }

  // Health Check

  /**
   * Check API health
   */
  static async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return httpClient.get(`${API_BASE_URL}/health`);
  }
}

/**
 * Export singleton instance
 */
export default PayrollApiService;
