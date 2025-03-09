"use strict";

import { api, state, addCardButton, CardUtils } from "./shared/utils.js";

document.addEventListener("DOMContentLoaded", async function () {
    addCardButton.initialize();
    state.loadLastId();
    let serverData = await state.loadServerData();
    let communication_types = ["dialogue", "toast", "researcherDiary", "structureBook"]
    serverData.forEach(item => {
        if (communication_types.includes(item.type))
            addCommCard(false, item);
    });
    addCardButton.activate(() => addCommCard(true));
});

async function updateServer(card, action) {
    let id = card.querySelector("#card-id").value
    let typeSpecific = card.querySelector("#communication-type").value;
    let diaryStructure = card.querySelector("#diary-structure").value;
    let bookStructure = card.querySelector("#book-structure").value;
    let iconNamespace = card.querySelector("#namespace").value;
    let iconItemId = card.querySelector("#item-id").value;
    let author = card.querySelector("#author-text").value;
    let title = card.querySelector("#title-text").value;
    let content = card.querySelector("#content-text").value;
    let active = card.querySelector("#card-enabler-switch").checked;

    let commData = {
        "id": id,
        "type": "",
        "content": content,
        "active": active
    };
    switch (typeSpecific) {
        case "dialogue":
            commData["type"] = typeSpecific
            break;
        case "toast-simple":
        case "toast-with-icon":
            commData["type"] = "toast"
            if (typeSpecific === "toast-with-icon")
                commData["icon"] = iconNamespace + ":" + iconItemId
            commData["title"] = title
            break;
        case "researcher-diary-new":
        case "researcher-diary-replace":
        case "researcher-diary-replace-goodbye":
            commData["type"] = "researcherDiary"
            if (typeSpecific === "researcher-diary-replace")
                commData["structure"] = diaryStructure
            commData["title"] = (typeSpecific === "researcher-diary-replace-goodbye") ? (title + "/endDiary") : title
            break;
        case "structure-book":
            commData["type"] = "structureBook"
            commData["structure"] = bookStructure
            commData["content"] = JSON.stringify({
                "author": author,
                "name": title,
                "pages": [content]
            })
            break;
    }
    commData = { [action]: [commData] };

    api.sendToServer(commData);
}

const cardTemplate = document.querySelector("#communication-template");
const cardContainer = document.getElementById("card-container");
const confirmDeletionModal = document.getElementById("modal-confirm-deletion");
const deleteButtonModal = document.getElementById("delete-button-modal");

