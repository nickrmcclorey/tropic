import LinuxSystem from "./LinuxSystem.ts"
import MacSystem from "./MacSystem.ts";
import WindowsSystem from "./WindowsSystem.ts"

declare var process: any;

abstract class SystemI {
	abstract deleteFiles(files: string[]): void;
	abstract openFile(path: string): any;
	abstract moveCommand(src: string[], dest: string, overwrite: boolean): string;
	abstract copyCommand(src: string[], dest: string): string;

	static instance: SystemI = SystemI.getCorrectSystem();
	static getCorrectSystem(): SystemI {
		if (process.platform == 'linux')
			return new LinuxSystem();
		if (process.platform == 'win32')
			return new WindowsSystem();
		if (process.platform == 'darwin')
			return new MacSystem();
		
		throw "System not Supported"
	}
}

export default SystemI
