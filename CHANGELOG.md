# Soen Project - Changelog

## Commits Made (20 new commits added)

### Middleware Files Added

1. **health.middleware.js** - Health check endpoint for monitoring service status
2. **error.middleware.js** - Global error handler and custom AppError class
3. **rateLimit.middleware.js** - IP-based rate limiting middleware
4. **requestId.middleware.js** - Request ID middleware for tracing requests
5. **apiResponse.middleware.js** - API response wrapper with success/error methods

### Utility Files Added

1. **validation.util.js** - Email, password validation and input sanitization
2. **response.util.js** - successResponse and errorResponse helper functions
3. **logger.util.js** - info/error/warn/debug logger functions
4. **date.util.js** - formatDate, getTimestamp, isExpired functions
5. **string.util.js** - capitalize, slugify, truncate string functions
6. **asyncHandler.util.js** - Promise wrapper for async route handlers
7. **pagination.util.js** - getPagination, getPaginationResponse helpers
8. **cache.util.js** - In-memory cache with TTL support
9. **file.util.js** - getFileExtension, formatFileSize functions
10. **ip.util.js** - getClientIp, isValidIp functions
11. **url.util.js** - parseQueryParams, buildQueryString functions
12. **number.util.js** - randomInt, clamp, roundTo functions

### Config Files Added

1. **constants.js** - HTTP_STATUS, USER_ROLES, JWT_EXPIRY constants
2. **env.config.js** - Environment variable validator
3. **cors.config.js** - CORS configuration options

---

## Summary

Total of **20 new commits** added to the project, creating:
- 5 middleware files
- 12 utility files  
- 3 config files

All files are located in:
- `Backend/src/middleware/`
- `Backend/src/utils/`
- `Backend/src/config/`

These additions provide a solid infrastructure for the MERN stack application with reusable middleware and utilities.
