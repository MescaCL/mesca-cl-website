import urllib.request
import urllib.error

for path in ['/support', '/privacy', '/admin/now', '/admin/login']:
    try:
        req = urllib.request.Request(f'http://localhost:3000{path}')
        resp = urllib.request.urlopen(req)
        print(f'{path}: {resp.status} {resp.geturl()}')
    except urllib.error.HTTPError as e:
        loc = e.headers.get('Location', '')
        print(f'{path}: {e.code} Location={loc}')
    except Exception as e:
        print(f'{path}: ERROR {e}')