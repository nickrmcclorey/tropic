import Folder from "./Folder"

class Tab {

    folder: Folder;
    element: HTMLElement;

    constructor(path: string, element: HTMLElement) {
        this.folder = new Folder(path)
        this.element = element
    }
}

export default Tab
