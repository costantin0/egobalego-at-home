def convert_item_for_server(item: dict):
    if item.get("type", None) == "tradeCustomV2" or item.get("type", None) == "tradeMap":
        return __convert_trade(item)
    return item
    
def __convert_trade(item: dict):
    return {
        **item,
        "type": "tradeCustom"
    }