const fs = require("fs")
const pathModule = require('path')
const sudo = require('sudo-prompt')

import SystemI from "./SystemI"
import { unlinkSync } from "fs";
import { appPath, cleanPath } from "./settingsManager.js"
import { execFile, exec } from "child_process";

class MacSystem implements SystemI {

	deleteFiles(files: string[]): Promise<void> {
        let pathToExe = cleanPath(pathModule.join(appPath(), "gui/programs/macos-trash"));
        let command = pathToExe + ' ' + files.join(' ')

        return new Promise((resolve, reject) => {
            exec(command, (error: any, stdout: any, stderr: string) => {
                if (error && stderr.includes('permission')) {
                    const options = {
                        name: "Tropic"
                    }

                    sudo.exec(command, options, (error: any, stdout: string, stderr: string) => {
                        if (error) {
                            reject();
                        } else {
                            resolve()
                        }
                    })
                } else if (error) {
                    reject()
                } else {
                    resolve()
                }
            });
        })
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

    moveCommand(src: string[], dest: string, overwrite: boolean): string {
        if (src.length <= 0) throw "No src files specified in move command";	

		return `mv ${src.join(' ')} ${dest}`
	}

	copyCommand(src: string[], dest: string): string {
		if (src.length <= 0) throw "No src files specified in copy command";

		return `cp ${src.join(' ')} ${dest}`
	}
}

export default MacSystem
