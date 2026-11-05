# Test DNS resolution in Android Emulator
Write-Host "Testing DNS resolution in Android Emulator..." -ForegroundColor Cyan

# Try to find ADB
$adbPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ANDROID_HOME\platform-tools\adb.exe",
    "C:\Android\sdk\platform-tools\adb.exe"
)

$adb = $null
foreach ($path in $adbPaths) {
    if (Test-Path $path) {
        $adb = $path
        Write-Host "Found ADB at: $path" -ForegroundColor Green
        break
    }
}

if (-not $adb) {
    Write-Host "ADB not found!" -ForegroundColor Red
    Write-Host "Usually at: %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" -ForegroundColor Yellow
    exit 1
}

# Check devices
Write-Host "`nChecking connected devices..." -ForegroundColor Cyan
& $adb devices

# Test DNS
Write-Host "`nTesting DNS for Supabase..." -ForegroundColor Cyan
$supabaseTest = & $adb shell ping -c 1 rynpdrprbesctvwcrjii.supabase.co 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "DNS resolution working!" -ForegroundColor Green
} else {
    Write-Host "DNS resolution failed!" -ForegroundColor Red
    Write-Host "`nAttempting to fix..." -ForegroundColor Yellow
    
    # Set Google DNS
    & $adb shell setprop net.dns1 8.8.8.8
    & $adb shell setprop net.dns2 8.8.4.4
    & $adb shell settings put global captive_portal_http_url http://www.google.com/generate_204
    & $adb shell settings put global captive_portal_https_url https://www.google.com/generate_204
    
    Write-Host "`nDNS settings updated!" -ForegroundColor Green
    Write-Host "Please restart the emulator (Cold Boot) and test again" -ForegroundColor Yellow
}

Write-Host "`nTesting Google DNS connectivity..." -ForegroundColor Cyan
$googleTest = & $adb shell ping -c 1 8.8.8.8 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Can reach Google DNS!" -ForegroundColor Green
} else {
    Write-Host "Cannot reach Google DNS - emulator has no internet!" -ForegroundColor Red
}
