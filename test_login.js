const fetch = require('node-fetch');
(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'newsAdmin', password: 'password123' })
    });
    const data = await res.json();
    console.log('Status', res.status);
    console.log(data);
  } catch (err) {
    console.error('Error', err);
  }
})();
