$BASE = "http://localhost:3111"
for ($i = 0; $i -lt 20; $i++) {
  try {
    $resp = Invoke-WebRequest -Uri "$BASE/" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "server up (attempt $i)" -ForegroundColor Green
    break
  } catch {
    Start-Sleep -Seconds 1
  }
}
