const pathModule = require('path')
const {exec} = require('child_process');
import SystemI from "./SystemI.ts"

declare var Tracker: any;
declare var selectedFiles: any;

class WindowsSystem implements SystemI {
	deleteFiles(files: string[]): void {
	
		let pathToExe = pathModule.join(__dirname, "/programs/recycle/recycle.exe");
		let filesToDelete = files.join(' ');
		exec(pathToExe + ' ' + filesToDelete, () => {
			Tracker.refresh();
		}, (error: any) => {
			console.log(error)
		});
	}

	openFile(path: string): void {
		let afterC = path.substr(path.indexOf('\\')+1);
        exec('start C:\\"'+afterC + '"');
	}

	readDirectory(path: string): void {	}	
}

export default WindowsSystem
