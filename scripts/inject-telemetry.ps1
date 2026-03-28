$marker = '<!-- Global Telemetry -->'
$files = Get-ChildItem -Recurse -File -Filter *.html | Where-Object { $_.FullName -notmatch '\\node_modules\\' }
$updated = 0

foreach ($f in $files) {
  $content = Get-Content -Path $f.FullName -Raw
  if ($content -match [regex]::Escape($marker)) { continue }
  if ($content -notmatch '</head>') { continue }

  $rel = Resolve-Path -LiteralPath $f.DirectoryName -Relative
  if ($rel -eq '.') {
    $configPath = 'js/site-config.js'
    $telemetryPath = 'js/global-telemetry.js'
  }
  else {
    $depth = ($rel -split '[\\/]').Count
    $prefix = ('../' * $depth)
    $configPath = $prefix + 'js/site-config.js'
    $telemetryPath = $prefix + 'js/global-telemetry.js'
  }

  $injection = "`r`n    {0}`r`n    <script src=\"\"{1}\"\"></script>`r`n    <script src=\"\"{2}\"\"></script>`r`n" -f $marker, $configPath, $telemetryPath
  $content = $content -replace '</head>', ($injection + '</head>')
  Set-Content -Path $f.FullName -Value $content -Encoding UTF8
  $updated++
}

Write-Output "UPDATED_HTML=$updated"
