import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
import ChangeList_Transaction from "./transactions/ChangeList_Transaction.js";
import DeleteList_Transaction from "./transactions/DeleteList_Transaction.js";

/**
 * Top5Model.js
 * 
 * This class provides access to all the data, meaning all of the lists. 
 * 
 * This class provides methods for changing data as well as access
 * to all the lists data.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author Wei Hang Hong
 */
export default class Top5Model {
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.top5Lists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;
    }

    getList(index) {
        return this.top5Lists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    setView(initView) {
        this.view = initView;
    }

    addNewList(initName, initItems) {
        let newList = new Top5List(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initItems)
            newList.setItems(initItems);
        this.top5Lists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
        return newList;
    }

    sortLists() {
        this.top5Lists.sort((listA, listB) => {
            if (listA.getName() < listB.getName()) {
                return -1;
            }
            else if (listA.getName === listB.getName()) {
                return 0;
            }
            else {
                return 1;
            }
        });
        this.view.refreshLists(this.top5Lists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            this.view.unhighlightList(list.getId());
        }
    }

    loadList(id) {
        let list = null;
        let found = false;
        let i = 0;
        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.update(this.currentList);
                this.view.highlightList(id, this.currentList.getName());
                found = true;
            }
            i++;
        }
        this.tps.clearAllTransactions();
        this.view.updateToolbarButtons(this);
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.top5Lists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let items = [];
                for (let j = 0; j < listData.items.length; j++) {
                    items[j] = listData.items[j];
                }
                this.addNewList(listData.name, items);
            }
            this.sortLists();   
            this.view.refreshLists(this.top5Lists);
            return true;
        }        
    }

    saveLists() {
        let top5ListsString = JSON.stringify(this.top5Lists);
        localStorage.setItem("recent_work", top5ListsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    addChangeItemTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.currentList.items[id];
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
    }

    addChangeListTransaction = (id, newText) => {
        let oldText = this.getList(this.getListIndex(id)).getName();
        let transaction = new ChangeList_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
    }   

    changeItem(id, text) {
        this.currentList.items[id] = text;
        this.view.update(this.currentList);
        this.saveLists();
        this.view.enableButton("undo-button");
    }

    changeList(id, text) {
        let list = this.getList(this.getListIndex(id))
        list.setName(text);
        this.sortLists();
        this.view.updateList(list, id);
        this.view.highlightList(id, list.name);
        this.view.enableButton("undo-button");
        this.saveLists();
    }

    addDeleteListTransaction = (id) => {
        let transaction = new DeleteList_Transaction(this, id);
        this.tps.addTransaction(transaction);
    }

    deleteList(id) {
        let iRemove = this.getListIndex(id);
        let removed = this.top5Lists.splice(iRemove, 1);
        this.currentList = null;
        this.view.clearWorkspace();
        this.view.updateRemovedList(id);
        this.view.unhighlightList(id);
        this.saveLists();
        this.view.refreshLists(this.top5Lists);
        this.view.enableButton("undo-button");
        this.view.disableButton("close-button");
        return removed;
    }

    addList(id, list) {
        this.top5Lists.push(list.pop());
        this.sortLists();
        this.view.updateAllList(this, this.top5Lists.length);
        this.saveLists();
        this.view.enableButton("undo-button");
    }

    moveItem(i1, i2) {
        this.view.enableButton("undo-button");
    }

    // SIMPLE UNDO/REDO FUNCTIONS
    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    close() {
        if (this.hasCurrentList()) {
            this.view.clearWorkspace();
            this.view.unhighlightList(this.currentList.id);
            this.currentList = null;
            this.tps.clearAllTransactions();
        }
        this.view.updateToolbarButtons(this);
    }
}