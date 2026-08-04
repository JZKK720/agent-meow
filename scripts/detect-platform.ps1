#!/usr/bin/env powershell
# Detect the hardware platform and output the matching profile name.
# Usage:
#   .\scripts\detect-platform.ps1              # prints profile name (k16-strix-halo / r16-hx470-5060 / unknown)
#   .\scripts\detect-platform.ps1 -Json         # outputs JSON with full detection details
#
# Detection signals:
#   - CPU model (AMD Ryzen AI MAX+ 395 → Strix Halo / K16)
#   - CPU model (AMD Ryzen AI 9 HX 470 → HX470 / R16)
#   - dGPU presence (RTX 5060 → R16, no dGPU → K16)
#   - Total RAM (128GB → K16, 32GB → R16)

param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

# ── Detect CPU ──────────────────────────────────────────────────────────────
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$cpuName = $cpu.Name
$cores = $cpu.NumberOfCores
$threads = $cpu.NumberOfLogicalProcessors

# ── Detect system model ─────────────────────────────────────────────────────
$sys = Get-CimInstance Win32_ComputerSystem
$manufacturer = $sys.Manufacturer
$model = $sys.Model

# ── Detect RAM ──────────────────────────────────────────────────────────────
$totalRam = (Get-CimInstance Win32_PhysicalMemory | Measure-Object Capacity -Sum).Sum
$ramGB = [math]::Round($totalRam / 1GB, 0)

# ── Detect GPUs ─────────────────────────────────────────────────────────────
$gpus = Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion
$hasNvidiaDgpu = $false
$dgpuName = ""
foreach ($gpu in $gpus) {
    if ($gpu.Name -match "NVIDIA|RTX|GeForce") {
        $hasNvidiaDgpu = $true
        $dgpuName = $gpu.Name
    }
}

# ── Detect NPU ──────────────────────────────────────────────────────────────
$npu = Get-CimInstance Win32_PnPEntity | Where-Object { $_.DeviceID -match "VEN_1022&DEV_17F0" } | Select-Object -First 1
$hasNpu = $null -ne $npu

# ── Determine platform profile ──────────────────────────────────────────────
$profile = "unknown"
$platformLabel = "Unknown"

if ($cpuName -match "MAX\+?\s*395" -or $cpuName -match "RYZEN AI MAX\+ 395") {
    # AMD Ryzen AI MAX+ 395 = Strix Halo = 灵创K16
    $profile = "k16-strix-halo"
    $platformLabel = "灵创K16 (Strix Halo 395)"
}
elseif ($cpuName -match "HX\s*470" -or $cpuName -match "AI 9 HX 470") {
    # AMD Ryzen AI 9 HX 470 = 橘宝R16
    $profile = "r16-hx470-5060"
    $platformLabel = "橘宝R16 (HX470 + RTX 5060)"
}
elseif ($hasNvidiaDgpu -and $ramGB -le 32) {
    # Fallback: has NVIDIA dGPU + ≤32GB RAM → likely R16
    $profile = "r16-hx470-5060"
    $platformLabel = "橘宝R16 (detected via dGPU + RAM)"
}
elseif ($ramGB -ge 96) {
    # Fallback: ≥96GB RAM → likely K16 (128GB total, 96GB allocatable)
    $profile = "k16-strix-halo"
    $platformLabel = "灵创K16 (detected via RAM ≥96GB)"
}

# ── Output ──────────────────────────────────────────────────────────────────
if ($Json) {
    $result = @{
        profile         = $profile
        label           = $platformLabel
        cpu             = $cpuName
        cores           = $cores
        threads         = $threads
        manufacturer    = $manufacturer
        model           = $model
        ram_gb          = $ramGB
        has_nvidia_dgpu = $hasNvidiaDgpu
        dgpu_name       = $dgpuName
        has_npu         = $hasNpu
    }
    $result | ConvertTo-Json -Depth 3
}
else {
    Write-Output $profile
}