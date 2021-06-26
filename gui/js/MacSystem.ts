const { execFile } = require("child_process")
const trash = require("trash")

import SystemI from "./SystemI.js";

class MacSystem implements SystemI {

	deleteFiles(files: string[]): void {
		trash(files)
	}

	openFile(path: string): void {
		execFile ('open', [path], console.log);	
	}
}

export default MacSystem
