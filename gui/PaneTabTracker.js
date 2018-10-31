function PaneTabTracker(fileFieldParent, path) {
    this.panes = [];
    this.activePane = null; // will point to an entry in this.panes

    for (let paneElement of $(fileFieldParent).find('.fileField')) {
        this.panes.push(new Pane(paneElement, path));
    }
    this.activePane = this.panes[0];
}

PaneTabTracker.prototype.folder = function () {
    return this.activePane.activeTab.folder;
};

PaneTabTracker.prototype.refresh = function () {
    for (let pane of this.panes) {
        pane.refresh();
    }
};
