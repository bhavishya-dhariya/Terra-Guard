Write-Host "========== BACKEND ENDPOINT TESTS ==========" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[1] GET /api/health" -ForegroundColor Yellow
try {
    $health = (Invoke-WebRequest -Uri http://localhost:3001/api/health -Method GET).Content | ConvertFrom-Json
    Write-Host "✅ PASS: $health" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 2: Memory Init
Write-Host "`n[2] POST /api/memory/init" -ForegroundColor Yellow
try {
    $memInit = (Invoke-WebRequest -Uri http://localhost:3001/api/memory/init -Method POST -ContentType "application/json" -Body "{}").Content | ConvertFrom-Json
    Write-Host "✅ PASS: Memory status = $($memInit.ok)" -ForegroundColor Green
    Write-Host "   Bank ID: $($memInit.bankId)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 3: Memory Retain
Write-Host "`n[3] POST /api/memory/retain" -ForegroundColor Yellow
try {
    $body = @{
        content = "Test player chose evacuation over shelter"
        type = "experience_fact"
    } | ConvertTo-Json
    $retain = (Invoke-WebRequest -Uri http://localhost:3001/api/memory/retain -Method POST -ContentType "application/json" -Body $body).Content | ConvertFrom-Json
    Write-Host "✅ PASS: Memory retained = $($retain.ok)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 4: Claude Complete
Write-Host "`n[4] POST /api/claude/complete" -ForegroundColor Yellow
try {
    $body = @{
        messages = @(@{ role = "user"; content = "Say hello" })
        system = "You are a friendly assistant"
    } | ConvertTo-Json -Depth 10

    $response = (Invoke-WebRequest -Uri http://localhost:3001/api/claude/complete -Method POST -ContentType "application/json" -Body $body -TimeoutSec 30).Content | ConvertFrom-Json
    $textPreview = if ($response.text) { $response.text.Substring(0, [Math]::Min(100, $response.text.Length)) } else { "No response" }
    Write-Host "✅ PASS: Got response (first 100 chars): $textPreview..." -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 5: Memory Recall
Write-Host "`n[5] POST /api/memory/recall" -ForegroundColor Yellow
try {
    $body = @{
        query = "evacuation decisions"
    } | ConvertTo-Json
    $recall = (Invoke-WebRequest -Uri http://localhost:3001/api/memory/recall -Method POST -ContentType "application/json" -Body $body).Content | ConvertFrom-Json
    Write-Host "✅ PASS: Memory recalled = $($recall.ok)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 6: Memory Reflect
Write-Host "`n[6] POST /api/memory/reflect" -ForegroundColor Yellow
try {
    $body = @{
        query = "What patterns do I show?"
    } | ConvertTo-Json
    $reflect = (Invoke-WebRequest -Uri http://localhost:3001/api/memory/reflect -Method POST -ContentType "application/json" -Body $body).Content | ConvertFrom-Json
    Write-Host "✅ PASS: Memory reflected = $($reflect.ok)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

Write-Host "`n========== TEST SUMMARY ==========" -ForegroundColor Cyan
Write-Host "All basic endpoints tested!" -ForegroundColor GreenWrite-Host "========== BACKEND ENDPOINT TESTS ==========" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[1] GET /api/health" -ForegroundColor Yellow
try {
    $health = (Invoke-WebRequest -Uri http://localhost:3001/api/health -Method GET).Content | ConvertFrom-Json
    Write-Host "✅ PASS: $health" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 2: Memory Init
Write-Host "`n[2] POST /api/memory/init" -ForegroundColor Yellow
try {
    $memInit = (Invoke-WebRequest -Uri http://localhost:3001/api/memory/init -Method POST -ContentType "application/json" -Body "{}").Content | ConvertFrom-Json
    Write-Host "✅ PASS: Memory status = $($memInit.ok)" -ForegroundColor Green
    Write-Host "   Bank ID: $($memInit.bankId)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 3: Memory Retain
Write-Host "`n[3] POST /api/memory/retain" -ForegroundColor Yellow
try {
    $body = @{
        content = "Test player chose evacuation over shelter"
        type = "experience_fact"
    } | ConvertTo-Json
    $retain = (Invoke-WebRequest -Uri http://localhost:3001/api/memory/retain -Method POST -ContentType "application/json" -Body $body).Content | ConvertFrom-Json
    Write-Host "✅ PASS: Memory retained = $($retain.ok)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 4: Claude Complete 
Write-Host "`n[4] POST /api/claude/complete" -ForegroundColor Yellow
try {
    $body = @{
        messages = @(@{ role = "user"; content = "Say hello" })
        system = "You are a friendly assistant"
    } | ConvertTo-Json -Depth 10
    
    $response = (Invoke-WebRequest -Uri http://localhost:3001/api/claude/complete -Method POST -ContentType "application/json" -Body $body -TimeoutSec 30).Content | ConvertFrom-Json
    $textPreview = if ($response.text) { $response.text.Substring(0, [Math]::Min(100, $response.text.Length)) } else { "No response" }
    Write-Host "✅ PASS: Got response (first 100 chars): $textPreview..." -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 5: Memory Recall
Write-Host "`n[5] POST /api/memory/recall" -ForegroundColor Yellow
try {
    $body = @{
        query = "evacuation decisions"
    } | ConvertTo-Json
    $recall = (Invoke-WebRequest -Uri http://localhost:3001/api/memory/recall -Method POST -ContentType "application/json" -Body $body).Content | ConvertFrom-Json
    Write-Host "✅ PASS: Memory recalled = $($recall.ok)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

# Test 6: Memory Reflect
Write-Host "`n[6] POST /api/memory/reflect" -ForegroundColor Yellow
try {
    $body = @{
        query = "What patterns do I show?"
    } | ConvertTo-Json
    $reflect = (Invoke-WebRequest -Uri http://localhost:3001/api/memory/reflect -Method POST -ContentType "application/json" -Body $body).Content | ConvertFrom-Json
    Write-Host "✅ PASS: Memory reflected = $($reflect.ok)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $_" -ForegroundColor Red
}

Write-Host "`n========== TEST SUMMARY ==========" -ForegroundColor Cyan
Write-Host "All basic endpoints tested!" -ForegroundColor Green
