"use strict";

export const api = {
    sendToServer(data) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/data_receiver");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    }
};

export const state = {
    lastId: null,
    async loadLastId() {
        const responseForLastId = await fetch("/last_id");
        this.lastId = parseInt(await responseForLastId.text());
    },
    newLastId() {
        return ++this.lastId;
    },

    serverData: null,
    async loadServerData() {
        const responseForServerData = await fetch("/server_data/raw");
        this.serverData = await responseForServerData.json();
        return this.serverData;
    }
};

export const addCardButton = {
    button: null,
    initialize() {
        this.button = document.getElementById("add-card-button"),
        this.button.disabled = true;
    },
    activate(callback) {
        this.button.addEventListener("click", callback);
        this.button.disabled = false;
    },
};

export const time = {
    getCurrentTimestamp() {
        let now = new Date();
        return new String(now).slice(16, 24);   // only getting the timestamp
    }
}

export class CardUtils {
    static setupDeleteButton(card, typeSelect, confirmDeletionModal, buttonModal, updateServerCallback) {
        const button = card.querySelector("#delete-card-button");
        button.addEventListener("click", function () {
            // If the card is not set up, just remove it. If it is, show the confirmation modal
            if (typeSelect.value === "none" || typeSelect.value === "growsseth:none") {
                card.remove();
            } else {
                const modal = new bootstrap.Modal(confirmDeletionModal);
                modal.show();
                buttonModal.addEventListener("click", function () {
                    updateServerCallback(card, "remove");
                    card.remove();
                });
            }
        });
    }

    static setupEnablerSwitch(card, cardEnablerSwitch, cardEnablerLabel) {
        cardEnablerSwitch.addEventListener("click", function () {
            CardUtils.changeColorAndLabel(card, cardEnablerLabel, this.checked);
        });
    }

    static setupAutoUpdate(card, typeSelect, updateServerCallback) {
        card.querySelectorAll('input, select, textarea').forEach(function (element) {
            element.addEventListener('change', () => {
                // When the user edits the card, update the server with the new data
                const typeUnset = typeSelect.value === "none" || typeSelect.value === "growsseth:none";
                updateServerCallback(card, typeUnset ? "remove" : "add");
            });
        });
    }

    static disableCard(card, warningDiv, cardEnablerDiv) {
        // When their type is set to none, cards become grey and can't be enabled
        warningDiv.hidden = false;
        cardEnablerDiv.hidden = true;
        card.classList.remove("bg-danger-subtle", "bg-success-subtle");
        card.classList.add("bg-dark-subtle");
    }

    static changeColorAndLabel(card, cardEnablerLabel, isActive) {
        if (isActive)
            card.classList.remove("bg-dark-subtle", "bg-danger-subtle");
        else
            card.classList.remove("bg-dark-subtle", "bg-success-subtle");
        card.classList.add(isActive ? "bg-success-subtle" : "bg-danger-subtle");
        cardEnablerLabel.innerText = isActive ? activeText : notActiveText;
    }

    static showElements(...divs) {
        for (let div of divs) {
            div.hidden = false;
        }
    }

    static hideElements(...divs) {
        for (let div of divs) {
            div.hidden = true;
        }
    }
};