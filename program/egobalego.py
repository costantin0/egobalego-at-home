"""Main entrypoint of the app"""

import argparse, webbrowser
from egoconfig import AppData, Consts
import egoflask, egoutils as utils

def main():
    """
    Main application entry point. Handles argument parsing and data
    initialization, then starts the Flask server with SocketIO support
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--open", action='store_true', help="Open browser page on start")
    parser.add_argument("-P", "--port", type=int, default=Consts.DEFAULT_PORT, help="Server port")
    parser.add_argument("--debug", action=argparse.BooleanOptionalAction, default=True, help="Flask debug mode")
    parser.add_argument("--lang", default=Consts.DEFAULT_LANG, help='Website language')

    args = parser.parse_args()
    args_open: bool = args.open
    args_port: int = args.port
    args_debug: bool = args.debug
    args_lang: str = args.lang

    AppData.lang = args_lang
    utils.load_translations()
    utils.load_server_data()
    utils.load_last_id()
    utils.load_color_theme()
    utils.check_for_updates()

    app_url = f"http://localhost:{args_port}"

    app = egoflask.get_flask(__name__)
    socketio = egoflask.get_socketio()

    socketio.init_app(app, cors_allowed_origins=app_url)

    if args_open:
        webbrowser.open(app_url)

    socketio.run(app, debug=args_debug, port=args_port)

if __name__ == '__main__':
    main()
