const fs = require("fs")
const pathModule = require("path")
const os = require("os")
const { execFile } = require("child_process")

import SystemI from "./SystemI";
import UnixSystem from "./UnixSystem";

class LinuxSystem extends UnixSystem implements SystemI {

	deleteFiles(files: string[]): Promise<any> {
		return new Promise((resolve, reject) => {
			Promise.all(files.map(this.deleteFile))
				.then(resolve)
				.catch(reject)
		})
	}

	openFile(path: string): void {
		execFile ('xdg-open', [path], console.log);	
	}

	// linux has a trash folder at ~/.local/share/Trash
	// files are moved to the "files" folder while metadata is stored in the "info" folder
	private deleteFile(filePath: string): Promise<void> {
		let fileName  = pathModule.basename(filePath);
		let trashPath = pathModule.join(os.homedir(), '.local/share/Trash');
		let destination = pathModule.join(trashPath, 'files', fileName)

		// move file to trash folder
		fs.renameSync(filePath, destination);

		let now = new Date();
		let format = (n: string) => (n.length == 2) ? n : '0' + n;
		let seconds = format(now.getSeconds().toString());
		let minutes = format(now.getMinutes().toString());
		let hours = format(now.getHours().toString());
		let month = format(now.getMonth().toString());
		let day = format(now.getDay().toString());
		let year = now.getFullYear().toString();

		let trashInfoFile = pathModule.join(trashPath, 'info', fileName + '.trashinfo')
		let trashInfoContents = '[Trash Info]\n' + 
			'Path=' + filePath + '\n' +
			`DeletionDate=${year}-${month}-${day}T${hours}:${minutes}:${seconds}\n`

		return new Promise((resolve, reject) => {
			fs.writeFile(trashInfoFile, trashInfoContents, (e:any) => {
				resolve()
			});
		})
	}

	isModifierKeyPressed(e: KeyboardEvent | MouseEvent): boolean {
		return e.ctrlKey;
	}

}

export default LinuxSystem
