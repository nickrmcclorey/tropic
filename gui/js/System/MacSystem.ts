const pathModule = require('path')
const sudo = require('sudo-prompt')

import SystemI from "./SystemI"
import { appPath, cleanPath } from "../settingsManager"
import { execFile, exec } from "child_process";
import { createErrorToast } from "../toast"
import UnixSystem from "./UnixSystem";

class MacSystem extends UnixSystem implements SystemI {

	deleteFiles(files: string[]): Promise<void> {
        let pathToExe = cleanPath(pathModule.join(appPath(), "gui/programs/trash/macos-trash"));
        let command = pathToExe + ' ' + files.join(' ')
        console.log(command)

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
                    createErrorToast("Couldn't find program to open file")
                } else {
                    console.log(error)
                }
            }
        });	
	}

	isModifierKeyPressed(e: KeyboardEvent | MouseEvent): boolean {
        return e.metaKey
    }

}

export default MacSystem
