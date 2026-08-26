import http from 'http';

const data = JSON.stringify({
  username: 'Arul',
  email: '727723eucd006@skcet.ac.in',
  password: 'Arul@2005',
  role: ['user']
});

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  console.log(`STATUS_CODE: ${res.statusCode}`);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(`RESPONSE_BODY: ${body}`));
});

req.on('error', error => console.error(`ERROR: ${error.message}`));
req.write(data);
req.end();
