const os = require('os')

import { getStartupSettings } from "./js/settingsManager.ts"
import { setInitListeners } from "./js/EventListeners.js"
import { loadDefaultIcons } from "./js/iconSettings.js"
import { loadLocations, loadExternalProgramList } from "./js/backend.js"
import PaneTracker from "./js/PaneTracking/PaneTracker"
import SelectedFiles from "./js/SelectedFiles.ts"
import { updateGuiFiles } from "./js/updater"

function init() {
    settings = getStartupSettings();
	selectedFiles = new SelectedFiles();
    setInitListeners();
    loadDefaultIcons();

    let openingPath = "";
	if (settings.homeFolder) {
      	openingPath = settings.homeFolder;
    } else {
        openingPath = os.homedir();
    }

    let fileFieldParent = document.getElementById('fileFieldParent');
    Tracker = new PaneTracker(fileFieldParent, openingPath, updateGuiFiles);
    Tracker.refresh();
     

    loadExternalProgramList();
    loadLocations();
}

init();
