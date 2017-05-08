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

	if (opts.messages != null) {
		if (messages != null) {
			fs.close(messages);
		}
		messages = fs.openSync(join(opts.directory, opts.messages), 'a');
	}

	if (opts.events != null) {
		if (events != null) {
			fs.close(events);
		}
		events = fs.openSync(join(opts.directory, opts.events), 'a');
	}

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
 *
 * @param str {string} the string passed to output functions.
 * @param level {Levels} the logging level requested.
 * @param filename {string} the name of the module where the message originated
 * @returns {str} the message that was written/displayed
 */
function message(str: string, level: Level, filename: string = ''): string {

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

	if (filename !== '' && filename != null) {
		filename = ` \{${path.basename(filename)}\}`;
	}

	const msg = `[${levelStr}] ${ts({dateFormat: opts.dateFormat})} ~> ${str}${filename}`;

	if (level === Level.EVENT && events != null) {
		fs.appendFileSync(events as any, msg + '\n');
	}

	if (messages != null) {
		fs.appendFileSync(messages as any, msg + '\n');
	}

	if (opts.toConsole) {
		if (level === Level.ERROR) {
			console.error(msg);
		} else {
			console.log(msg);
		}
	}

	return msg;
}

export function info(str: string, filename?: string): string {
	return message(str, Level.INFO, filename);
}

export function warning(str: string, filename?: string): string {
	return message(str, Level.WARN, filename);
}

export function warn(str: string, filename?: string): string {
	return warning(str, filename);
}

export function error(str: string, filename?: string): string {
	return message(str, Level.ERROR, filename);
}

export function event(str: string, id?: string, filename?: string): string {
	if (id != null) {
		str = `${id} => ${str}`;
	}

	return message(str, Level.EVENT, filename);
}
