function SelectedFiles() {
    this.pendingAction = null;
    this.tentative = [];
    this.locked = [];

}


SelectedFiles.prototype.addTentative = function (path, li_el) {
    let objToPush = {
        "path": pathModule.resolve(path),
        "li":li_el
    }; // end of obj
    this.tentative.push(objToPush);

};

SelectedFiles.prototype.lockSelection = function (copyOrPaste) {
    this.pendingAction = copyOrPaste;
    this.locked = this.tentative;
};

SelectedFiles.prototype.tentativeContains = function(li) {
    for (entry of this.tentative) {
        if (entry.li == liToCheck) {
            return true;
        }
    }
    return false;
}
