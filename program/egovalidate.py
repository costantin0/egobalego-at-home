from typing import cast


def validate_server_item(item: dict):
    if item.get("type", None) == "tradeMap":
        return __validate_map_trade(item)
    return True
        
def __validate_map_trade(item: dict):
    content = item.get("content", None)
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
    if content["wants"][0].get("amount", "").strip() == "":
        return False
    
    return True