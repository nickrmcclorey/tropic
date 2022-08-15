import Tab from "./Tab"
import Folder from "./Folder"


class Pane {
    fileField: any
    pathBox: HTMLInputElement
    fileList: any;
    tabs: Tab[];
    activeTab: Tab;

    constructor(path: string, private updateUiFunction: (pane: Pane) => void) {
        this.fileField = document.getElementById('templates').getElementsByClassName('fileField')[0].cloneNode(true)
        this.pathBox = this.fileField.getElementsByClassName('pathBox')[0];
        this.fileList = this.fileField.getElementsByClassName('fileList')[0];
        this.tabs = []; // array of Tabs as defined in Tab.js
    
    
        let tabElement = this.fileField.getElementsByClassName('tab')[0];
        this.tabs.push(new Tab(path, tabElement));
        this.activeTab = this.tabs[0];
        this.pathBox.value = path;
    }

    setActiveTab(tab: Element) {
        let index: number = -1;
        for (let k = 0; k < this.tabs.length; k++) {
            if (this.tabs[k].element == tab) {
                index = k
                break;
            }
        }

        if (index > -1) {
            this.activeTab.element.classList.remove('activeTab');
            this.activeTab = this.tabs[index];
            this.activeTab.element.classList.add('activeTab');
        } else {
            console.error('couldn\'t find tab to select')
        }
    }

    refresh(fallbackPath: string = ''): void {
        this.activeTab.folder = new Folder(this.activeTab.folder.path);
        // TODO: no one is using the fallback path
        try {
            this.updateUiFunction(this);
        } catch (error) {
            if (fallbackPath) {
                this.activeTab.folder = new Folder(fallbackPath);
                this.updateUiFunction(this);
            }
        }

    }

    path() {
        return this.activeTab.folder.path;
    };
    
    
    cd(path: string): void {
        let newFolder = new Folder(path);
        this.activeTab.folder = newFolder
        this.updateUiFunction(this)
    }

};


export default Pane
