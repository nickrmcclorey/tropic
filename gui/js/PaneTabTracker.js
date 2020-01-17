import Pane from "./Pane.js"

function PaneTabTracker(fileFieldParent, path) {
    this.activePane = new Pane(path);
    this.panes = [this.activePane];
    this.element = fileFieldParent;

    fileFieldParent.appendChild(this.activePane.fileField);


    this.removeTab = (event) => {
        let tabIndex = this.tabIndex(event);
        let pane = Tracker.activePane;
        let activeTabWasErased = (event.target.parentNode == this.activePane.activeTab.element);
        $(pane.tabs[tabIndex].element).remove();
        pane.tabs.splice(tabIndex, 1);

        if (pane.tabs.length <= 0) {
            this.panes.splice(this.panes.indexOf(pane), 1);
        } else if (activeTabWasErased) {
            pane.setActiveTab(pane.tabs[0].element);
        }
    };

    this.folder = function () {
        return this.activePane.activeTab.folder;
    };

    this.refresh = function () {
        for (let pane of this.panes) {
            pane.refresh();
        }
    };

    this.addPane = function (path) {
        let newPane = new Pane(path);
        this.panes.push(newPane);
        newPane.refresh();
        this.element.appendChild(newPane.fileField);
        adjustFileFieldParentCss();
    };

    this.findPane = function (node) {
        for (let pane of this.panes) {
            for (let parent of $(node).parents()) {
                if (parent == pane.fileField) {
                    return pane;
                }
            }
            console.error('could\'t find pane');
        }
    };

    this.tabIndex = function (e) {
        let node = e.target;
        if (node.parentNode.classList.contains('tab')) {
            node = node.parentNode;
        }

        let pane = this.activePane;
        for (let k in pane.tabs) {
            if (pane.tabs[k].element == node) {
                return k;
            }
        }
    };

    this.findTab = function (node) {
        let index = this.tabIndex(node);
        return this.findPane(node).tabs[index];
    };
};

export { PaneTabTracker }
