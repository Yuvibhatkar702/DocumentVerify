# Browser Console Test Commands

## Copy and paste these commands in your browser console (F12) to test:

### 1. Test Backend Connection:
```javascript
fetch('http://localhost:50011/api/auth/test')
  .then(r => r.json())
  .then(d => console.log('Backend test:', d))
  .catch(e => console.error('Backend error:', e));
```

### 2. Test Registration API:
```javascript
fetch('http://localhost:50011/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Browser Test',
    email: 'browser@test.com',
    password: 'TestPassword123',
    confirmPassword: 'TestPassword123',
    role: 'general',
    termsAccepted: true
  })
})
.then(r => r.json())
.then(d => console.log('Registration test:', d))
.catch(e => console.error('Registration error:', e));
```

## Common Error Messages:

- **"Network Error"** = Backend not running or wrong port
- **"CORS Error"** = Cross-origin request blocked
- **"400 Bad Request"** = Validation error or missing fields
- **"Login failed"** = Usually means registration failed, not login

## Check These:
1. Backend running on port 50011
2. Frontend running on port 3000
3. No browser ad-blockers blocking requests
4. All form fields filled correctly
