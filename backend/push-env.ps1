$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -match "^([^#=]+)=`"?(.*?)`"?$") {
            $key = $matches[1]
            $val = $matches[2]
            Write-Host "Adding $key..."
            $val | npx vercel env add $key production
        }
    }
}
