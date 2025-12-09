# Owlban Group Payroll - API Specification

**Version:** 1.0.0
**Base URL:** `https://api.example.com/v1`
**Protocol:** HTTPS
**Authentication:** Bearer Token + API Key

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Common Headers](#common-headers)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Employee Endpoints](#employee-endpoints)
6. [Payroll Run Endpoints](#payroll-run-endpoints)
7. [Payment Endpoints](#payment-endpoints)
8. [Analytics Endpoints](#analytics-endpoints)
9. [Rate Limiting](#rate-limiting)
10. [Webhooks](#webhooks)

---

## 🔐 Authentication

All API requests require authentication using Bearer tokens and API keys.

### Headers Required

```http
Authorization: Bearer <access_token>
X-API-Key: <api_key>
Content-Type: application/json
Accept: application/json
```

### Getting Access Token

```http
POST /auth/token
Content-Type: application/json

{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "client_credentials"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## 📤 Common Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token for authentication |
| `X-API-Key` | Yes | API key for your application |
| `Content-Type` | Yes | Must be `application/json` |
| `Accept` | Yes | Must be `application/json` |
| `X-Request-ID` | No | Unique identifier for request tracking |
| `X-Idempotency-Key` | No | For idempotent operations |

### Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-ID` | Echo of request ID or generated ID |
| `X-RateLimit-Limit` | Total requests allowed per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123456",
    "version": "1.0.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid employee data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123456"
  }
}
```

---

## ❌ Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 👥 Employee Endpoints

### List Employees

```http
GET /payroll/employees
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 50, max: 100) |
| `status` | string | No | Filter by status: `active`, `on_leave`, `terminated` |
| `department` | string | No | Filter by department |
| `search` | string | No | Search by name or email |

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "emp_123456",
        "employeeNumber": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "phone": "(555) 123-4567",
        "department": "Engineering",
        "position": "Software Engineer",
        "salary": 75000,
        "paymentFrequency": "BI_WEEKLY",
        "employmentType": "FULL_TIME",
        "status": "ACTIVE",
        "hireDate": "2023-01-15",
        "taxId": "***-**-1234",
        "bankAccount": {
          "accountNumber": "****5678",
          "routingNumber": "123456789",
          "accountType": "CHECKING",
          "bankName": "Chase Bank"
        },
        "createdAt": "2023-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### Get Employee

```http
GET /payroll/employees/:id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Employee ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "emp_123456",
    "employeeNumber": "EMP001",
    // ... full employee object
  }
}
```

### Create Employee

```http
POST /payroll/employees
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "phone": "(555) 987-6543",
  "department": "Marketing",
  "position": "Marketing Manager",
  "salary": 85000,
  "paymentFrequency": "BI_WEEKLY",
  "employmentType": "FULL_TIME",
  "status": "ACTIVE",
  "hireDate": "2024-01-15",
  "taxId": "123-45-6789",
  "bankAccount": {
    "accountNumber": "9876543210",
    "routingNumber": "987654321",
    "accountType": "CHECKING",
    "bankName": "Bank of America"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "emp_789012",
    "employeeNumber": "EMP150",
    // ... full employee object
  }
}
```

### Update Employee

```http
PUT /payroll/employees/:id
```

**Request Body:** (partial update supported)
```json
{
  "salary": 90000,
  "position": "Senior Marketing Manager"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "emp_789012",
    // ... updated employee object
  }
}
```

### Delete Employee

```http
DELETE /payroll/employees/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "emp_789012",
    "deleted": true
  }
}
```

---

## 💰 Payroll Run Endpoints

### List Payroll Runs

```http
GET /payroll/runs
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number |
| `limit` | integer | No | Items per page |
| `status` | string | No | Filter by status |
| `startDate` | string | No | Filter by date (ISO 8601) |
| `endDate` | string | No | Filter by date (ISO 8601) |

**Response:**
```json
{
  "success": true,
  "data": {
    "runs": [
      {
        "id": "run_123456",
        "runNumber": "PR20240115001",
        "paymentDate": "2024-01-15",
        "payPeriodStart": "2024-01-01",
        "payPeriodEnd": "2024-01-15",
        "status": "COMPLETED",
        "totalAmount": 125000.00,
        "totalGrossAmount": 178571.43,
        "totalDeductions": 53571.43,
        "employeeCount": 50,
        "createdAt": "2024-01-15T08:00:00Z",
        "processedAt": "2024-01-15T09:00:00Z",
        "createdBy": "user_123"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

### Get Payroll Run

```http
GET /payroll/runs/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "run_123456",
    "runNumber": "PR20240115001",
    // ... full run object with payments array
    "payments": [
      {
        "id": "pay_123",
        "employeeId": "emp_123",
        "employeeName": "John Doe",
        "grossAmount": 3571.43,
        "deductions": 1071.43,
        "netAmount": 2500.00,
        "status": "COMPLETED"
      }
    ]
  }
}
```

### Create Payroll Run

```http
POST /payroll/runs
```

**Request Body:**
```json
{
  "employeeIds": ["emp_123", "emp_456", "emp_789"],
  "paymentDate": "2024-01-31",
  "payPeriodStart": "2024-01-16",
  "payPeriodEnd": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "run_789012",
    "runNumber": "PR20240131001",
    "status": "PENDING",
    // ... full run object
  }
}
```

### Process Payroll Run

```http
POST /payroll/runs/:id/process
```

**Request Body:**
```json
{
  "confirmProcessing": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "run_789012",
    "status": "PROCESSING",
    "processedAt": "2024-01-31T10:00:00Z"
  }
}
```

### Cancel Payroll Run

```http
POST /payroll/runs/:id/cancel
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "run_789012",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-31T10:30:00Z"
  }
}
```

---

## 💳 Payment Endpoints

### List Payments

```http
GET /payroll/runs/:runId/payments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "pay_123456",
        "runId": "run_123",
        "employeeId": "emp_123",
        "employeeName": "John Doe",
        "grossAmount": 3571.43,
        "deductions": 1071.43,
        "netAmount": 2500.00,
        "status": "COMPLETED",
        "paymentMethod": "DIRECT_DEPOSIT",
        "processedAt": "2024-01-15T09:00:00Z"
      }
    ]
  }
}
```

### Get Payment

```http
GET /payroll/runs/:runId/payments/:paymentId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pay_123456",
    // ... full payment object with breakdown
    "breakdown": {
      "baseSalary": 3571.43,
      "federalTax": 714.29,
      "stateTax": 214.29,
      "socialSecurity": 142.86,
      "netPay": 2500.00
    }
  }
}
```

---

## 📊 Analytics Endpoints

### Get Analytics

```http
GET /payroll/analytics
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Start date (ISO 8601) |
| `endDate` | string | No | End date (ISO 8601) |
| `groupBy` | string | No | Group by: `month`, `quarter`, `year` |

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 150,
    "activeEmployees": 145,
    "totalPayrollRuns": 24,
    "totalAmountPaid": 3000000.00,
    "averagePayment": 2000.00,
    "ytdTotal": 3000000.00,
    "monthlyBreakdown": [
      {
        "month": "2024-01",
        "runs": 2,
        "amount": 250000.00,
        "employees": 145
      }
    ]
  }
}
```

---

## ⏱️ Rate Limiting

### Limits

- **Per User:** 100 requests per minute
- **Per Organization:** 1000 requests per hour
- **Burst:** 20 requests per second

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 🔔 Webhooks

### Webhook Events

Subscribe to these events:

| Event | Description |
|-------|-------------|
| `employee.created` | New employee added |
| `employee.updated` | Employee information updated |
| `employee.deleted` | Employee removed |
| `payroll.run.created` | New payroll run created |
| `payroll.run.processing` | Payroll run started processing |
| `payroll.run.completed` | Payroll run completed |
| `payroll.run.failed` | Payroll run failed |
| `payment.completed` | Individual payment completed |
| `payment.failed` | Individual payment failed |

### Webhook Payload

```json
{
  "event": "payroll.run.completed",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "id": "run_123456",
    "runNumber": "PR20240115001",
    "status": "COMPLETED",
    "totalAmount": 125000.00,
    "employeeCount": 50
  },
  "signature": "sha256=..."
}
```

### Webhook Signature Verification

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

## 📝 Notes

### Idempotency

Use `X-Idempotency-Key` header for POST/PUT requests to prevent duplicate operations:

```http
POST /payroll/runs
X-Idempotency-Key: unique-key-123
```

### Pagination

All list endpoints support pagination:
- Default page size: 50
- Maximum page size: 100
- Use `page` and `limit` query parameters

### Filtering

Most list endpoints support filtering via query parameters. Combine multiple filters with `&`.

### Sorting

Use `sort` query parameter:
```
?sort=createdAt:desc
?sort=name:asc
```

### Field Selection

Use `fields` query parameter to select specific fields:
```
?fields=id,name,email
```

---

## 🔒 Security Best Practices

1. **Always use HTTPS**
2. **Rotate API keys regularly**
3. **Store credentials securely**
4. **Implement request signing**
5. **Validate webhook signatures**
6. **Use rate limiting**
7. **Log all API requests**
8. **Monitor for suspicious activity**

---

## 📞 Support

**API Support:** api-support@example.com
**Documentation:** https://docs.example.com/api
**Status Page:** https://status.example.com

---

**API Version:** 1.0.0
**Last Updated:** 2024
**Changelog:** https://docs.example.com/api/changelog
