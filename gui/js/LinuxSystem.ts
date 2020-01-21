const fs = require("fs")
const pathModule = require("path")
const os = require("os")
import SystemI from "./SystemI.ts";

class LinuxSystem implements SystemI {

	deleteFiles(files: string[]) {
		console.log(files)
		for (let file of files) {
			this.deleteFile(file)
		}
	}

	private deleteFile(filePath: string) {
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

		fs.writeFile(trashInfoFile, trashInfoContents, (e:any) => {});
	}

	private deleteFolder(file: string) {}

	readDirectory(path: string) {
	
	}
}

export default LinuxSystem
