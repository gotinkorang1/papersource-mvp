Add-Type -AssemblyName System.Drawing

$size = 512
$output = Join-Path (Get-Location) 'public\icons\papersource-logo.png'
$bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function New-RoundedPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$navy = [System.Drawing.Color]::FromArgb(255, 16, 42, 67)
$cream = [System.Drawing.Color]::FromArgb(255, 248, 246, 241)
$ochre = [System.Drawing.Color]::FromArgb(255, 230, 163, 41)
$green = [System.Drawing.Color]::FromArgb(255, 31, 107, 87)
$graphics.Clear($navy)

$inner = New-RoundedPath 48 48 416 416 64
$graphics.FillPath((New-Object System.Drawing.SolidBrush($cream)), $inner)
$graphics.DrawPath((New-Object System.Drawing.Pen($ochre, 20)), $inner)

$font = New-Object System.Drawing.Font('Arial', 154, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$graphics.DrawString('PS', $font, (New-Object System.Drawing.SolidBrush($navy)), (New-Object System.Drawing.RectangleF(0, 103, 512, 240)), $format)

$graphics.FillEllipse((New-Object System.Drawing.SolidBrush($green)), 372, 100, 56, 56)
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$font.Dispose(); $format.Dispose(); $inner.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
Write-Output $output
