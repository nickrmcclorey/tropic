const fs = require("fs")
import SystemI from "./SystemI.ts";

class LinuxSystem implements SystemI {

	deleteFile(files: string[]) {
		console.log(files)
		for (let file of files)
			fs.unlinkSync(file)
	}

	readDirectory(path: string) {
	
	}
}

export default LinuxSystem