function addCommCard(isNew, item) {
    let newCard = cardTemplate.content.cloneNode(true);

    // Get template elements
    let thisCard = newCard.querySelector("#communication-card");

    let id = thisCard.querySelector("#card-id");

    let warningDiv = thisCard.querySelector("#no-type-warning");

    let cardEnablerDiv = thisCard.querySelector("#card-enabler");
    let cardEnablerSwitch = cardEnablerDiv.querySelector("#card-enabler-switch");
    let cardEnablerLabel = cardEnablerDiv.querySelector("#card-enabler-label");

    let commTypeSelect = thisCard.querySelector("#communication-type");

    let researcherStructDiv = thisCard.querySelector("#researcher-diary-struct");
    let diaryStructure = researcherStructDiv.querySelector("#diary-structure");

    let bookStructDiv = thisCard.querySelector("#structure-books");
    let bookStructure = bookStructDiv.querySelector("#book-structure");

    let toastIconDiv = thisCard.querySelector("#toast-icon");
    let iconNamespace = toastIconDiv.querySelector("#namespace");
    let iconItemId = toastIconDiv.querySelector("#item-id");

    let bookAuthorDiv = thisCard.querySelector("#author");
    let author = bookAuthorDiv.querySelector("#author-text");

    let commTitleDiv = thisCard.querySelector("#title");
    let title = commTitleDiv.querySelector("#title-text");

    let contentDiv = thisCard.querySelector("#content");
    let content = contentDiv.querySelector("#content-text");

    // Setting card
    if (isNew) {
        id.value = "communication-" + state.newLastId();
    }
    else {
        id.value = item.id;
        content.value = item.content;
        switch (item.type) {
            case "dialogue":
                commTypeSelect.value = item.type;
                break;
            case "toast":
                commTypeSelect.value = item.icon ? "toast-with-icon" : "toast-simple"
                if (item.icon) {
                    iconNamespace.value = item.icon.split(":")[0]
                    iconItemId.value = item.icon.split(":")[1]
                }
                title.value = item.title;
                break;
            case "researcherDiary":
                if (item.title.endsWith("/endDiary")) {
                    commTypeSelect.value = "researcher-diary-replace-goodbye"
                    title.value = item.title.replace("/endDiary", "");
                } else {
                    commTypeSelect.value = item.structure ? "researcher-diary-replace" : "researcher-diary-new"
                    title.value = item.title;
                }
                if (item.structure)
                    diaryStructure.value = item.structure
                break;
            case "structureBook":
                commTypeSelect.value = "structure-book"
                bookStructure.value = item.structure
                let bookContent = JSON.parse(item.content)
                author.value = bookContent.author
                title.value = bookContent.name
                content.value = bookContent.pages
                break;
        }
        cardEnablerSwitch.checked = item.active
        enableCard(commTypeSelect.value);
        CardUtils.changeColorAndLabel(thisCard, cardEnablerLabel, item.active);
    }

    CardUtils.setupDeleteButton(thisCard, commTypeSelect, confirmDeletionModal, deleteButtonModal, updateServer);

    CardUtils.setupEnablerSwitch(thisCard, cardEnablerSwitch, cardEnablerLabel);

    commTypeSelect.addEventListener("change", function () {
        let selectedComm = commTypeSelect.value;
        if (selectedComm !== "none") {
            enableCard(selectedComm);
            cardEnablerSwitch.checked = false;
            CardUtils.changeColorAndLabel(thisCard, cardEnablerLabel, false);
        }
        else {
            CardUtils.disableCard(thisCard, warningDiv, cardEnablerDiv)
            CardUtils.hideElements(bookAuthorDiv, commTitleDiv, toastIconDiv, researcherStructDiv, bookStructDiv, contentDiv);
        }
    });

    CardUtils.setupAutoUpdate(thisCard, commTypeSelect, updateServer);

    function enableCard(selectedComm) {
        warningDiv.hidden = true;
        cardEnablerDiv.hidden = false;
        switch (selectedComm) {
            case 'dialogue':
                CardUtils.showElements(contentDiv);
                CardUtils.hideElements(bookAuthorDiv, commTitleDiv, toastIconDiv, researcherStructDiv, bookStructDiv);
                break;
            case 'toast-simple':
                CardUtils.showElements(commTitleDiv, contentDiv);
                CardUtils.hideElements(bookAuthorDiv, toastIconDiv, researcherStructDiv, bookStructDiv);
                break;
            case 'toast-with-icon':
                CardUtils.showElements(commTitleDiv, toastIconDiv, contentDiv);
                CardUtils.hideElements(bookAuthorDiv, researcherStructDiv, bookStructDiv);
                break;
            case 'researcher-diary-new':
            case 'researcher-diary-replace-goodbye':
                CardUtils.showElements(commTitleDiv, contentDiv);
                CardUtils.hideElements(bookAuthorDiv, toastIconDiv, researcherStructDiv, bookStructDiv);
                break;
            case 'researcher-diary-replace':
                CardUtils.showElements(commTitleDiv, researcherStructDiv, contentDiv);
                CardUtils.hideElements(bookAuthorDiv, toastIconDiv, bookStructDiv);
                break;
            case 'structure-book':
                CardUtils.showElements(bookAuthorDiv, commTitleDiv, bookStructDiv, contentDiv);
                CardUtils.hideElements(toastIconDiv, researcherStructDiv);
                break;
        }
    }

    // Add card to top of container
    cardContainer.insertBefore(newCard, cardContainer.firstChild);
}