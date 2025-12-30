"""Various utility functions"""

import os, json, requests
from egoconfig import AppData, Consts
import egovalidate as validate


def load_server_data():
    """Loads the server data file in memory"""
    try:
        with open(Consts.FILE_SERVER_DATA, 'r') as f:
            data = f.read()
            AppData.server_data = json.loads(data)
    except FileNotFoundError:
        print_warning(f"Could not find the file '{Consts.FILE_SERVER_DATA}', it will be created the first time you add something.")
    except Exception as e:
        print_error(f"Server data could not be loaded and was reset (your changes will apply on the next edit). Exception:\n{e}")


def update_server_data(received_data):
    """Updates the server data (both memory and file) with the received data"""
    if received_data is not None:
        if "add" in received_data.keys():
            add_server_data(received_data["add"])
        if "remove" in received_data.keys():
            remove_server_data(received_data["remove"])
        update_database()
    else:
        print_error("Error: no data received from the client!")


def add_server_data(items_to_add):
    """Adds new items to the server data"""
    for new_item in items_to_add:
        found = False
        if len(AppData.server_data) == 0:
            AppData.last_id += 1
            AppData.server_data.append(new_item)
        else:
            for existing_item in AppData.server_data:
                if existing_item["id"] == new_item["id"]:
                    found = True
                    break
            if found:
                AppData.server_data.remove(existing_item)
                AppData.server_data.append(new_item)
            else:
                AppData.last_id += 1
                AppData.server_data.append(new_item)


def remove_server_data(items_to_remove):
    """Removes the specified items from the server data"""
    for new_object in items_to_remove:
        for object in AppData.server_data:
            if object["id"] == new_object["id"]:
                AppData.server_data.remove(object)


def update_database():
    """Overwrites the server data and last id files with the values in memory"""
    with open(Consts.FILE_LAST_ID, 'w') as f:
        f.write(str(AppData.last_id))
    with open(Consts.FILE_SERVER_DATA, 'w') as f:
        json.dump(AppData.server_data, f, indent=4)


def update_color_theme():
    """Overwrites the color theme file with the value in memory"""
    with open(Consts.FILE_COLOR_THEME, 'w') as f:
        f.write(AppData.color_theme)


def load_translations():
    """Loads the translations file in memory"""
    # Essential function, must crash the program if both the specified and default files cannot be loaded
    translations_file = os.path.join(Consts.FOLDER_TRANSLATIONS, f"{AppData.lang}.json")
    try:
        with open(translations_file, 'r', encoding='utf-8') as f:
            AppData.translations = json.load(f)
        print_info(f"Language set to '{AppData.lang}'.")
    except FileNotFoundError:
        print_warning(f"Language file for '{AppData.lang}' could not be found, the app will use '{Consts.DEFAULT_LANG}.json'.")
        default_translations_file = os.path.join(Consts.FOLDER_TRANSLATIONS, f"{Consts.DEFAULT_LANG}.json")
        with open(default_translations_file, 'r', encoding='utf-8') as f:
            AppData.translations = json.load(f)


def load_last_id():
    """Loads the last id file in memory"""
    # Essential function, must crash the program there the file is formatted incorrectly
    try:
        with open(Consts.FILE_LAST_ID, 'r') as f:
            AppData.last_id = int(f.read().strip())
    except FileNotFoundError:
        print_warning(f"Could not find the file '{Consts.FILE_LAST_ID}', it will be created the first time you add something.")


def load_color_theme():
    """Loads the color theme file in memory"""
    AppData.color_theme = Consts.THEME_LIGHT
    try:
        with open(Consts.FILE_COLOR_THEME, 'r') as f:
            AppData.color_theme = f.read()
            if (AppData.color_theme not in [Consts.THEME_LIGHT, Consts.THEME_DARK]):
                print_error(f"The theme '{AppData.color_theme}' from the file '{Consts.FILE_COLOR_THEME}' is not valid, will be reset to light.")
                AppData.color_theme = Consts.THEME_LIGHT
                update_color_theme()
    except FileNotFoundError:
        print_warning(f"Could not find the file '{Consts.FILE_COLOR_THEME}', it will be created and the theme will be set to light.")
        update_color_theme()


def check_for_updates():
    """Checks for updates on the GitHub repository"""
    try:
        req = requests.get(Consts.UPDATE_CHECK_URL, timeout=10)
        with open(Consts.FILE_APP_VERSION, 'r') as f:
            AppData.local_version = f.read()
        if req.status_code == requests.codes.ok:
            AppData.github_version = req.text
            # Simple version comparison, to avoid importing external libraries
            if float(AppData.local_version) < float(AppData.github_version):
                AppData.update_available = True
                print_info("Update checker: an update was found.")
            else:
                print_info("Update checker: no updates available.")
        else:
            print_warning("Error during update check: response status code was not 'OK'.")
    except Exception as e:
        print_warning(f"Error during update check. Exception:\n{e}")


def print_info(message):
    """Prints a colored message in the terminal"""
    print(f"{Consts.COLOR_INFO}{message}{Consts.COLOR_ENDC}")

def print_warning(message):
    """Prints a colored warning in the terminal"""
    print(f"{Consts.COLOR_WARNING}{message}{Consts.COLOR_ENDC}")

def print_error(message):
    """Prints a colored error in the terminal"""
    print(f"{Consts.COLOR_ERROR}{message}{Consts.COLOR_ENDC}")


def validate_and_map_server_data_for_mod():
    """Used to validate and map custom and map trades before sending them to the mod"""
    validated_server_data = list(filter(lambda x: validate.validate_server_item(x), AppData.server_data))
    return list(map(lambda x: __convert_custom_trade_for_mod(x), validated_server_data))

def __convert_custom_trade_for_mod(item: dict):
    # Custom trades of type tradeCustomV2 and tradeMap must be converted to tradeCustom
    # to respect the mod API specifications (must be called after validation)
    if item.get("type", None) == "tradeCustomV2" or item.get("type", None) == "tradeMap":
        return { **item, "type": "tradeCustom" }
    return item
