# Check if Python is installed
$pythonExists = $(get-command python -ErrorAction SilentlyContinue)
if (-not $pythonExists) {
    Write-Host "Could not find python command, please install Python 3.x: https://www.python.org/downloads/"
    exit 1
}

# Check if the virtual environment exists, create it if it doesn't
$venv = $PSScriptRoot + "\.venv"
if (!(Test-Path $venv)) {
    Write-Host "Virtual environment does not exist. Creating now (please wait)."
    py -m venv $venv
}

# Activate the virtual environment
& "$venv\Scripts\Activate.ps1"

# Install requirements if they are not already installed
pip install -r "$PSScriptRoot\requirements.txt"

# Run the Python script with the passed language argument
$script = $PSScriptRoot + "\egobalego.py"
$lang = $args[0]
py $script --open --no-debug --lang $lang
