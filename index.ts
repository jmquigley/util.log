'use strict';

import * as fs from 'fs-extra';
import * as path from 'path';
import {join} from 'util.join';
import {timestamp as ts} from 'util.timestamp';

const chalk = require('chalk');

enum Level {
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
	events?: string;
	messages?: string;
	toConsole?: boolean;
}

export class Logger {

	private _messages: number = null;
	private _events: number = null;
	private _configured: boolean = false;
	private _opts: ILoggingConfig = null;

	constructor() {
		this._opts = {
			colors: true,
			dateFormat: '%Y-%m-%d @ %H:%M:%S:%L',
			directory: './logs',
			enabled: true,
			events: 'events.log',
			messages: 'messages.log',
			toConsole: false
		};
	}

	/**
	 * Allows the user to override the default configuration for the simple logger.
	 * See the ILoggingConfig interface for valid options.
	 * @param cfg {ILoggingConfig} optional argumets to override the default logger
	 */
	public configure(cfg?: ILoggingConfig, self = this) {
		self._opts = Object.assign(self._opts, cfg);

		if (self._opts.colors) {
			chalk.enabled = true;
		}

		if (!fs.existsSync(self._opts.directory)) {
			fs.mkdirSync(self._opts.directory);
		}

		if (self._opts.messages != null) {
			if (self._messages != null) {
				fs.close(self._messages);
			}
			self._messages = fs.openSync(join(self._opts.directory, self._opts.messages), 'a');
		}

		if (self._opts.events != null) {
			if (self._events != null) {
				fs.close(self._events);
			}
			self._events = fs.openSync(join(self._opts.directory, self._opts.events), 'a');
		}

		self._configured = true;
	}

	public info(str: string, filename?: string, self = this): string {
		return self.message(str, Level.INFO, filename);
	}

	public warning(str: string, filename?: string, self = this): string {
		return self.message(str, Level.WARN, filename);
	}

	public warn(str: string, filename?: string, self = this): string {
		return self.warning(str, filename);
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

		if (!self._opts.enabled) {
			return '';
		}

		if (!self._configured) {
			self.configure();
		}

		let	levelStr = String(level);
		if (self._opts.colors) {
			switch (level) {
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
		}

		if (filename !== '' && filename != null) {
			filename = ` \{${path.basename(filename)}\}`;
		}

		const msg = `[${levelStr}] ${ts({dateFormat: self._opts.dateFormat})} ~> ${str}${filename}`;

		if (level === Level.EVENT && self._events != null) {
			fs.appendFileSync(self._events as any, msg + '\n');
		}

		if (self._messages != null) {
			fs.appendFileSync(self._messages as any, msg + '\n');
		}

		if (self._opts.toConsole) {
			if (level === Level.ERROR) {
				console.error(msg);
			} else {
				console.log(msg);
			}
		}

		return msg;
	}
}

export default new Logger();
