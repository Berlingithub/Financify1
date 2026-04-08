// Quick backend connection test
const http = require('http');

console.log('🧪 Testing Backend Connection...\n');

// Test 1: Check if server is running
const testServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ Server is running! Status: ${res.statusCode}`);
        console.log(`Response: ${data}\n`);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Server is NOT running!');
      console.error('Error:', err.message);
      console.log('\n💡 Please start the backend server first:');
      console.log('   cd server');
      console.log('   npm run dev\n');
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.error('❌ Request timed out (5 seconds)');
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Test 2: Check login endpoint
const testLogin = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    console.log('🔐 Testing login endpoint...');
    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`⏱️  Response time: ${duration}ms`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}\n`);
        
        if (duration > 5000) {
          console.log('⚠️  WARNING: Response took more than 5 seconds!');
          console.log('   This might be causing the timeout issue.\n');
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Login endpoint test failed:', err.message);
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.error('❌ Login request timed out (10 seconds)');
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
};

// Run tests
(async () => {
  try {
    await testServer();
    await testLogin();
    console.log('✅ All tests completed!\n');
  } catch (err) {
    console.log('\n❌ Tests failed. Please fix the issues above.\n');
    process.exit(1);
  }
})();
