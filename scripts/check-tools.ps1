param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

$htmlFiles = Get-ChildItem -Path $Root -Filter '*.html' -File |
    Where-Object { $_.Name -notmatch '^google.*\.html$' }
$cssFiles = Get-ChildItem -Path (Join-Path $Root 'css') -Filter '*.css' -File -ErrorAction SilentlyContinue
$jsFiles = Get-ChildItem -Path (Join-Path $Root 'js') -Filter '*.js' -File -ErrorAction SilentlyContinue

$issues = New-Object System.Collections.Generic.List[string]

function Normalize-UrlForCompare {
    param([string]$Url)

    if (-not $Url) { return '' }

    $normalized = $Url.Trim()
    $normalized = $normalized -replace '/+$', ''
    return $normalized.ToLowerInvariant()
}

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw

    if ($content -notmatch '<title>') {
        $issues.Add("MISSING <title>: $($file.Name)")
    }
    if ($content -notmatch '<meta\s+name="description"') {
        $issues.Add("MISSING meta description: $($file.Name)")
    }
    if ($content -notmatch '<link\s+rel="canonical"') {
        $issues.Add("MISSING canonical: $($file.Name)")
    }
    if ($content -notmatch '<meta\s+property="og:url"') {
        $issues.Add("MISSING og:url: $($file.Name)")
    }

    $canonicalMatch = [regex]::Match($content, '<link\s+rel="canonical"\s+href="([^"]+)"')
    $ogUrlMatch = [regex]::Match($content, '<meta\s+property="og:url"\s+content="([^"]+)"')

    if ($canonicalMatch.Success) {
        $canonical = $canonicalMatch.Groups[1].Value.Trim()
        if ($canonical -notmatch '^https://') {
            $issues.Add("INVALID canonical (must be https): $($file.Name) => $canonical")
        }
    }

    if ($canonicalMatch.Success -and $ogUrlMatch.Success) {
        $canonicalNorm = Normalize-UrlForCompare $canonicalMatch.Groups[1].Value
        $ogNorm = Normalize-UrlForCompare $ogUrlMatch.Groups[1].Value

        if ($canonicalNorm -ne $ogNorm) {
            $issues.Add("CANONICAL/OG MISMATCH: $($file.Name) => canonical=$($canonicalMatch.Groups[1].Value), og:url=$($ogUrlMatch.Groups[1].Value)")
        }
    }

    $refMatches = [regex]::Matches($content, '(?:href|src)="([^"]+)"')
    foreach ($match in $refMatches) {
        $ref = $match.Groups[1].Value
        if ($ref -match '^(https?:|data:|#|mailto:|tel:|javascript:)') { continue }

        if ($ref.StartsWith('/')) {
            $resolvedPath = Join-Path $Root $ref.TrimStart('/')
        } else {
            $resolvedPath = Join-Path $file.DirectoryName $ref
        }

        if ($ref -match '\.(html|css|js)$') {
            if (-not (Test-Path $resolvedPath)) {
                $issues.Add("BROKEN REF in $($file.Name): $ref")
            }
        }
    }
}

Write-Host "Scanned HTML pages: $($htmlFiles.Count)"
Write-Host "CSS files found: $($cssFiles.Count)"
Write-Host "JS files found: $($jsFiles.Count)"

if ($issues.Count -eq 0) {
    Write-Host 'No broken local refs or critical SEO tag gaps found.' -ForegroundColor Green
} else {
    Write-Host "Issues found: $($issues.Count)" -ForegroundColor Yellow
    $issues | Sort-Object | Get-Unique | ForEach-Object { Write-Host " - $_" }
    exit 1
}
