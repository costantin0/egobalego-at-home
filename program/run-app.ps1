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
Write-Host "Python exe found at '$pythonExePath'."

# Check if the virtual environment exists, create it if it doesn't
$venvFolderName = ".egovenv"
$venvPath = "$PSScriptRoot\..\$venvFolderName"
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

# Install requirements if they are not already installed
& "$venvPath\Scripts\python.exe" -m pip install -r "$PSScriptRoot\requirements.txt"

# Run the Python script with the passed language argument
$script = $PSScriptRoot + "\egobalego.py"
$lang = If ([string]::IsNullOrEmpty($args[0])) { "en_us" } Else { $args[0] }
& $pythonExePath $script --open --no-debug --lang $lang
