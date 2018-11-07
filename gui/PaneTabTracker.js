function PaneTabTracker(fileFieldParent, path) {
    this.activePane = new Pane(path);
    this.panes = [this.activePane];
    this.element = fileFieldParent;

    fileFieldParent.appendChild(this.activePane.fileField);
};

PaneTabTracker.prototype.folder = function () {
    return this.activePane.activeTab.folder;
};

PaneTabTracker.prototype.refresh = function () {
    for (let pane of this.panes) {
        pane.refresh();
    }
};

PaneTabTracker.prototype.addPane = function (path) {
    let newPane = new Pane(path);
    this.panes.push(newPane);
    newPane.refresh();
    this.element.appendChild(newPane.fileField);
    adjustFileFieldParentCss();
};

PaneTabTracker.prototype.findPane = function (node) {
    for (let pane of this.panes) {
        if ($(node).parents().find('.fileField')[0] == pane.fileField) {
            return pane;
        }
    }
};

PaneTabTracker.prototype.findTab = function (node) {
    let pane = this.findPane(node);
    for (let tab of pane.tabs) {
        if (tab.element = node) {
            return tab;
        }
    }
};
