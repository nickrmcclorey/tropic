import Tab from "./Tab.js"
import Folder from "./Folder.js"
import { updateGuiFiles } from "./updater.js"


function Pane(path) {
    this.fileField = templates.getElementsByClassName('fileField')[0].cloneNode(true); // html element
    this.pathBox = this.fileField.getElementsByClassName('pathBox')[0];
    this.fileList = this.fileField.getElementsByClassName('fileList')[0];
    this.tabs = []; // array of Tabs as defined in Tab.js
    this.activeTab = null; // will point to a tab in this.tabs


    let tabElement = this.fileField.getElementsByClassName('tab')[0];
    this.tabs.push(new Tab(path, tabElement));
    this.activeTab = this.tabs[0];
    this.pathBox.value = this.path();

    this.setActiveTab = function(tab) {
        let index = -1;
        for (let k in this.tabs) {
            if (this.tabs[k].element == tab) {
                index = k;
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

    this.refresh = function (fallbackPath) {
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
}


Pane.prototype.path = function () {
    return this.activeTab.folder.path;
};


Pane.prototype.cd = function (path) {
	let newFolder = new Folder(path);
	newFolder.read().then(() => {
		this.activeTab.folder = newFolder	
		
		updateGuiFiles(this.activeTab.folder, this)
	})
};


export default Pane
