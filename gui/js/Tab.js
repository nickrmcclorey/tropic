import Folder from "./Folder.js"
import { handleClick } from "./backend.js"

function Tab(path, tabElement) {
    this.element = tabElement
    this.folder = new Folder(path);
}


// called by the tab
function changeTab(e) {
    if (e.target.classList.contains('label')) {
        handleClick(e);
        Tracker.activePane.setActiveTab(this);
        Tracker.refresh();
    }
}


function addTab(e) {
    handleClick(e);

    // navigate to the tabBar with all the tabs in it
    // create new tab
    let newTab = templates.getElementsByClassName('tab')[0].cloneNode(true);
    newTab.addEventListener('click', changeTab, false);

    // add tab button must stay on the right
    let tabBar = Tracker.activePane.fileField.getElementsByClassName('tabBar')[0];
    let path = Tracker.folder().path;
    Tracker.activePane.tabs.push(new Tab(path, newTab));
    Tracker.activePane.setActiveTab(newTab);
    tabBar.insertBefore(newTab, e.target);
    Tracker.refresh();
}


function eraseTab(e) {
    handleClick(e);
    Tracker.removeTab.bind(PaneTabTracker)(e);
    if (Tracker.activePane.tabs.length <= 0) {
        let elementToDelete = Tracker.activePane.fileField;
        elementToDelete.parentNode.removeChild(elementToDelete);
        Tracker.activePane = Tracker.panes[0];
    }
    adjustFileFieldParentCss();
}

export default Tab
export {
	addTab,
	eraseTab,
	changeTab
}
