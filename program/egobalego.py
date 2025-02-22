#region Imports and Definitions

import os, json, argparse, webbrowser, requests
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from mistune import create_markdown

# Flask app and SocketIO initialization
app = Flask(__name__)
socketio = SocketIO()

# Argument parser
parser = argparse.ArgumentParser()
parser.add_argument("--open", action='store_true', help="Open browser page on start")
parser.add_argument("-P", "--port", type=int, default=5000, help="Server port")
parser.add_argument("--debug", action=argparse.BooleanOptionalAction, default=True, help="Flask debug mode")
parser.add_argument("--lang", default="en_us", help='Website language')

# Constants
FOLDER_PROGRAM = os.path.dirname(__file__)
FOLDER_DATA = os.path.join(FOLDER_PROGRAM, "..", "data")
FILE_APP_VERSION = os.path.join(FOLDER_DATA, "app_version")
FILE_TRANSLATIONS = os.path.join(FOLDER_DATA, "translations.json")
FILE_SERVER_DATA = os.path.join(FOLDER_DATA, "server_data.json")
FILE_LAST_ID = os.path.join(FOLDER_DATA, "last_id.txt")
FILE_COLOR_THEME = os.path.join(FOLDER_DATA, "color_theme")
UPDATE_CHECK_URL = "https://raw.githubusercontent.com/costantin0/egobalego-at-home/refs/heads/main/data/app_version"
THEME_LIGHT = "light"
THEME_DARK = "dark"
COLOR_WARNING = '\033[93m'
COLOR_ERROR = '\033[91m'
COLOR_ENDC = '\033[0m'

# Application data and settings
class AppData:
    translations = {}
    lang = "unset"
    server_data = []
    last_id = 0
    color_theme = THEME_LIGHT
    local_version = "0"
    github_version = "0"
    update_available = False
    websocket_connected = False

#endregion

#region App Routes

@app.route('/')
def home():
    return render_custom_template('home')

@app.route('/commands.html')
def commands():
    return render_custom_template('commands')

@app.route('/trades.html')
def trades():
    return render_custom_template('trades')

@app.route('/communications.html')
def communications():
    return render_custom_template('communications')

@app.route('/quest-steps.html')
def quest_steps():
    return render_custom_template('quest-steps', help_key="help_quest")

@app.route('/structures.html')
def structures():
    return render_custom_template('structures')

@app.route('/websocket.html')
def websocket():
    return render_custom_template('websocket')


def render_custom_template(page_name, help_key = None):
    if help_key is None:
        help_key = f"help_{page_name}"
    params = {
        'name': page_name,
        'theme': AppData.color_theme,
        'help_title': AppData.translations[AppData.lang][help_key],
        'help_content': md_content(AppData.lang + f"/{help_key}"),
        'translations': AppData.translations.get(AppData.lang, AppData.translations[AppData.lang])
    }
    if page_name == "home":
        params["update_available"] = AppData.update_available
        params["local_version"] = AppData.local_version
        params["github_version"] = AppData.github_version
    return render_template(f"{page_name}.html", **params)


@app.route('/data_receiver', methods=['POST'])
def receive_data():
    if request.method == 'POST':
        update_data()
    return "Data sent correctly to the server!"

@app.route('/server_data', methods=['GET'])
def send_data():
    load_data()
    return AppData.server_data

@app.route('/last_id', methods=['GET'])
def send_last_id():
    return str(AppData.last_id)

@app.route('/switch_theme', methods=['GET'])
def switch_color_theme():
    AppData.color_theme = THEME_DARK if AppData.color_theme == THEME_LIGHT else THEME_LIGHT
    update_color_theme()
    return "Theme was switched!"

#endregion

#region SocketIO Events

@socketio.on('mod_connect')
def handle_connect():
    AppData.websocket_connected = True
    print("Mod connected to websocket")
    emit("mod_connect", broadcast=True)

@socketio.on('mod_disconnect')
def handle_disconnect():
    AppData.websocket_connected = False
    print("Mod disconnected from websocket")
    emit("mod_disconnect", broadcast=True)

@socketio.on('is_mod_connected')
def get_connection_status():
    return AppData.websocket_connected

@socketio.on('reload')
def reload_minecraft():
    print("Sending reload event")
    emit("reload", broadcast=True)

@socketio.on('rdialogue')
def send_researcher_dialogue(data):
    print("Sending rdialogue event:", data)
    emit("rdialogue", data, broadcast=True)

@socketio.on('toast')
def send_toast(data):
    print("Sending toast event:", data)
    emit("toast", data, broadcast=True)

@socketio.on('cmd')
def send_command(data):
    print("Sending cmd event:", data)
    emit("cmd", data, broadcast=True)

@socketio.on('mod_response')
def handle_mod_response(response):
    print("Received response from the mod:", response)
    emit("mod_response", response, broadcast=True)

#endregion

#region Misc Functions

