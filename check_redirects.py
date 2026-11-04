import http.client

conn = http.client.HTTPConnection('localhost', 3000, timeout=10)

for path in ['/admin/now', '/admin/login', '/admin/settings', '/admin/projects']:
    conn.request('GET', path)
    resp = conn.getresponse()
    body = resp.read(500)
    location = resp.getheader('Location', '')
    print(f'{path}: {resp.status} Location={location} Body-preview={body[:100]}')

conn.close()