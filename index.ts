'use strict';

import * as fs from 'fs-extra';
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

let opts: ILoggingConfig = {
	colors: true,
	dateFormat: '%Y-%m-%d @ %H:%M:%S:%L',
	directory: './logs',
	enabled: true,
	events: 'events.log',
	messages: 'messages.log',
	toConsole: false
};

let messages: number = null;
let events: number = null;
let configured: boolean = false;

/**
 * Allows the user to override the default configuration for the simple logger.
 * See the ILoggingConfig interface for valid options.
 * @param cfg {ILoggingConfig} optional argumets to override the default logger
 */
export function configure(cfg?: ILoggingConfig) {
	opts = Object.assign(opts, cfg);

	if (opts.colors) {
		chalk.enabled = true;
	}

	if (!fs.existsSync(opts.directory)) {
		fs.mkdirSync(opts.directory);
	}

	if (messages != null) {
		fs.close(messages);
	}
	messages = fs.openSync(join(opts.directory, opts.messages), 'a');

	if (events != null) {
		fs.close(events);
	}
	events = fs.openSync(join(opts.directory, opts.events), 'a');

	configured = true;
}

/**
 * Internal function that takes the details of a message and formats the logging
 * output that will be sent to the log and/or the console.  It uses the format:
 *
 *     [LEVEL] @ {timestamp}: {message}
 *
 * This function checks to see if the enviornment has been configured.  If it has
 * not, then it uses the default options.
 * @param str {string} the string passed to output functions.
 * @param level {Levels} the logging level requested.
 * @returns {str} the message that was written/displayed
 */
function message(str: string, level: Level): string {

	if (!opts.enabled) {
		return '';
	}

	if (!configured) {
		configure();
	}

	let	levelStr = String(level);
	if (opts.colors) {
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

	const msg = `[${levelStr}] ${ts({dateFormat: opts.dateFormat})} ~> ${str}`;

	if (level === Level.EVENT) {
		fs.appendFileSync(events as any, msg + '\n');
	}
	fs.appendFileSync(messages as any, msg + '\n');

	if (opts.toConsole) {
		if (level === Level.ERROR) {
			console.error(msg);
		} else {
			console.log(msg);
		}
	}

	return msg;
}

export function info(str: string): string {
	return message(str, Level.INFO);
}

export function warning(str: string): string {
	return message(str, Level.WARN);
}

export function warn(str: string): string {
	return warning(str);
}

export function error(str: string): string {
	return message(str, Level.ERROR);
}

export function event(str: string, id?: string): string {
	if (id != null) {
		str = `${id} => ${str}`;
	}

	return message(str, Level.EVENT);
}
