import Tab from "./Tab.ts"
import Folder from "./Folder.ts"
import { updateGuiFiles } from "./updater.js"

declare var templates: HTMLElement;

class Pane {
    fileField: any
    pathBox: any
    fileList: any;
    tabs: Tab[];
    activeTab: Tab;

    constructor(path: string) {
        this.fileField = templates.getElementsByClassName('fileField')[0].cloneNode(true); // html element
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

    refresh(fallbackPath: string): void {
        // this.activeTab.folder = new Folder(this.activeTab.folder.path);
        this.activeTab.folder = new Folder(this.activeTab.folder.path);
        this.activeTab.folder.read().then(() => {
            updateGuiFiles(this.activeTab.folder, this);
        }).catch(() => {
            if (fallbackPath) {
                this.activeTab.folder = new Folder(fallbackPath);
                this.activeTab.folder.read().then(() => {
                    updateGuiFiles(this.activeTab.folder, this);
                });
            }
        });

    }

    path() {
        return this.activeTab.folder.path;
    };
    
    
    cd(path: string): void {
        let newFolder = new Folder(path);
        newFolder.read().then(() => {
            this.activeTab.folder = newFolder	
            
            updateGuiFiles(this.activeTab.folder, this)
        })
    }


};


export default Pane
