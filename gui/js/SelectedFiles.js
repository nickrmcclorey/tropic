const pathModule = require("path")

function SelectedFiles() {
    this.pendingAction = null;
    this.tentative = [];
    this.locked = [];

}


SelectedFiles.prototype.addTentative = function (path, isDirectory, li) {
    let objToPush = {
        "path": pathModule.resolve(path),
        "isDirectory": isDirectory,
        "li": li
    }; // end of obj

    if (!this.tentative.includes(objToPush)) {
        this.tentative.push(objToPush);
    }
};


SelectedFiles.prototype.lockSelection = function (copyOrPaste) {
    this.pendingAction = copyOrPaste;
    this.locked = this.tentative;
};


SelectedFiles.prototype.tentativeContains = function(liToCheck) {
    for (let entry of this.tentative) {
        if (entry.li == liToCheck) {
            return true;
        }
    }
    return false;
}


SelectedFiles.prototype.tentativeRemove = function(liToRemove) {
    for (let k in this.tentative) {
        // when we find the index, we remove the selected file
        if (this.tentative[k].li == liToRemove) {
            this.tentative.splice(k, 1);
            return;
        }
    }
}


SelectedFiles.prototype.tentativePaths = function () {
    let pathArray = [];
    for (let file of this.tentative) {
        pathArray.push(file.path)
    }
    return pathArray;
};

export default SelectedFiles

	
