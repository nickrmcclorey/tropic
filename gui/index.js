import { fileExtension } from "./js/pure.js"
import { getStartupSettings } from "./js/settingsManager.js"
import { setInitListeners } from "./js/EventListeners.js"
import { loadDefaultIcons, loadExternalProgramList } from "./js/backend.js"
import { PaneTabTracker } from "./js/PaneTabTracker.js"

function init() {
    settings = getStartupSettings();
    setInitListeners();
	templates = document.getElementById('templates');
	templates.parentNode.removeChild(templates);
    templates.removeAttribute('hidden');
    loadDefaultIcons();

    let openingPath = "";
    if (Object.keys(settings).includes('homeFolder')) {
      	openingPath = settings.homeFolder;
    } else {
        openingPath = os.homedir();
    }

    let fileFieldParent = document.getElementById('fileFieldParent');
    Tracker = new PaneTabTracker(fileFieldParent, openingPath);
 	Tracker.refresh();

    loadExternalProgramList();
    // loadLocations();
}

init();
