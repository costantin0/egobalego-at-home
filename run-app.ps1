# Check if Python is installed
$pyCmd = Get-Command python3 -ErrorAction SilentlyContinue
if (-not $pyCmd) {
    $pyCmd = Get-Command py -ErrorAction SilentlyContinue
    if (-not $pyCmd) {
        Write-Host "Could not find 'py' or 'python3' command, please install Python 3.x: https://www.python.org/downloads/"
        exit 1
    }
}
$pythonExePath = $pyCmd.Source
Write-Host "Using Python from '$pythonExePath'."

# Check if the virtual environment exists, create it if it doesn't
$venvFolderName = ".egovenv"
$venvPath = "$PSScriptRoot\$venvFolderName"
if (!(Test-Path $venvPath)) {
    Write-Host "Virtual environment does not exist. Creating now (please wait)..."
    & $pythonExePath -m venv $venvPath
}
if (!(Test-Path "$venvPath\Scripts\Activate.ps1")) {
    Write-Host "Virtual environment is broken ('$venvFolderName\Scripts\Activate.ps1' not found), recreating (please wait)..."
    & $pythonExePath -m venv $venvPath
}
if (!(Test-Path "$venvPath\Scripts\Activate.ps1")) {
    Write-Host "Could not create virtual environment, please check your Python installation."
    exit 1
}

# Activate the virtual environment
& "$venvPath\Scripts\Activate.ps1"

# Install requirements if they are not already installed (in that case, avoid cluttering the output)
$venvPythonExe = "$venvPath\Scripts\python.exe"
$requirementsFile = "$PSScriptRoot\program\requirements.txt"
& $venvPythonExe -m pip install -r $requirementsFile | find /V "already satisfied"

# Run the Python script with the passed language argument
$lang = If ([string]::IsNullOrEmpty($args[0])) { "en_us" } Else { $args[0] }
# Ensure we run from the repository root so that "-m program" finds the "program" package
Push-Location $PSScriptRoot
& $venvPythonExe -m program.egobalego --open --no-debug --lang $lang
Pop-Location
