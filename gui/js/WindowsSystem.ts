const pathModule = require('path')
const {exec} = require('child_process');
import SystemI from "./SystemI.ts"

declare var Tracker: any;
declare var selectedFiles: any;

class WindowsSystem implements SystemI {
	deleteFiles(files: string[]) {
	
		let pathToExe = pathModule.join(__dirname, "/programs/recycle/recycle.exe");
		let filesToDelete = files.join(' ');
		exec(pathToExe + ' ' + filesToDelete, () => {
			Tracker.refresh();
		}, (error: any) => {
			console.log(error)
		});
	}

	readDirectory(path: string) {
	
	}	
}

export default WindowsSystem
