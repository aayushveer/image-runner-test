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

function Get-NormalizedUrl {
    param([string]$Url)

    if (-not $Url) { return '' }
    return ($Url.Trim() -replace '/+$', '').ToLowerInvariant()
}

function Get-CanonicalUrlFromHtml {
    param([string]$Html)

    $match = [regex]::Match($Html, '<link\s+rel="canonical"\s+href="([^"]+)"', 'IgnoreCase')
    if (-not $match.Success) { return '' }
    return $match.Groups[1].Value.Trim()
}

function Get-RobotsContentFromHtml {
    param([string]$Html)

    $match = [regex]::Match($Html, '<meta\s+name="robots"\s+content="([^"]+)"', 'IgnoreCase')
    if (-not $match.Success) { return '' }
    return $match.Groups[1].Value.Trim().ToLowerInvariant()
}

function Should-IncludeInSitemap {
    param(
        [System.IO.FileInfo]$File,
        [string]$Html,
        [string]$BaseUrl
    )

    $robots = Get-RobotsContentFromHtml -Html $Html
    if ($robots -match 'noindex') {
        return $false
    }

    $canonical = Get-CanonicalUrlFromHtml -Html $Html
    if (-not $canonical) {
        return $true
    }

    $expectedUrl = if ($File.Name -eq 'index.html') { "$BaseUrl/" } else { "$BaseUrl/$($File.Name)" }
    $canonicalNorm = Get-NormalizedUrl -Url $canonical
    $expectedNorm = Get-NormalizedUrl -Url $expectedUrl

    return $canonicalNorm -eq $expectedNorm
}

$htmlFiles = Get-ChildItem -Path $Root -Filter '*.html' -File |
    Where-Object {
        $_.Name -notmatch '^google.*\.html$'
    }

$indexFile = @()
$otherFiles = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    if (-not (Should-IncludeInSitemap -File $file -Html $content -BaseUrl $baseUrl)) {
        continue
    }

    if ($file.Name -eq 'index.html') {
        $indexFile += $file
    } else {
        $otherFiles += $file
    }
}

$otherFiles = $otherFiles | Sort-Object Name

$ordered = @()
if ($indexFile) { $ordered += $indexFile }
$ordered += $otherFiles

$xmlLines = @()
$xmlLines += '<?xml version="1.0" encoding="UTF-8"?>'
$xmlLines += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

foreach ($file in $ordered) {
    $isIndex = $file.Name -eq 'index.html'
    $loc = if ($isIndex) { "$baseUrl/" } else { "$baseUrl/$($file.Name)" }
    $lastmod = $file.LastWriteTimeUtc.ToString('yyyy-MM-dd')

    $xmlLines += '  <url>'
    $xmlLines += "    <loc>$loc</loc>"
    $xmlLines += "    <lastmod>$lastmod</lastmod>"
    $xmlLines += '  </url>'
}

$xmlLines += '</urlset>'

$outPath = Join-Path $Root $OutputFile
Set-Content -Path $outPath -Value ($xmlLines -join "`n") -Encoding UTF8
Write-Host "Sitemap regenerated: $outPath"
Write-Host "URLs included: $($ordered.Count)"
