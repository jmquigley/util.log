import autobind from "autobind-decorator";
import * as fs from "fs-extra";
import {sprintf} from "sprintf-js";
import {join} from "util.join";
import {matches} from "util.matches";
import {timestamp as ts} from "util.timestamp";
import * as uuid from "uuid";

const chalk = require("chalk");
const debugEntry = require("debug");

const instances = new Map();

enum Level {
	DEBUG,
	INFO,
	WARN,
	ERROR,
	EVENT
}

export interface LoggingConfig {
	colors?: boolean;
	dateFormat?: string;
	debug?: boolean;
	directory?: string;
	enabled?: boolean;
	eventFile?: string;
	messageFile?: string;
	namespace?: string;
	nofile?: boolean;
	nsWidth?: number;
	toConsole?: boolean;
	useConsoleDebug?: boolean;
}

export class Logger {
	public static instance(config?: LoggingConfig) {
		config = Object.assign(
			{
				colors: true,
				dateFormat: "%Y-%m-%d @ %H:%M:%S:%L",
				debug: false,
				directory: "./logs",
				enabled: true,
				eventFile: "events.log",
				messageFile: "messages.log",
				namespace: "default",
				nofile: false,
				nsWidth: -1,
				toConsole: true,
				useConsoleDebug: false
			},
			config
		);

		if (config.namespace == null) {
			config.namespace = uuid.v4();
		}

		let inst: Logger = instances.get(config.namespace);
		if (inst == null) {
			inst = new Logger();
			instances.set(config.namespace, inst);
		}

		inst.configure(config);
		return inst;
	}

	private _debug: any = null;
	private _config: LoggingConfig = null;
	private _eventFile: string = null;
	private _messageFile: string = null;

	private constructor() {}

	get config(): LoggingConfig {
		return this._config;
	}

	set config(val: LoggingConfig) {
		this._config = val;
	}

	get namespace(): string {
		return this._config.namespace;
	}

	public toString() {
		const a = [JSON.stringify(this.config, null, 4), "\ninstances:"].concat(
			[...instances.keys()].map((it) => ` - ${it}`),
			""
		);

		return a.join("\n");
	}

	@autobind
	public debug(...args: any[]): string {
		if (this.config.debug) {
			const {str, arr} = this.getArgs(args);
			return this.showMessage(str, Level.DEBUG, arr);
		}

		return "";
	}

	@autobind
	public error(...args: any[]): string {
		const {str, arr} = this.getArgs(args);
		return this.showMessage(str, Level.ERROR, arr);
	}

	@autobind
	public event(id: string, ...args: any[]): string {
		// Strip off the ID argument before processing
		const {str, arr} = this.getArgs([...args]);

		if (id == null) {
			id = "NULL_EVENT_ID";
		}

		let formattedMessage: string;
		if (this.config.colors) {
			formattedMessage = `${chalk.white.bgBlue(id)}:: ${str}`;
		} else {
			formattedMessage = `${id}:: ${str}`;
		}

		return this.showMessage(formattedMessage, Level.EVENT, arr);
	}

	@autobind
	public info(...args: any[]): string {
		const {str, arr} = this.getArgs(args);
		return this.showMessage(str, Level.INFO, arr);
	}

	@autobind
	public warn(...args: any[]): string {
		const {str, arr} = this.getArgs(args);
		return this.showMessage(str, Level.WARN, arr);
	}

	@autobind
	public warning(...args: any[]): string {
		const {str, arr} = this.getArgs(args);
		return this.showMessage(str, Level.WARN, arr);
	}

	/**
	 * Takes the input message string and searches for argument parameters.
	 * It then compares it to the argument count.  If they do not match,
	 * then an exception is thrown.  This is used to validate input into
	 * the logger and prevent issues around mismatched argument parameters.
	 * If a mismathch is found, then an exception is thrown.
	 * @param str {string} - the input message to the logger.
	 * @param args {any[]} - the possible dynamic input parameters passed
	 * to the log message.
	 */
	private checkParamCount(str: string, args: any[]) {
		if (str) {
			// This regex will match %{alphanum}, but ignore %%{alphanum}
			// The %% is used in a string to ignore the % as a place val
			const totalMatches = matches(str, /(?<!%)%{1}[\w\.+-]+(?!%)/g);

			if (totalMatches.length !== args.length) {
				throw new Error(
					`Invalid number of log message parameters (${totalMatches.length}/${args.length}) "${str}"`
				);
			}
		}
	}

