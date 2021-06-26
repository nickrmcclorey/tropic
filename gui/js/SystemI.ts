import LinuxSystem from "./LinuxSystem.ts"
import WindowsSystem from "./WindowsSystem.ts"

declare var process: any;

abstract class SystemI {
	abstract deleteFiles(files: string[]): void;
	abstract openFile(path: string): any;

	static instance: SystemI = SystemI.getCorrectSystem();
	static getCorrectSystem() {
		if (process.platform == 'linux')
			return new LinuxSystem();
		if (process.platform == 'win32')
			return new WindowsSystem();
	}
}

export default SystemI
