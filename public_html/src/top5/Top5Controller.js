/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author Wei Hang Hong
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        let addNew = document.getElementById("add-list-button");
        addNew.onmousedown = (event) => {
            if (!addNew.classList.contains("disabled")) {
                let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
                this.model.loadList(newList.id);
                this.model.saveLists();
            }
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }
        document.getElementById("close-button").onmousedown = (event) => {
            this.model.close();
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);

                    textInput.focus();

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.addChangeItemTransaction(i-1, event.target.value);
                    }
                }
            }
            //item to move
            item.ondragstart = (event) => {
                event.dataTransfer.setData("key", event.target.id);

            }

            item.ondragover = (event) => {
                event.preventDefault();
            }

            //destination
            item.ondrop = (event) => {
                event.preventDefault();
                if (event.target.className == "top5-item") {
                    let data = event.dataTransfer.getData("key");
                    let oldId = data.substring(5);
                    let destId = event.target.id.substring(5);
                    this.model.addMoveItemTransaction(parseInt(oldId), parseInt(destId));
                }
            }
        }
    }

    registerListSelectHandlers(id) {
        let list = document.getElementById("top5-list-" + id);
        // FOR SELECTING THE LIST
        list.onmousedown = (event) => {
            let selected = this.model.currentList;
            if (selected==null || selected.id !== id) {
                this.model.unselectAll();
                // GET THE SELECTED LIST
                this.model.loadList(id);
            }
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(this.model.getListIndex(id)).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");
            let confirm = document.getElementById("dialog-confirm-button");
            confirm.onmouseup = (event) => {
                this.model.addDeleteListTransaction(id);
                modal.classList.remove("is-visible");
            }
            let cancel = document.getElementById("dialog-cancel-button");
            cancel.onmouseup = (event) => {
                modal.classList.remove("is-visible");
            }
        }
        // FOR CHANGING NAME
        list.ondblclick = (ev) => {
            // CLEAR THE TEXT
            list.innerHTML = "";
            
            // ADD A TEXT FIELD
            let textInput = document.createElement("input");
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "list-card-text-" + id);
            textInput.setAttribute("value", this.model.currentList.getName());

            let deleteButton = document.createElement("input");
            deleteButton.setAttribute("id", "delete-list-" + id);
            deleteButton.setAttribute("class", "list-card-button");
            deleteButton.setAttribute("type", "button");
            deleteButton.setAttribute("value", "\u2715");

            list.appendChild(textInput);
            list.appendChild(deleteButton); 

            let addNew = document.getElementById("add-list-button");
            addNew.classList.add("disabled");

            textInput.focus();

            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }
            textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    this.model.addChangeListTransaction(id, event.target.value);
                    addNew.classList.remove("disabled");
                }
            }
            textInput.onblur = (event) => {
                this.model.addChangeListTransaction(id, event.target.value);
                addNew.classList.remove("disabled");
            }
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}