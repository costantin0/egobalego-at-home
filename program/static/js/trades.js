"use strict";

import { api, state, addCardButton, CardUtils } from "./shared/utils.js";

document.addEventListener("DOMContentLoaded", async function () {
    addCardButton.initialize();
    state.loadLastId();
    let serverData = await state.loadServerData();
    let trade_types = ["tradePreset", "tradeCustom"]
    serverData.forEach(item => {
        if (trade_types.includes(item.type))
            addTradeCard(false, item);
    });
    addCardButton.activate(() => addTradeCard(true));
});

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
    if (type === "tradePreset")
        tradeData["name"] = preset;
    else
        tradeData["content"] = content;
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
            switch (selectedTrade) {
                case "tradePreset":
                    CardUtils.showElements(tradePresetDiv);
                    CardUtils.hideElements(tradeContentDiv);
                    break;
                case "tradeCustom":
                    CardUtils.showElements(tradeContentDiv);
                    CardUtils.hideElements(tradePresetDiv);
                    break;
            }
        } else {
            CardUtils.disableCard(thisCard, warningDiv, cardEnablerDiv)
            CardUtils.hideElements(tradePresetDiv, tradeContentDiv);
        }
    });

    CardUtils.setupAutoUpdate(thisCard, tradeTypeSelect, updateServer);

    // Add card to top of container
    cardContainer.insertBefore(newCard, cardContainer.firstChild);
}