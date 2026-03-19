param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [string]$OutputFile = 'sitemap.xml'
)

$ErrorActionPreference = 'Stop'

$domainFile = Join-Path $Root 'CNAME'
$domain = 'www.imgrunner.com'
if (Test-Path $domainFile) {
    $raw = (Get-Content $domainFile -Raw).Trim()
    if ($raw) { $domain = $raw }
}
$baseUrl = "https://$domain"

$htmlFiles = Get-ChildItem -Path $Root -Filter '*.html' -File |
    Where-Object {
        $_.Name -notmatch '^google.*\.html$'
    }

$indexFile = $htmlFiles | Where-Object { $_.Name -eq 'index.html' }
$otherFiles = $htmlFiles | Where-Object { $_.Name -ne 'index.html' } | Sort-Object Name

$ordered = @()
if ($indexFile) { $ordered += $indexFile }
$ordered += $otherFiles

$today = (Get-Date).ToString('yyyy-MM-dd')

$xmlLines = @()
$xmlLines += '<?xml version="1.0" encoding="UTF-8"?>'
$xmlLines += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

foreach ($file in $ordered) {
    $isIndex = $file.Name -eq 'index.html'
    $loc = if ($isIndex) { "$baseUrl/" } else { "$baseUrl/$($file.Name)" }
    $priority = if ($isIndex) { '1.0' } else { '0.8' }
    $changefreq = if ($isIndex) { 'daily' } else { 'weekly' }

    $xmlLines += '  <url>'
    $xmlLines += "    <loc>$loc</loc>"
    $xmlLines += "    <lastmod>$today</lastmod>"
    $xmlLines += "    <changefreq>$changefreq</changefreq>"
    $xmlLines += "    <priority>$priority</priority>"
    $xmlLines += '  </url>'
}

$xmlLines += '</urlset>'

$outPath = Join-Path $Root $OutputFile
Set-Content -Path $outPath -Value ($xmlLines -join "`n") -Encoding UTF8
Write-Host "Sitemap regenerated: $outPath"
Write-Host "URLs included: $($ordered.Count)"