	/**
	 * Allows the user to override the default configuration for the simple logger.
	 * See the LoggingConfig interface for valid options.
	 * @param config {LoggingConfig} optional argumets to override the default logger
	 */
	private configure(config?: LoggingConfig) {
		this.config = config;

		if (this.config.colors) {
			chalk.enabled = true;
		}

		if (!this.config.nofile) {
			if (!fs.existsSync(this.config.directory)) {
				fs.mkdirSync(this.config.directory);
			}

			if (this.config.messageFile != null) {
				this._messageFile = join(
					this.config.directory,
					this.config.messageFile
				);
				if (!fs.existsSync(this._messageFile)) {
					fs.writeFileSync(this._messageFile, "");
				}
			}

			if (this.config.eventFile != null) {
				this._eventFile = join(
					this.config.directory,
					this.config.eventFile
				);
				if (!fs.existsSync(this._eventFile)) {
					fs.writeFileSync(this._eventFile, "");
				}
			}
		}

		this._debug = debugEntry(config.namespace);
	}

	/**
	 * Convenience method for processing and sanitizing the arguments passed into
	 * each of the loging functions
	 * @param inp {any} a reference to a javascript arguments object
	 */
	private getArgs(inp: any): any {
		return {
			str: inp.length >= 1 ? inp[0] : "",
			arr: (inp.length > 1 ? [...inp].slice(1) : []).map((it) => {
				if (typeof it !== "function") {
					return it;
				} else {
					return it.toString();
				}
			})
		};
	}

	/**
	 * Internal function that takes the details of a message and formats the logging
	 * output that will be sent to the log and/or the console.  It uses the format:
	 *
	 *     [LEVEL] @ {timestamp}: {message}
	 *
	 * This function checks to see if the enviornment has been configured.  If it has
	 * not, then it uses the default options.  The function will check the input
	 * message and count the variable arguments to the message.  If they do not
	 * match, then an error exception will be thrown from the logger.
	 *
	 * @param message {string} the string passed to output (sprintf)) functions.
	 * @param level {Levels} the logging level requested.
	 * @param args {any[]} An array of arguments passed to the sprintf function.
	 * @returns {str} the message that was written/displayed
	 */
	private showMessage(message: string, level: Level, args: any[]): string {
		if (!this.config.enabled) {
			return "";
		}

		this.checkParamCount(message, args);

		const nsWidth = this.config.nsWidth;
		let timestamp = ts({dateFormat: this.config.dateFormat});
		let levelStr = String(level);
		let nsFormat: string = "%s";
		let namespace: string = this.config.namespace.trim();

		if (nsWidth > 0) {
			nsFormat = `%' -${nsWidth}s`;
			namespace = namespace.substr(0, nsWidth);
		}
		namespace = sprintf(nsFormat, namespace);

		switch (level) {
			case Level.DEBUG:
				levelStr = this.config.colors ? chalk.gray("DEBUG") : "DEBUG";
				break;

			case Level.INFO:
				levelStr = this.config.colors ? chalk.green("INFO ") : "INFO ";
				break;

			case Level.WARN:
				levelStr = this.config.colors ? chalk.yellow("WARN ") : "WARN ";
				break;

			case Level.ERROR:
				levelStr = this.config.colors ? chalk.red("ERROR") : "ERROR";
				break;

			case Level.EVENT:
				levelStr = this.config.colors ? chalk.blue("EVENT") : "EVENT";
				break;
		}

		if (this.config.colors) {
			timestamp = chalk.cyan(timestamp);
			namespace = chalk.magenta(namespace);
		}

		let conMessage = `[${levelStr}] ${timestamp} [${namespace}] ~> ${message}`;
		const logMessage = sprintf(
			conMessage.replace(/%[OoJ]/g, "%j"),
			...args
		);

		if (!this.config.nofile || this.config.directory == null) {
			if (
				level === Level.EVENT &&
				this._eventFile != null &&
				fs.existsSync(this._eventFile)
			) {
				fs.appendFileSync(this._eventFile, logMessage + "\n");
			}

			if (this._messageFile != null && fs.existsSync(this._messageFile)) {
				fs.appendFileSync(this._messageFile, logMessage + "\n");
			}
		}

		if (this.config.toConsole) {
			if (
				(level === Level.DEBUG || level === Level.EVENT) &&
				!this._config.useConsoleDebug
			) {
				conMessage = `${timestamp} ~> ${message}`;
				this._debug(conMessage, ...args);
			} else {
				// The console doens't accept the %j/%J, so replace it with one it can (%O)
				conMessage = conMessage
					.replace(/%J/g, "%O")
					.replace(/%j/g, "%o");

				if (level === Level.ERROR) {
					console.error(conMessage, ...args);
				} else {
					console.log(conMessage, ...args);
				}
			}
		}

		return logMessage;
	}
}

export default Logger;
