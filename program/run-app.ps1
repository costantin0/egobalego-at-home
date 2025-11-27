# Check if Python is installed
$pythonExists = $(get-command py -ErrorAction SilentlyContinue)
if (-not $pythonExists) {
    Write-Host "Could not find 'py' command, please install Python 3.x: https://www.python.org/downloads/"
    exit 1
}

# Check if the virtual environment exists, create it if it doesn't
$venvPath = "$PSScriptRoot\..\.venv"
if (!(Test-Path $venvPath)) {
    Write-Host "Virtual environment does not exist. Creating now (please wait)..."
    py -m venv $venvPath
}
if (!(Test-Path "$venvPath\Scripts\Activate.ps1")) {
    Write-Host "Virtual environment is broken ('.\venv\Scripts\Activate.ps1' not found), recreating (please wait)..."
    py -m venv $venvPath
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
py $script --open --no-debug --lang $lang
