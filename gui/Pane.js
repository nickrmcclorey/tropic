function Pane(path) {
    this.fileField = $('#templates').find('.fileField')[0].cloneNode(true); // html element
    this.pathBox = $(this.fileField).find('.pathBox')[0];
    this.fileList = $(this.fileField).find('.fileList')[0];
    this.tabs = []; // array of Tabs as defined in Tab.js
    this.activeTab = null; // will point to a tab in this.tabs

    let tabElement = $(this.fileField).find('.tab')[0];
    this.tabs.push(new Tab(path, tabElement));
    this.activeTab = this.tabs[0];
    this.pathBox.value = this.path();
}

Pane.prototype.path = function () {
    return this.activeTab.folder.path;
};

Pane.prototype.refresh = function () {
    let folder = this.activeTab.folder;
    this.pathBox.value = folder.path;
    let elementToUpdate = this.fileList;
    folder.read().then(() => {
        updateGuiFiles(folder, elementToUpdate)
    });
}

Pane.prototype.cd = function (path) {
    this.activeTab.folder = new Folder(path);
    this.refresh();
};
