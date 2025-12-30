"use strict";

import { api, state, addCardButton, CardUtils } from "./shared/utils.js";

document.addEventListener("DOMContentLoaded", async function () {
    addCardButton.initialize();
    state.loadLastId();
    let serverData = await state.loadServerData();
    let trade_types = ["tradePreset", "tradeMap", "tradeCustom"]
    serverData.forEach(item => {
        if (trade_types.includes(item.type))
            addTradeCard(false, item);
    });
    addCardButton.activate(() => addTradeCard(true));
});

/**
 * @param {HTMLElement} card 
 * @param {boolean} validate
 */
function makeMapTradeData(card) {
    const structureInput = (card.querySelector("#structure-id").value || "").trim();
    const nameInput = (card.querySelector("#name").value || "").trim();
    const item1 = (card.querySelector("#item-cost-1").value || "").trim();
    const item1Amt = (card.querySelector("#item-cost-amount-1").value || "").trim();
    const item2 = (card.querySelector("#item-cost-2").value || "").trim();
    const item2Amt = (card.querySelector("#item-cost-amount-2").value || "").trim();

    const mapObj = {};

    mapObj.structure = structureInput ?? '';

    // Name: use provided name or derive default from the structure id
    if (nameInput) {
        mapObj.name = nameInput;
    } else if (structureInput) {
        const structNoHash = mapObj.structure.startsWith("#") ? mapObj.structure.slice(1) : mapObj.structure;
        const [namespace, p] = structNoHash.split(":");
        const base = (p && p.includes("/")) ? p.split("/").pop() : p;
        mapObj.name = `structure.${namespace}.${base}.map.name`;
    }

    const gives = {
        id: "growsseth:ruins_map",
        amount: 1,
        map: mapObj
    };

    const wants = [];
    if (item1) wants.push({ id: item1, amount: Math.max(1, parseInt(item1Amt) || 1) });
    if (item2) {
        const amt2 = parseInt(item2Amt);
        wants.push({ id: item2, amount: isNaN(amt2) ? 1 : amt2 });
    }

    return { gives, wants };
}

async function updateServer(card, action) {
    let id = card.querySelector("#card-id").value;
    let type = card.querySelector("#trade-type").value;
    let preset = card.querySelector("#preset-name").value;
    let content = card.querySelector("#content-text").value;
    let active = card.querySelector("#card-enabler-switch").checked;

    let tradeData = {
        "id": id,
        "type": type,
        "active": active
    };
    if (type === "tradePreset") {
        tradeData["name"] = preset;
    } else if (type === "tradeMap") {
        const content = makeMapTradeData(card, true);
        if (!content) {
            return;
        }
        tradeData["content"] = content;
    } else {
        tradeData["content"] = content;
    }
    tradeData = { [action]: [tradeData] };

    api.sendToServer(tradeData);
}

const cardTemplate = document.querySelector("#trade-template");
const cardContainer = document.getElementById("card-container");
const confirmDeletionModal = document.getElementById("modal-confirm-deletion");
const deleteButtonModal = document.getElementById("delete-button-modal");

function addTradeCard(isNew, item) {
    let newCard = cardTemplate.content.cloneNode(true);

    // Get template elements
    let thisCard = newCard.querySelector("#trade-card");

    let id = thisCard.querySelector("#card-id");

    let warningDiv = thisCard.querySelector("#no-type-warning");

    let cardEnablerDiv = thisCard.querySelector("#card-enabler");
    let cardEnablerSwitch = cardEnablerDiv.querySelector("#card-enabler-switch");
    let cardEnablerLabel = cardEnablerDiv.querySelector("#card-enabler-label");

    let tradeTypeSelect = thisCard.querySelector("#trade-type");

    let tradePresetDiv = thisCard.querySelector("#preset");
    let tradePreset = tradePresetDiv.querySelector("#preset-name");

    let tradeContentDiv = thisCard.querySelector("#advanced-trade-content");
    let tradeContent = tradeContentDiv.querySelector("#content-text");

    let customMapContentDiv = thisCard.querySelector("#custom-map-content");

    if (isNew) {
        id.value = "trade-" + state.newLastId();
    }
    else {
        id.value = item.id;
        tradeTypeSelect.value = item.type;
        switch (item.type) {
            case "tradePreset":
                tradePresetDiv.hidden = false;
                tradePreset.value = item.name;
                break;
            case "tradeCustom":
                tradeContentDiv.hidden = false;
                tradeContent.value = item.content;
                break;
            case "tradeMap":
                customMapContentDiv.hidden = false;
                if (item.content && typeof item.content === 'object') {
                    const c = item.content;
                    if (c.gives && c.gives.map) {
                        const map = c.gives.map;
                        if (map.structure)
                            thisCard.querySelector("#structure-id").value = map.structure;
                        if (map.name) 
                            thisCard.querySelector("#name").value = map.name;
                    }
                    if (Array.isArray(c.wants)) {
                        if (c.wants[0]) {
                            thisCard.querySelector("#item-cost-1").value = c.wants[0].id || "";
                            thisCard.querySelector("#item-cost-amount-1").value = c.wants[0].amount || "";
                        }
                        if (c.wants[1]) {
                            thisCard.querySelector("#item-cost-2").value = c.wants[1].id || "";
                            thisCard.querySelector("#item-cost-amount-2").value = c.wants[1].amount || "";
                        }
                    }
                }
                break;
        }
        warningDiv.hidden = true;
        cardEnablerDiv.hidden = false;
        cardEnablerSwitch.checked = item.active
        CardUtils.changeColorAndLabel(thisCard, cardEnablerLabel, item.active);
    }

    CardUtils.setupDeleteButton(thisCard, tradeTypeSelect, confirmDeletionModal, deleteButtonModal, updateServer);

    CardUtils.setupEnablerSwitch(thisCard, cardEnablerSwitch, cardEnablerLabel);

    tradeTypeSelect.addEventListener("change", function () {
        let selectedTrade = tradeTypeSelect.value;
        if (selectedTrade !== "none") {
            warningDiv.hidden = true;
            cardEnablerDiv.hidden = false;
            cardEnablerSwitch.checked = false;
            CardUtils.changeColorAndLabel(thisCard, cardEnablerLabel, false);
            CardUtils.hideElements(
                tradeContentDiv,
                customMapContentDiv,
                tradePresetDiv,
            )
            switch (selectedTrade) {
                case "tradePreset":
                    CardUtils.showElements(tradePresetDiv);
                    break;
                case "tradeMap":
                    CardUtils.showElements(customMapContentDiv);
                    break;
                case "tradeCustom":
                    CardUtils.showElements(tradeContentDiv);
                    break;
            }
        } else {
            CardUtils.disableCard(thisCard, warningDiv, cardEnablerDiv)
            CardUtils.hideElements(
                tradeContentDiv,
                customMapContentDiv,
                tradePresetDiv,
            )
        }
    });

    CardUtils.setupAutoUpdate(thisCard, tradeTypeSelect, updateServer);

    // Add card to top of container
    cardContainer.insertBefore(newCard, cardContainer.firstChild);
}