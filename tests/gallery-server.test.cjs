const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
const { createGalleryServer } = require('../server.js');

test('gallery serves its page and rejects internal files and foreign hosts', async () => {
  const server = createGalleryServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const request = (path, host = '127.0.0.1') => new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port: server.address().port, path, headers: { Host: host } }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body }));
    }).on('error', reject);
  });
  try {
    assert.equal((await request('/')).status, 200);
    assert.equal((await request('/index.html?view=styles')).status, 200);
    for (const file of ['/builder/package.json', '/builder/data/config.json', '/.git/HEAD', '/../README.md', '/%2e%2e/README.md']) {
      assert.equal((await request(file)).status, 404, file);
    }
    assert.equal((await request('/', 'external.example')).status, 403);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
