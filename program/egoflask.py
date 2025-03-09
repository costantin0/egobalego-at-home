"""Functions related to getting the Flask and SocketIO instances"""

import os
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from mistune import create_markdown
from egoconfig import AppData, Consts, Routes, Templates, SocketEvents
import egoutils as utils


def get_flask(app_name):
    """Returns a new Flask instance with the passed name"""
    app = Flask(app_name)

    @app.route('/')
    def home():
        return _render_custom_template(Templates.HOME)

    @app.route(_make_route(Templates.COMMANDS))
    def commands():
        return _render_custom_template(Templates.COMMANDS)

    @app.route(_make_route(Templates.TRADES))
    def trades():
        return _render_custom_template(Templates.TRADES)

    @app.route(_make_route(Templates.COMMUNICATIONS))
    def communications():
        return _render_custom_template(Templates.COMMUNICATIONS)

    @app.route(_make_route(Templates.QUEST_STEPS))
    def quest_steps():
        return _render_custom_template(Templates.QUEST_STEPS, help_key="help_quest")

    @app.route(_make_route(Templates.STRUCTURES))
    def structures():
        return _render_custom_template(Templates.STRUCTURES)

    @app.route(_make_route(Templates.WEBSOCKET))
    def websocket():
        return _render_custom_template(Templates.WEBSOCKET)

    @app.route(Routes.DATA_RECEIVER, methods=['POST'])
    def receive_data():
        if request.method == 'POST':
            utils.update_server_data(request.json)
            return "Data sent correctly to the server!"
        return "Request method was not POST!"

    @app.route(Routes.SERVER_DATA, methods=['GET'])
    def send_data():
        utils.load_server_data()
        return AppData.server_data

    @app.route(Routes.LAST_ID, methods=['GET'])
    def send_last_id():
        return str(AppData.last_id)

    @app.route(Routes.SWITCH_THEME, methods=['GET'])
    def switch_color_theme():
        AppData.color_theme = Consts.THEME_DARK if AppData.color_theme == Consts.THEME_LIGHT else Consts.THEME_LIGHT
        utils.update_color_theme()
        return "Theme was switched!"

    return app


def get_socketio():
    """Returns a new Flask SocketIO instance"""
    socketio = SocketIO()

    @socketio.on(SocketEvents.MOD_CONNECT)
    def handle_connect():
        AppData.websocket_connected = True
        utils.print_info("Mod connected to websocket.")
        emit(SocketEvents.MOD_CONNECT, broadcast=True)

    @socketio.on(SocketEvents.MOD_DISCONNECT)
    def handle_disconnect():
        AppData.websocket_connected = False
        utils.print_info("Mod disconnected from websocket.")
        emit(SocketEvents.MOD_DISCONNECT, broadcast=True)

    @socketio.on(SocketEvents.IS_MOD_CONNECTED)
    def get_connection_status():
        return AppData.websocket_connected

    @socketio.on(SocketEvents.RELOAD)
    def reload_minecraft():
        utils.print_info("Sending reload event...")
        emit(SocketEvents.RELOAD, broadcast=True)

    @socketio.on(SocketEvents.RESEARCHER_DIALOGUE)
    def send_researcher_dialogue(data):
        utils.print_info(f"Sending rdialogue event: {data}")
        emit(SocketEvents.RESEARCHER_DIALOGUE, data, broadcast=True)

    @socketio.on(SocketEvents.TOAST)
    def send_toast(data):
        utils.print_info(f"Sending toast event: {data}")
        emit(SocketEvents.TOAST, data, broadcast=True)

    @socketio.on(SocketEvents.COMMAND)
    def send_command(data):
        utils.print_info(f"Sending cmd event: {data}")
        emit(SocketEvents.COMMAND, data, broadcast=True)

    @socketio.on(SocketEvents.MOD_RESPONSE)
    def handle_mod_response(response):
        utils.print_info(f"Received response from the mod: {response}")
        emit(SocketEvents.MOD_RESPONSE, response, broadcast=True)

    return socketio


def _make_route(template_name):
    """Returns the route for the specified template name"""
    return f"/{template_name}.html"


def _render_custom_template(page_name, help_key=None):
    """Renders a custom Flask template with extra parameters"""
    if help_key is None:
        help_key = f"help_{page_name}"

    params = {
        'name': page_name,
        'theme': AppData.color_theme,
        'help_title': AppData.translations[AppData.lang][help_key],
        'help_content': _get_md_content(AppData.lang + f"/{help_key}"),
        'translations': AppData.translations.get(AppData.lang, AppData.translations[AppData.lang])
    }

    if page_name == "home":
        params["update_available"] = AppData.update_available
        params["local_version"] = AppData.local_version
        params["github_version"] = AppData.github_version

    return render_template(f"{page_name}.html", **params)


def _get_md_content(file_name):
    """Loads the MD file at the specified path and processes it in a format that the browser can read"""
    md_file_path = os.path.join(Consts.FOLDER_PROGRAM, "templates", "content", f"{file_name}.md")
    try:
        with open(md_file_path, 'r', encoding='utf-8') as f:
            parser = create_markdown(escape=False, plugins=['strikethrough', 'footnotes', 'table'])
            return parser(f.read())
    except FileNotFoundError:
        utils.print_error(f"File '{md_file_path}' not found, returning error message.")
        return "Error! Help file not found."
    except Exception as e:
        utils.print_error(f"Error while reading '{md_file_path}'. Exception:\n{e}")
        return "Error! Help file could not be loaded."
