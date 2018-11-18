function PaneTabTracker(fileFieldParent, path) {
    this.activePane = new Pane(path);
    this.panes = [this.activePane];
    this.element = fileFieldParent;

    fileFieldParent.appendChild(this.activePane.fileField);


    this.removeTab = (event) => {
        console.log(this);
        let index = Tracker.tabIndex(event.target.parentNode);
        let pane = Tracker.findPane(event.target);
        $(pane.tabs[index].element).remove();
        pane.tabs.splice(index, 1);
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
            if ($(node).parents().find('.fileField')[0] == pane.fileField) {
                return pane;
            }
        }
    };

    this.tabIndex = function (node) {
        let pane = this.findPane(node);
        for (let k in pane.tabs) {
            if (pane.tabs[k].element = node) {
                return k;
            }
        }
    };

    this.findTab = function (node) {
        let index = this.tabIndex(node);
        return this.findPane(node).tabs[index];
    };
};
