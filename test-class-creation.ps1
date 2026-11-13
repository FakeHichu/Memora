# Test script for class creation after migration 006
# This verifies the fixed create_class_with_owner() function

Write-Host "=== Memora Class Creation Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Backend is running on port 4000" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend is not running. Please start it with: cd backend; npm run dev" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Testing class creation..." -ForegroundColor Yellow
Write-Host "   Note: You need a valid authentication token" -ForegroundColor Gray
Write-Host ""

# Prompt for auth token
$token = Read-Host "   Enter your authentication token (or press Enter to skip)"

if ($token) {
    Write-Host ""
    Write-Host "3. Creating test class..." -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    $body = @{
        name = "Test Class $(Get-Date -Format 'HHmmss')"
        schoolName = "Test School"
        academicYear = 2024
    } | ConvertTo-Json
    
    try {
        $createResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/classes" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ErrorAction Stop
        
        $result = $createResponse.Content | ConvertFrom-Json
        
        if ($result.ok) {
            Write-Host "   ✓ Class created successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "   Class Details:" -ForegroundColor Cyan
            Write-Host "   - ID: $($result.class.id)" -ForegroundColor White
            Write-Host "   - Name: $($result.class.name)" -ForegroundColor White
            Write-Host "   - Join Code: $($result.class.join_code)" -ForegroundColor White
            Write-Host "   - School: $($result.class.school_name)" -ForegroundColor White
            Write-Host "   - Academic Year: $($result.class.academic_year)" -ForegroundColor White
            Write-Host "   - Status: $($result.class.status)" -ForegroundColor White
            
            # Verify join code format
            if ($result.class.join_code -match '^[A-F0-9]{8}$') {
                Write-Host ""
                Write-Host "   ✓ Join code format is correct (8 uppercase hex characters)" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "   ⚠ Join code format is unexpected: $($result.class.join_code)" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "=== TEST PASSED ===" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Class creation failed: $($result.message)" -ForegroundColor Red
            Write-Host ""
            Write-Host "=== TEST FAILED ===" -ForegroundColor Red
        }
    } catch {
        $errorMessage = $_.Exception.Message
        Write-Host "   ✗ Request failed: $errorMessage" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host ""
            Write-Host "   Error details:" -ForegroundColor Yellow
            Write-Host "   $responseBody" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "=== TEST FAILED ===" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "   Skipped - no token provided" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To get a token:" -ForegroundColor Yellow
    Write-Host "1. Register/login through the mobile app" -ForegroundColor White
    Write-Host "2. Check backend logs for the token" -ForegroundColor White
    Write-Host "3. Or use the Supabase dashboard to get a test JWT" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
