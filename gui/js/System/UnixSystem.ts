const fs = require("fs")
const pathModule = require("path")
const os = require("os")
const { execFile } = require("child_process")

import SystemI from "./SystemI";

abstract class UnixSystem implements SystemI {

	abstract deleteFiles(files: string[]): Promise<any>;
	abstract openFile(path: string): void;
    abstract isModifierKeyPressed(e: KeyboardEvent | MouseEvent): boolean;

	moveCommand(src: string[], dest: string, overwrite: boolean): string {
		if (src.length <= 0) throw "No src files specified in move command";

		return `mv ${src.join(' ')} ${dest}`
	}

	copyCommand(src: string[], dest: string): string {
		if (src.length <= 0) throw "No src files specified in copy command";

		return `cp ${src.join(' ')} ${dest}`
	}


}

export default UnixSystem