def load_data():
    try:
        with open(FILE_SERVER_DATA, 'r') as f:
            data = f.read()
            AppData.server_data = json.loads(data)
    except FileNotFoundError:
        print_warning(f"Could not find the file '{FILE_SERVER_DATA}', it will be created the first time you add something.")
    except Exception as e:
        print_error(f"Server data could not be loaded and was reset, changes will apply on the next edit:\n{e}")

def update_data():
    received_data = request.json
    if received_data is not None:
        if "add" in received_data.keys():
            add_data(received_data["add"])
        if "remove" in received_data.keys():
            remove_data(received_data["remove"])
        update_database()
    else:
        print_error("Error: no data received from the client!")

def add_data(items_to_add):
    for new_object in items_to_add:
        found = False
        if len(AppData.server_data) == 0:
            AppData.last_id += 1
            AppData.server_data.append(new_object)
        else:
            for object in AppData.server_data:
                if object["id"] == new_object["id"]:
                    found = True
                    break
            if found:
                AppData.server_data.remove(object)
                AppData.server_data.append(new_object)
            else:
                AppData.last_id += 1
                AppData.server_data.append(new_object)

def remove_data(items_to_remove):
    for new_object in items_to_remove:
        for object in AppData.server_data:
            if object["id"] == new_object["id"]:
                AppData.server_data.remove(object)

def update_database():
    with open(FILE_LAST_ID, 'w') as f:
        f.write(str(AppData.last_id))
    with open(FILE_SERVER_DATA, 'w') as f:
        json.dump(AppData.server_data, f, indent=4)

def update_color_theme():
    with open(FILE_COLOR_THEME, 'w') as f:
        f.write(AppData.color_theme)

def md_content(file_name):
    with open(os.path.join(FOLDER_PROGRAM, "templates", "content", f"{file_name}.md"), 'r', encoding='UTF-8') as f:
        parser = create_markdown(escape=False, plugins=['strikethrough', 'footnotes', 'table'])
        return parser(f.read())

def load_translations():
    with open(FILE_TRANSLATIONS, 'r', encoding='utf-8') as f:
        AppData.translations = json.load(f)
        language_check()

def language_check():
    # note: this assumes that the language is already set
    if AppData.lang in AppData.translations.keys():
        print(f"\nLanguage set to '{AppData.lang}'.")
    else:
        print_warning(f"\nLanguage '{AppData.lang}' is not available, will be set to 'en_us'.")
        AppData.lang = "en_us"

def load_last_id():
    try:
        with open(FILE_LAST_ID, 'r') as f:
            try:
                AppData.last_id = int(f.read())
            except ValueError:
                print_error(f"Could not parse the content of '{FILE_LAST_ID}' to integer, will be reset to zero.")
    except FileNotFoundError:
        print_warning(f"Could not find the file '{FILE_LAST_ID}', it will be created the first time you add something.")
    except Exception as e:
        print_error(f"Last index could not be loaded and was reset, changes will apply on the next edit:\n{e}")

def load_color_theme():
    try:
        with open(FILE_COLOR_THEME, 'r') as f:
            AppData.color_theme = f.read()
            if (AppData.color_theme not in [THEME_LIGHT, THEME_DARK]):
                print_error(f"The theme '{AppData.color_theme}' from the file '{FILE_COLOR_THEME}' is not valid, will be reset to light.")
                AppData.color_theme = THEME_LIGHT
                update_color_theme()
    except FileNotFoundError:
        print_warning(f"Could not find the file '{FILE_COLOR_THEME}', it will be created and the theme will be set to light.")
        update_color_theme()

def check_for_updates():
    try:
        req = requests.get(UPDATE_CHECK_URL, timeout=10)
        with open(FILE_APP_VERSION, 'r') as f:
            AppData.local_version = f.read()
        if req.status_code == requests.codes.ok:
            AppData.github_version = req.text
            if float(AppData.local_version) < float(AppData.github_version):
                AppData.update_available = True
                print("\nUpdate checker: an update was found.\n")
            else:
                print("\nUpdate checker: no updates available.\n")
        else:
            print_warning("Error during update check: response status code was not 'OK'.")
    except Exception as e:
        print_warning(f"Error during update check:\n{e}")

def print_warning(message):
    print(f"{COLOR_WARNING}{message}{COLOR_ENDC}")

def print_error(message):
    print(f"{COLOR_ERROR}{message}{COLOR_ENDC}")

#endregion

#region Main

if __name__ == '__main__':
    args = parser.parse_args()
    args_open: bool = args.open
    args_port: int = args.port
    args_debug: bool = args.debug
    args_lang: str = args.lang

    AppData.lang = args_lang
    load_translations()
    load_data()
    load_last_id()
    load_color_theme()
    check_for_updates()

    app_url = f"http://localhost:{args_port}"

    socketio.init_app(app, cors_allowed_origins=app_url)

    if args_open:
        webbrowser.open(app_url)

    socketio.run(app, debug=args_debug, port=args_port)

#endregion
