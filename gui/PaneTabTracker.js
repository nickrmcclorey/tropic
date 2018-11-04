function PaneTabTracker(fileFieldParent, path) {
    this.activePane = new Pane(path);
    this.panes = [this.activePane];
    this.element = fileFieldParent;

    fileFieldParent.appendChild(this.activePane.fileField);
}

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

PaneTabTracker.prototype.findPane = function (event) {
    for (let pane of this.panes) {
        if (event.path.includes(pane.fileField)) {
            return pane;
        }
    }
};
