const os = require('os')

import { getStartupSettings } from "./js/settingsManager.js"
import { setInitListeners } from "./js/EventListeners.js"
import { loadDefaultIcons } from "./js/iconSettings.js"
import { loadLocations, loadExternalProgramList } from "./js/backend.js"
import { PaneTabTracker } from "./js/PaneTabTracker.ts"
import SelectedFiles from "./js/SelectedFiles.ts"

function init() {
    settings = getStartupSettings();
	selectedFiles = new SelectedFiles();
    setInitListeners();
	templates = document.getElementById('templates');
	templates.parentNode.removeChild(templates);
    templates.removeAttribute('hidden');
    loadDefaultIcons();

    let openingPath = "";
	if (settings.homeFolder) {
      	openingPath = settings.homeFolder;
    } else {
        openingPath = os.homedir();
    }

    let fileFieldParent = document.getElementById('fileFieldParent');
    Tracker = new PaneTabTracker(fileFieldParent, openingPath);
    // Tracker.refresh();
     

    loadExternalProgramList();
    loadLocations();
}

init();
