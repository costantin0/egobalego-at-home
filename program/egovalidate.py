"""Utilities related to validating specific server items."""

import sys, json

def validate_server_item(item: dict):
    # Custom trades set from the ui (not from json) and map trades
    # need validation to create the actually saved JSON
    if item.get("type", None) == "tradeMap":
        return __validate_map_trade(item)
    elif item.get("type", None) == "tradeCustomV2":
        err = __validate_custom_trade(item)
        if err:
            print("Custom trade validation error:", err)
            return False
    return True

def __validate_custom_trade(item: dict):
    content = __try_parse_json(item.get("content", None))
    print(content)
    if not content:
        return {"content": content}
    if not content.get("gives", None):
        return {"gives": content.get("gives", None)}
    if content["gives"].get("id", "").strip() == "":
        return {"gives id": content["gives"].get("id", "").strip()}
    if not content["gives"].get("amount", None):
        return {"gives amount": content["gives"].get("amount", None)}
    if len(content.get("wants", [])) <= 0:
        return {"wants len": len(content.get("wants", []))}
    if content["wants"][0].get("id", None).strip() == "":
        return {"wants 0 id": content["wants"][0].get("id", None)}
    if not content["wants"][0].get("amount", None):
        return {"wants 0 amount": content["wants"][0].get("amount", None)}
    return None

def __validate_map_trade(item: dict):
    content = __try_parse_json(item.get("content", None))
    if not content:
        return False
    if not content.get("gives", None):
        return False
    if not content["gives"].get("map", None):
        return False
    map: dict = content["gives"]["map"]
    if map.get("structure", "").strip() == "":
        return False
    if len(content.get("wants", [])) <= 0:
        return False
    if content["wants"][0].get("id", "").strip() == "":
        return False
    if not content["wants"][0].get("amount", None):
        return False
    return True

def __try_parse_json(string: str):
    if string is None:
        return string
    try:
        return json.loads(string)
    except Exception as e:
        print(e, file=sys.stderr)
        return None