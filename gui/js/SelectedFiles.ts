const pathModule = require("path")

class File {
    path: string
    isDirectory: boolean
    li: HTMLElement
}

class SelectedFiles {
    pendingAction:string = null;
    tentative:any = [];
    locked:any = [];

    addTentative(path: string, isDirectory: boolean, li: HTMLElement) {
    let objToPush = {
            "path": pathModule.resolve(path),
            "isDirectory": isDirectory,
            "li": li
        }; // end of obj

        if (!this.tentative.includes(objToPush)) {
            this.tentative.push(objToPush);
        }
    };

    lockSelection(copyOrPaste: string) {
        this.pendingAction = copyOrPaste;
        this.locked = this.tentative;
    };

    tentativeContains(liToCheck: HTMLElement) {
        for (let entry of this.tentative) {
            if (entry.li == liToCheck) {
                return true;
            }
        }
        return false;
    }

    tentativeRemove(liToRemove: HTMLElement) {
        for (let k in this.tentative) {
            // when we find the index, we remove the selected file
            if (this.tentative[k].li == liToRemove) {
                this.tentative.splice(k, 1);
                return;
            }
        }
    }

    tentativePaths() {
        let pathArray = [];
        for (let file of this.tentative) {
            pathArray.push(file.path)
        }
        return pathArray;
    };

}

export default SelectedFiles	
