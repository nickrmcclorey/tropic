import Folder from "./Folder"
import Pane from "./Pane"
const pathModule = require('path')
import { adjustFileFieldParentCss } from "./updater.js"

declare var Tracker: any  

class PaneTabTracker {

    activePane: Pane
    panes: Pane[]
    element: HTMLElement

    constructor(fileFieldParent: HTMLElement, path: string) {
        this.activePane = new Pane(path);
        this.element = fileFieldParent;
        this.panes = [this.activePane];
    
        this.element.appendChild(this.activePane.fileField);
        this.activePane.refresh();
    }

    removeTab(event: any): void {
        let tabIndex = this.tabIndex(event);
        let pane = Tracker.activePane;
        let activeTabWasErased = (event.target.parentNode == this.activePane.activeTab.element);
        let el = pane.tabs[tabIndex].element.remove()
        pane.tabs.splice(tabIndex, 1);

        if (pane.tabs.length <= 0) {
            this.panes.splice(this.panes.indexOf(pane), 1);
        } else if (activeTabWasErased) {
            pane.setActiveTab(pane.tabs[0].element);
        }
    }

    folder(): Folder {
        return this.activePane.activeTab.folder;
    };

    refresh(): void {
        for (let pane of this.panes) {
            pane.refresh();
        }
    };

    findPane = function (node: any) {
        for (let pane of this.panes) {
            for (let parent of node.path) {
                if (parent == pane.fileField) {
                    return pane;
                }
            }
            console.error('could\'t find pane');
        }
    };

    addPane(path: string) {
        let newPane = new Pane(path);
        this.panes.push(newPane);
        newPane.refresh();
        this.element.appendChild(newPane.fileField);
        adjustFileFieldParentCss();
    };

    tabIndex(e: any): number {
        let node = e.target;
        if (node.parentNode.classList.contains('tab')) {
            node = node.parentNode;
        }

        let pane = this.activePane;
        for (let k = 0; k < pane.tabs.length; k++) {
            if (pane.tabs[k].element == node) {
                return k;
            }
        }
    };

    findTab = function (node: HTMLElement) {
        let index = this.tabIndex(node);
        return this.findPane(node).tabs[index];
    };

};

export { PaneTabTracker }
