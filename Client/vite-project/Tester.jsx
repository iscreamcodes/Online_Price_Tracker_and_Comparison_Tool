// Test the login endpoint directly
fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      User_email: 'bev@gmail',
      User_password: 'your_password'
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('🔍 LOGIN RESPONSE:');
    console.log('User data:', data.user);
    console.log('Has User_preferences:', !!data.user?.User_preferences);
  })
  .catch(console.error);