"use strict";

import { api, state, addCardButton, CardUtils } from "./shared/utils.js";

document.addEventListener("DOMContentLoaded", async function () {
    addCardButton.initialize();
    state.loadLastId();
    let serverData = await state.loadServerData();
    serverData.forEach(item => {
        if (item.type === "structure")
            addStructureCard(false, item);
    });
    addCardButton.activate(() => addStructureCard(true));
});

async function updateServer(card, action) {
    let id = card.querySelector("#card-id").value;
    let structure = card.querySelector("#structure-type").value;
    let golemVariant = card.querySelector("#golem-select").value;
    let golemZombie = card.querySelector("#golem-zombie-switch").checked;
    let x = card.querySelector("#x-coord").value;
    let y = card.querySelector("#y-coord").value;
    let z = card.querySelector("#z-coord").value;
    let rotation = card.querySelector("#rotation-select").value;
    let active = card.querySelector("#card-enabler-switch").checked;

    let formattedStructure = structure;
    if (structure === "growsseth:golem_variants") {
        if (golemZombie)
            formattedStructure = formattedStructure + "/zombie_" + golemVariant;
        else
            formattedStructure = formattedStructure + "/" + golemVariant;
    }
    let structureData = {
        "id": id,
        "type": "structure",
        "structure": formattedStructure,
        "x": parseInt(x) || 0,
        "y": parseInt(y) || 0,
        "z": parseInt(z) || 0,
        "active": active
    };
    if (rotation !== "auto")
        structureData["rotation"] = rotation;
    structureData = { [action]: [structureData] };

    api.sendToServer(structureData);
}

const cardTemplate = document.querySelector("#structure-template");
const cardContainer = document.getElementById("card-container");
const confirmDeletionModal = document.getElementById("modal-confirm-deletion");
const deleteButtonModal = document.getElementById("delete-button-modal");

function addStructureCard(isNew, item) {
    let newCard = cardTemplate.content.cloneNode(true);

    // Get template elements
    let thisCard = newCard.querySelector("#structure-card");

    let id = thisCard.querySelector("#card-id");

    let warningDiv = thisCard.querySelector("#no-type-warning");

    let cardEnablerDiv = thisCard.querySelector("#card-enabler");
    let cardEnablerSwitch = cardEnablerDiv.querySelector("#card-enabler-switch");
    let cardEnablerLabel = cardEnablerDiv.querySelector("#card-enabler-label");

    let structurePreview = thisCard.querySelector("#structure-preview");

    let structureTypeSelect = thisCard.querySelector("#structure-type");

    let golemVariantDiv = thisCard.querySelector("#golem-variant");
    let golemVariantSelect = golemVariantDiv.querySelector("#golem-select");
    let golemZombieSwitch = golemVariantDiv.querySelector("#golem-zombie-switch");

    let coordinatesDiv = thisCard.querySelector("#coordinates");
    let x = coordinatesDiv.querySelector("#x-coord");
    let y = coordinatesDiv.querySelector("#y-coord");
    let z = coordinatesDiv.querySelector("#z-coord");

    let rotationDiv = thisCard.querySelector("#rotation");
    let rotation = rotationDiv.querySelector("#rotation-select");

    // Setting card
    if (isNew) {
        id.value = "structure-" + state.newLastId();
    }
    else {
        id.value = item.id;
        structureTypeSelect.value = item.structure;
        if (item.structure.includes("growsseth:golem_variants")) {
            structureTypeSelect.value = item.structure.split("/")[0];
            let golemVariant = item.structure.split("/")[1]
            golemVariantSelect.value = golemVariant.replace("zombie_", "");
            golemZombieSwitch.checked = item.structure.includes("/zombie_");
        }
        x.value = item.x;
        y.value = item.y;
        z.value = item.z;
        rotation.value = item.rotation ? item.rotation : "auto";
        cardEnablerSwitch.checked = item.active

        enableStructureCard(structureTypeSelect.value)
        CardUtils.changeColorAndLabel(thisCard, cardEnablerLabel, item.active);
        updatePreview(structureTypeSelect.value)
    }

    structureTypeSelect.addEventListener("change", function () {
        let selectedStructure = structureTypeSelect.value;
        if (selectedStructure !== "growsseth:none") {
            enableStructureCard(selectedStructure)
            cardEnablerSwitch.checked = false;
            CardUtils.changeColorAndLabel(thisCard, cardEnablerLabel, false)
            updatePreview(selectedStructure)
        }
        else {
            CardUtils.disableCard(thisCard, warningDiv, cardEnablerDiv);
            CardUtils.hideElements(golemVariantDiv, coordinatesDiv, rotationDiv);
            structurePreview.src = defaultPreview;
        }
    });

    golemVariantSelect.addEventListener("change", function () {
        updatePreview("growsseth:golem_variants")
    });

    golemZombieSwitch.addEventListener("change", function () {
        zombieImgFilter();
    });

    CardUtils.setupDeleteButton(thisCard, structureTypeSelect, confirmDeletionModal, deleteButtonModal, updateServer);

    CardUtils.setupEnablerSwitch(thisCard, cardEnablerSwitch, cardEnablerLabel);

    CardUtils.setupAutoUpdate(thisCard, structureTypeSelect, updateServer);

    function enableStructureCard(selectedStructure) {
        warningDiv.hidden = true;
        CardUtils.showElements(cardEnablerDiv, coordinatesDiv, rotationDiv);
        golemVariantDiv.hidden = (selectedStructure !== "growsseth:golem_variants");
    }

    function updatePreview(selectedStructure) {
        selectedStructure = selectedStructure.split(":")[1]
        let selectedPreview = defaultPreview;
        if (selectedStructure === "golem_variants")
            selectedPreview = selectedPreview.replace("none", "golem_variants/" + golemVariantSelect.value);
        else
            selectedPreview = selectedPreview.replace("none", selectedStructure);
        structurePreview.src = selectedPreview;
        zombieImgFilter();
    }

    function zombieImgFilter() {
        if (structureTypeSelect.value === "growsseth:golem_variants" && golemZombieSwitch.checked)
            structurePreview.style.filter = "sepia(100%)";
        else
            structurePreview.style.filter = "none";
    }

    // Add card to top of container
    cardContainer.insertBefore(newCard, cardContainer.firstChild);
}