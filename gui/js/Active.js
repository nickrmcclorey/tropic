function Active(field, folder) {
    this.fileField = field;
}

Active.prototype.fileList = function () {
    return this.fileField.children[3];
};

Active.prototype.inputBox = function () {
    return this.fileField.children[1].children[2];
};

Active.prototype.tab = function () {

    // for each tab el
    for (tab of this.fileField.children[0].children) {
        if (tab.active) {
            return tab;
        }
    }
    console.log('method couldn\'t find the active tab')
    let newActiveTab = this.fileField.children[0].children[0];
    newActiveTab.active = true;
    return newActiveTab;
};

Active.prototype.tabBar = function () {
    return this.fileField.children[0];
}
