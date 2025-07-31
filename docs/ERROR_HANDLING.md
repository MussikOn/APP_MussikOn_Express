# Error Handling Documentation

## Overview
This document describes the error handling strategy implemented in the MussikOn API backend.

## Error Types

### Operational Errors
Operational errors are expected errors that occur during normal operation:
- Validation errors
- Authentication errors
- Authorization errors
- Resource not found errors
- Business logic errors

### Programming Errors
Programming errors are unexpected errors that indicate bugs:
- Syntax errors
- Type errors
- Runtime errors
- Database connection errors

## Error Classes

### AppError
Base error class for all application errors.

### OperationalError
Extends AppError for operational errors with additional context.

## Error Handler Middleware

### Global Error Handler
The global error handler (`errorHandler`) catches all errors and:
- Logs the error with context
- Sends appropriate HTTP status codes
- Returns structured error responses
- Handles different error types appropriately

### Async Handler
The `asyncHandler` wraps async route handlers to:
- Catch unhandled promise rejections
- Pass errors to the global error handler
- Prevent unhandled promise rejections from crashing the server

## Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "status": 400,
    "code": "VALIDATION_ERROR",
    "details": {}
  }
}
```

## Logging

### Structured Logging
All errors are logged with structured information:
- Error message and stack trace
- Request details (URL, method, IP, user agent)
- User context (if authenticated)
- Timestamp
- Request ID for tracing

### Log Levels
- **ERROR**: For all errors that need attention
- **WARN**: For warnings that don't break functionality
- **INFO**: For informational messages
- **DEBUG**: For detailed debugging information

## Recent Fixes

### Date Validation in Analytics Service
**Issue**: `RangeError: Invalid time value` errors occurring in analytics endpoints when processing dates.

**Root Cause**: The analytics service was trying to convert invalid dates to ISO strings without validation.

**Solution**: 
- Added date validation before calling `toISOString()`
- Implemented try-catch blocks around date operations
- Added fallback to current date for invalid dates
- Fixed variable scope issues with `month` variables

**Files Modified**:
- `src/services/analyticsService.ts`

**Code Example**:
```typescript
// Before (causing errors)
const month = new Date(request.createdAt).toISOString().substring(0, 7);

// After (with validation)
let month: string;
try {
  const createdAt = request.createdAt ? new Date(request.createdAt) : new Date();
  if (isNaN(createdAt.getTime())) {
    console.warn('Fecha inválida en request:', request.id, request.createdAt);
    month = new Date().toISOString().substring(0, 7);
  } else {
    month = createdAt.toISOString().substring(0, 7);
  }
} catch (error) {
  console.warn('Error al procesar fecha de request:', request.id, error);
  month = new Date().toISOString().substring(0, 7);
}
```

## Best Practices

### 1. Always Validate Input
- Validate all user inputs
- Check data types and formats
- Handle edge cases

### 2. Use Try-Catch Appropriately
- Wrap operations that might fail
- Provide meaningful error messages
- Log errors with context

### 3. Return Consistent Error Responses
- Use standard error format
- Include appropriate HTTP status codes
- Provide helpful error messages

### 4. Log Errors Properly
- Include request context
- Log at appropriate levels
- Use structured logging

### 5. Handle Async Operations
- Use asyncHandler for route handlers
- Handle promise rejections
- Prevent unhandled rejections

## Common Error Scenarios

### Authentication Errors
- Invalid tokens
- Expired tokens
- Missing authentication headers

### Validation Errors
- Invalid input data
- Missing required fields
- Invalid data formats

### Database Errors
- Connection failures
- Query errors
- Constraint violations

### File Upload Errors
- Invalid file types
- File size limits
- Storage errors

## Monitoring and Alerting

### Error Monitoring
- Monitor error rates
- Track error trends
- Alert on critical errors

### Performance Monitoring
- Monitor response times
- Track resource usage
- Alert on performance issues

## Testing Error Handling

### Unit Tests
- Test error scenarios
- Verify error responses
- Test error logging

### Integration Tests
- Test error handling in real scenarios
- Verify error propagation
- Test error recovery

## Future Improvements

### 1. Enhanced Error Tracking
- Implement error tracking service
- Add error correlation IDs
- Improve error analytics

### 2. Better Error Messages
- Localize error messages
- Provide more helpful guidance
- Add error codes for clients

### 3. Error Recovery
- Implement retry mechanisms
- Add circuit breakers
- Improve fault tolerance

### 4. Monitoring Enhancements
- Add real-time error dashboards
- Implement error alerting
- Add performance metrics 