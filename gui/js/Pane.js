function Pane(path) {
    this.fileField = $(templates).find('.fileField')[0].cloneNode(true); // html element
    this.pathBox = $(this.fileField).find('.pathBox')[0];
    this.fileList = $(this.fileField).find('.fileList')[0];
    this.tabs = []; // array of Tabs as defined in Tab.js
    this.activeTab = null; // will point to a tab in this.tabs


    let tabElement = $(this.fileField).find('.tab')[0];
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
            $(this.activeTab.element).removeClass('activeTab');
            this.activeTab = this.tabs[index];
            $(this.activeTab.element).addClass('activeTab');
        } else {
            console.log('couldn\'t find tab to select')
        }
    }

    this.refresh = function () {
        // this.activeTab.folder = new Folder(this.activeTab.folder.path);
        this.activeTab.folder = new Folder(this.activeTab.folder.path);
        this.activeTab.folder.read().then(() => {
            updateGuiFiles(this.activeTab.folder, this);
        });

    }
}


Pane.prototype.path = function () {
    return this.activeTab.folder.path;
};


Pane.prototype.cd = function (path) {
    this.activeTab.folder = new Folder(path);
    this.refresh();
};
