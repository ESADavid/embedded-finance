# Owlban Group Payroll - Production Deployment Guide

**Version:** 1.0.0
**Last Updated:** 2024
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Backend API Requirements](#backend-api-requirements)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedure](#rollback-procedure)
9. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Deployment Checklist

### Code Quality
- [ ] All unit tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] All features tested manually
- [ ] Performance benchmarks met

### Security
- [ ] Environment variables configured
- [ ] API keys secured (not in code)
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Authentication implemented
- [ ] Authorization rules defined
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS protection enabled

### Documentation
- [ ] API documentation complete
- [ ] User guide updated
- [ ] Admin guide created
- [ ] Deployment runbook ready
- [ ] Incident response plan documented

### Infrastructure
- [ ] Production environment provisioned
- [ ] Database configured and backed up
- [ ] CDN configured (if applicable)
- [ ] Load balancer configured
- [ ] SSL certificates installed
- [ ] Monitoring tools configured
- [ ] Logging infrastructure ready
- [ ] Backup strategy implemented

---

## ⚙️ Environment Configuration

### Environment Files

Three environment files are provided:

1. **`.env.development`** - Local development (uses MSW mocks)
2. **`.env.staging`** - Staging environment
3. **`.env.production`** - Production environment

### Production Environment Variables

Edit `.env.production` with your actual values:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.yourcompany.com
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_PAYROLL=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_EXPORT=false

# Authentication
VITE_AUTH_ENABLED=true
VITE_AUTH_PROVIDER=oauth2

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X

# Environment
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

### Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env.production` to version control
- Use environment variable management tools (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate API keys regularly
- Use different keys for each environment

---

## 🏗️ Build Process

### 1. Install Dependencies

```bash
cd app/client-next-ts
npm install --production
```

### 2. Run Tests

```bash
npm test
```

Ensure all tests pass before proceeding.

### 3. Build for Production

```bash
npm run build -- --mode production
```

This will:
- Use `.env.production` configuration
- Minify and optimize code
- Generate source maps
- Create production bundle in `dist/` directory

### 4. Verify Build

```bash
npm run preview
```

Test the production build locally before deploying.

### 5. Build Output

The `dist/` directory will contain:
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
├── index.html
└── [other static files]
```

---

## 🔌 Backend API Requirements

### Required Endpoints

The payroll system requires the following API endpoints:

#### Employee Endpoints

```
GET    /api/v1/payroll/employees
POST   /api/v1/payroll/employees
GET    /api/v1/payroll/employees/:id
PUT    /api/v1/payroll/employees/:id
DELETE /api/v1/payroll/employees/:id
```

#### Payroll Run Endpoints

```
GET    /api/v1/payroll/runs
POST   /api/v1/payroll/runs
GET    /api/v1/payroll/runs/:id
POST   /api/v1/payroll/runs/:id/process
POST   /api/v1/payroll/runs/:id/cancel
```

#### Payment Endpoints

```
GET    /api/v1/payroll/runs/:runId/payments
GET    /api/v1/payroll/runs/:runId/payments/:paymentId
```

#### Analytics Endpoints

```
GET    /api/v1/payroll/analytics
```

### API Response Format

All endpoints should return responses in this format:

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123456"
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid employee data",
    "details": { ... }
  }
}
```

### Authentication

API requests should include authentication headers:

```
Authorization: Bearer <access_token>
X-API-Key: <api_key>
```

### Rate Limiting

Recommended rate limits:
- 100 requests per minute per user
- 1000 requests per hour per organization

---

## 🚀 Deployment Steps

### Option 1: AWS S3 + CloudFront

```bash
# 1. Build the application
npm run build -- --mode production

# 2. Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Option 2: Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

### Option 3: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build
npm run build -- --mode production

# 3. Deploy
netlify deploy --prod --dir=dist
```

### Option 4: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --mode production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and deploy
docker build -t payroll-app:1.0.0 .
docker push your-registry/payroll-app:1.0.0
```

### Option 5: Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payroll-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payroll
  template:
    metadata:
      labels:
        app: payroll
    spec:
      containers:
      - name: payroll
        image: your-registry/payroll-app:1.0.0
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: payroll-config
              key: api-url
```

```bash
kubectl apply -f deployment.yaml
```

---

## ✅ Post-Deployment Verification

### 1. Smoke Tests

Run these tests immediately after deployment:

```bash
# Health check
curl https://your-domain.com/health

# API connectivity
curl https://your-domain.com/api/v1/payroll/employees \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Manual Testing

Follow the testing guide:
1. Open `PAYROLL_TESTING_GUIDE.md`
2. Execute all 7 critical-path tests
3. Verify all tests pass

### 3. Performance Checks

- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] API response time < 500ms

### 4. Security Checks

- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No sensitive data in console
- [ ] Authentication working
- [ ] Authorization rules enforced

### 5. Monitoring Checks

- [ ] Application logs flowing
- [ ] Error tracking active
- [ ] Performance metrics collecting
- [ ] Alerts configured

---

## 📊 Monitoring & Maintenance

### Application Monitoring

**Recommended Tools:**
- **Sentry** - Error tracking
- **DataDog** - APM and infrastructure monitoring
- **Google Analytics** - User analytics
- **LogRocket** - Session replay

### Key Metrics to Monitor

1. **Performance Metrics:**
   - Page load time
   - API response time
   - Time to Interactive
   - Core Web Vitals

2. **Error Metrics:**
   - Error rate
   - Error types
   - Affected users
   - Error trends

3. **Business Metrics:**
   - Active users
   - Payroll runs processed
   - Employees managed
   - Feature usage

4. **Infrastructure Metrics:**
   - CPU usage
   - Memory usage
   - Network traffic
   - Disk I/O

### Alerts Configuration

Set up alerts for:
- Error rate > 1%
- API response time > 1000ms
- Page load time > 5 seconds
- Server errors (5xx)
- High memory usage (> 80%)

### Maintenance Schedule

**Daily:**
- Review error logs
- Check performance metrics
- Monitor user feedback

**Weekly:**
- Review analytics
- Update dependencies
- Security patches

**Monthly:**
- Performance optimization
- Feature usage analysis
- Capacity planning

---

## 🔄 Rollback Procedure

### Quick Rollback

If issues are detected post-deployment:

#### AWS S3 + CloudFront
```bash
# Restore previous version
aws s3 sync s3://your-bucket-name-backup/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

#### Vercel
```bash
vercel rollback
```

#### Kubernetes
```bash
kubectl rollout undo deployment/payroll-app
```

### Rollback Checklist

- [ ] Identify the issue
- [ ] Notify stakeholders
- [ ] Execute rollback
- [ ] Verify rollback successful
- [ ] Monitor for stability
- [ ] Document incident
- [ ] Plan fix for next deployment

---

## 🔧 Troubleshooting

### Common Issues

#### 1. API Connection Errors

**Symptoms:** "Failed to fetch" errors

**Solutions:**
- Check `VITE_API_BASE_URL` in `.env.production`
- Verify CORS configuration on backend
- Check network connectivity
- Verify SSL certificates

#### 2. Authentication Failures

**Symptoms:** 401 Unauthorized errors

**Solutions:**
- Verify auth tokens are being sent
- Check token expiration
- Verify auth provider configuration
- Check API key validity

#### 3. Slow Performance

**Symptoms:** Long load times

**Solutions:**
- Enable CDN
- Optimize bundle size
- Enable compression (gzip/brotli)
- Implement code splitting
- Add caching headers

#### 4. Build Failures

**Symptoms:** Build process fails

**Solutions:**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

### Debug Mode

Enable debug mode in production (temporarily):

```bash
# Add to .env.production
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Support Contacts

- **Technical Lead:** [email]
- **DevOps Team:** [email]
- **On-Call:** [phone/pager]

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Environment variables configured
- [ ] Backup created
- [ ] Stakeholders notified
- [ ] Maintenance window scheduled

### Deployment
- [ ] Build successful
- [ ] Deployed to staging first
- [ ] Staging tests passed
- [ ] Deployed to production
- [ ] DNS updated (if needed)
- [ ] CDN cache cleared

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Manual tests passed
- [ ] Performance verified
- [ ] Monitoring active
- [ ] No critical errors
- [ ] Stakeholders notified
- [ ] Documentation updated

---

## 🎉 Success Criteria

Deployment is considered successful when:

✅ All smoke tests pass
✅ No critical errors in logs
✅ Performance metrics within acceptable range
✅ All features functional
✅ Monitoring and alerts active
✅ No user-reported issues within 24 hours

---

## 📞 Emergency Contacts

**Production Issues:**
- On-Call Engineer: [phone]
- DevOps Lead: [phone]
- CTO: [phone]

**Escalation Path:**
1. On-Call Engineer (immediate)
2. DevOps Lead (15 minutes)
3. CTO (30 minutes)

---

**Document Version:** 1.0.0
**Last Review:** 2024
**Next Review:** Quarterly

---

**Deployment Status:** ✅ Ready for Production
