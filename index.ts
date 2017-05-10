'use strict';

import * as fs from 'fs-extra';
import * as path from 'path';
import {join} from 'util.join';
import {timestamp as ts} from 'util.timestamp';
import * as uuid from 'uuid';

const chalk = require('chalk');

const instances = new Map();

enum Level {
	DEBUG,
	INFO,
	WARN,
	ERROR,
	EVENT
}

export interface ILoggingConfig {
	colors?: boolean;
	dateFormat?: string;
	directory?: string;
	enabled?: boolean;
	eventFile?: string;
	messageFile?: string;
	namespace?: string;
	toConsole?: boolean;
}

export class Logger {

	public static instance(config?: ILoggingConfig) {
		config = Object.assign({
			colors: true,
			dateFormat: '%Y-%m-%d @ %H:%M:%S:%L',
			directory: './logs',
			enabled: true,
			eventFile: 'events.log',
			messageFile: 'messages.log',
			namespace: 'default',
			toConsole: false
		}, config);

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

	private _messageFile: string = null;
	private _eventFile: string = null;
	private _configured: boolean = false;
	private _config: ILoggingConfig = null;

	private constructor() {
	}

	get config(): ILoggingConfig {
		return this._config;
	}

	set config(val: ILoggingConfig) {
		this._config = val;
	}

	get namespace(): string {
		return this._config.namespace;
	}

	public toString() {
		const a = [
			JSON.stringify(this.config, null, 4),
			'\ninstances:'
		].concat([...instances.keys()].map(it => ` - ${it}`), '');

		return a.join('\n');
	}

	public debug(str: string, filename?: string, self = this): string {
		return self.message(str, Level.DEBUG, filename);
	}

	public error(str: string, filename?: string, self = this): string {
		return self.message(str, Level.ERROR, filename);
	}

	public event(str: string, id?: string, filename?: string, self = this): string {
		if (id != null) {
			str = `${id} => ${str}`;
		}

		return self.message(str, Level.EVENT, filename);
	}

	public info(str: string, filename?: string, self = this): string {
		return self.message(str, Level.INFO, filename);
	}

	public warn(str: string, filename?: string, self = this): string {
		return self.warning(str, filename);
	}

	public warning(str: string, filename?: string, self = this): string {
		return self.message(str, Level.WARN, filename);
	}

	/**
	 * Allows the user to override the default configuration for the simple logger.
	 * See the ILoggingConfig interface for valid options.
	 * @param config {ILoggingConfig} optional argumets to override the default logger
	 * @param self {Logger} a reference to the objects this pointer renamed to self.
	 */
	private configure(config?: ILoggingConfig, self = this) {
		self.config = config;

		if (self.config.colors) {
			chalk.enabled = true;
		}

		if (!fs.existsSync(self.config.directory)) {
			fs.mkdirSync(self.config.directory);
		}

		if (self.config.messageFile != null) {
			self._messageFile = join(self.config.directory, self.config.messageFile);
			if (!fs.existsSync(self._messageFile)) {
				fs.writeFileSync(self._messageFile, '');
			}
		}

		if (self.config.eventFile != null) {
			self._eventFile = join(self.config.directory, self.config.eventFile);
			if (!fs.existsSync(self._eventFile)) {
				fs.writeFileSync(self._eventFile, '');
			}
		}

		self._configured = true;
	}

	/**
	 * Internal function that takes the details of a message and formats the logging
	 * output that will be sent to the log and/or the console.  It uses the format:
	 *
	 *     [LEVEL] @ {timestamp}: {message}
	 *
	 * This function checks to see if the enviornment has been configured.  If it has
	 * not, then it uses the default options.
	 *
	 * @param str {string} the string passed to output functions.
	 * @param level {Levels} the logging level requested.
	 * @param filename {string} the name of the module where the message originated
	 * @returns {str} the message that was written/displayed
	 */
	private message(str: string, level: Level, filename: string = '', self = this): string {

		if (!self.config.enabled) {
			return '';
		}

		let timestamp = ts({dateFormat: self.config.dateFormat});
		let	levelStr = String(level);

		if (self.config.colors) {
			switch (level) {
			case Level.DEBUG:
				levelStr = chalk.gray('DEBUG');
				break;

			case Level.INFO:
				levelStr = chalk.green('INFO ');
				break;

			case Level.WARN:
				levelStr = chalk.yellow('WARN ');
				break;

			case Level.ERROR:
				levelStr = chalk.red('ERROR');
				break;

			case Level.EVENT:
				levelStr = chalk.blue('EVENT');
				break;
			}

			timestamp = chalk.cyan(timestamp);
		}

		if (filename !== '' && filename != null) {
			filename = ` \{${path.basename(filename)}\}`;
		}

		const msg = `[${levelStr}] ${timestamp} ~> ${str}${filename}`;

		if (level === Level.EVENT && self._eventFile != null) {
			fs.appendFileSync(self._eventFile, msg + '\n');
		}

		if (self._messageFile != null) {
			fs.appendFileSync(self._messageFile, msg + '\n');
		}

		if (self.config.toConsole) {
			if (level === Level.ERROR) {
				console.error(msg);
			} else {
				console.log(msg);
			}
		}

		return msg;
	}
}

export default Logger;
