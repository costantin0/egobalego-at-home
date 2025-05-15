# Changelog

## 1.3

Added
- Local version of the app is shown on the home page, and available server versions will appear in update notifications

Tweaked
- Refactored the folder structure to separate the code from the user data
- Localization files have been split per language and moved to the `program` folder
- Removed default `summon pig 0 0 0` from manual command, replaced with a placeholder
- Logs use colors to highlight warnings and errors
- New events can only be added after the server data finishes loading
- The Poppins font is availabe locally and works offline

Fixed
- Small fixes to the update checker and the golem house variants' names


## 1.2

Added
- Websocket support (to use with the Live Update service from the mod)
- Update notification for when a new release is available

Fixed
- Bug introduced in 1.1 that prevented the last_id.txt file from being loaded correctly


## 1.1

Added dark theme (was bundled with the 0.11.1 version of the mod).


## 1.0

Initial release (was bundled with the 0.9.0 version of the mod).
