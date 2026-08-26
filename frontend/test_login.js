import http from 'http';

const data = JSON.stringify({
  username: '727723eucd006@skcet.ac.in',  // email of the Arul user that was registered
  password: 'Arul@2005'
});

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/api/auth/signin',
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
  res.on('end', () => {
    const parsed = JSON.parse(body);
    console.log(`USERNAME: ${parsed.username}`);
    console.log(`EMAIL: ${parsed.email}`);
    console.log(`JWT: ${parsed.accessToken ? parsed.accessToken.substring(0, 40) + '...' : 'MISSING'}`);
    console.log(`ROLES: ${JSON.stringify(parsed.roles)}`);
    if (parsed.message) console.log(`ERROR: ${parsed.message}`);
  });
});

req.on('error', error => console.error(`NETWORK ERROR: ${error.message}`));
req.write(data);
req.end();
