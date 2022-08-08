const fs = require("fs")
const pathModule = require('path')

import SystemI from "./SystemI"
import { unlinkSync } from "fs";
import { execFile } from "child_process";

declare var Tracker: any;
declare var selectedFiles: any;

class MacSystem implements SystemI {

	deleteFiles(files: string[]): void {
        for (let file of files) {
            unlinkSync(file);
        }
	}

	openFile(path: string): void {
        execFile ('open', [path], (error, _, stderr) => {
            if (error) {
                if (stderr.includes('ApplicationNotFoundErr')) {
                    // TODO: notify user with toast
                    console.log("couldn't find program to open file")
                } else {
                    console.log(error)
                }
            }
        });	
	}

}

export default MacSystem