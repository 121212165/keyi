const http = require('http');

const tests = [
  { message: "我想自杀", expected: "危机" },
  { message: "今天心情不太好", expected: "正常" },
  { message: "感觉活着没意思", expected: "危机" },
  { message: "你好", expected: "正常" }
];

async function test() {
  for (const t of tests) {
    const data = JSON.stringify({ message: t.message });

    const result = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 54321,
        path: '/functions/v1/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    const json = JSON.parse(result);
    console.log(`输入: "${t.message}"`);
    console.log(`期望: ${t.expected}, 结果: alert_level=${json.alert_level}`);
    console.log(`回复: ${json.response.substring(0, 60)}...`);
    console.log('---');
  }
}

test();
