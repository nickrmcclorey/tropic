import LinuxSystem from "./LinuxSystem"
import MacSystem from "./MacSystem";
import WindowsSystem from "./WindowsSystem"

declare var process: any;

abstract class SystemI {
	abstract deleteFiles(files: string[]): Promise<any>;
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
