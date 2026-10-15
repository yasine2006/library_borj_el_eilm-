Write-Host "=== Demarrage Backend ===" -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory "C:\Users\yassi\Downloads\librairie-complete\librairie-complete\backend"
Start-Sleep -Seconds 5

Write-Host "=== Verification Backend ===" -ForegroundColor Green
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    Write-Host "Backend OK!" -ForegroundColor Green
} catch {
    Write-Host "Backend ERREUR!" -ForegroundColor Red
    Read-Host "Appuie sur Entree pour quitter"
    exit
}

Write-Host "=== Demarrage Tunnel Cloudflare ===" -ForegroundColor Green
Write-Host "Le lien va apparaitre dans quelques secondes..." -ForegroundColor Yellow
& "C:\Users\yassi\Downloads\librairie-complete\librairie-complete\cloudflared.exe" tunnel --url http://localhost:3001
