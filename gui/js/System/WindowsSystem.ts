const pathModule = require('path')
const {exec} = require('child_process');
const sudo = require('sudo-prompt');

import SystemI from "./SystemI"
import { appPath, cleanPath } from "../settingsManager"

class WindowsSystem implements SystemI {
	
	deleteFiles(files: string[]): Promise<void> {

		return new Promise((resolve, reject) => {
			let pathToExe = cleanPath(pathModule.join(appPath(), "gui/programs/recycle/recycle.exe"));
			let filesToDelete = cleanPath(files.join(' '));
			exec(pathToExe + ' ' + filesToDelete, (error: any) => {
				if (error) {
					console.log(error);
					reject()
				} else {
					resolve()
				}
			});
		})
	}
	
	openFile(path: string): void {
		let afterC = path.substr(path.indexOf('\\')+1);
        exec('start C:\\"'+afterC + '"');
	}
	
	moveCommand(src: string[], dest: string, overwrite: boolean): string {
		if (src.length <= 0) throw "No src files specified in move command";	

		return `move ${src[0]} ${dest}`
	}
	
	copyCommand(src: string[], dest: string): string {
		if (src.length <= 0) throw "No src files specified in copy command";

		let commands = [];
		for (let file of src) {
			commands.push(`copy ${src} ${dest}`)
		}
		return commands.join(' & ')
	}

	isModifierKeyPressed(e: KeyboardEvent | MouseEvent): boolean {
		return e.ctrlKey;
	}

}

export default WindowsSystem
