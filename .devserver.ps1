$root = "C:\Users\Viktor\Documents\Website RenditeX"
$port = 8888
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"

$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="application/javascript";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".svg"="image/svg+xml";
  ".woff2"="font/woff2"; ".pdf"="application/pdf"; ".json"="application/json"; ".ico"="image/x-icon";
  ".txt"="text/plain"
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $req = $context.Request
    $res = $context.Response
    $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/index.html" }
    if ($path.EndsWith("/")) { $path = $path + "index.html" }
    $fullPath = Join-Path $root ($path -replace "^/","")
    $fullPath = [System.IO.Path]::GetFullPath($fullPath)

    if (-not $fullPath.StartsWith([System.IO.Path]::GetFullPath($root))) {
      $res.StatusCode = 403; $res.Close(); continue
    }

    if (Test-Path $fullPath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($fullPath)
      $res.ContentType = $ct
      $res.Headers.Add("Cache-Control", "no-store, must-revalidate")
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.Close()
  } catch {
    Write-Host "Error: $_"
  }
}
