const pathModule = require('path')
const {exec} = require('child_process');
const sudo = require('sudo-prompt');

import SystemI from "./SystemI"
import { appPath, cleanPath } from "./settingsManager.js"

declare var Tracker: any;
declare var selectedFiles: any;

class WindowsSystem implements SystemI {
	
	deleteFiles(files: string[]): void {
		let pathToExe = cleanPath(pathModule.join(appPath(), "gui/programs/recycle/recycle.exe"));
		let filesToDelete = cleanPath(files.join(' '));
		exec(pathToExe + ' ' + filesToDelete, (error: any) => {
			if (error)
			console.log(error);
            else
			Tracker.refresh();
		});
	}
	
	openFile(path: string): void {
		let afterC = path.substr(path.indexOf('\\')+1);
        exec('start C:\\"'+afterC + '"');
	}
	
	mvCommand(src: string, dest: string): string {
		return `move ${src} ${dest}`
	}
	
	copyCommand(src: string, dest: string): string {
		return `copy ${src} ${dest}`
	}
}

export default WindowsSystem
