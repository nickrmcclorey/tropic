function Active(field) {
    this.fileField = field;
    console.log(this.fileField);
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
};

Active.prototype.tabBar = function () {
    return this.fileField.children[0];
}
