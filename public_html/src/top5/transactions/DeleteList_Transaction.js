import jsTPS_Transaction from "../../common/jsTPS.js"

export default class DeleteList_Transaction extends jsTPS_Transaction {
    constructor(initModel, initId) {
        super();
        this.model = initModel;
        this.id = initId;
        this.removed = [];
    }

    doTransaction() {
        this.removed = this.model.deleteList(this.id);
    }
    
    undoTransaction() {
        this.model.addList(this.id, this.removed);
    }
}