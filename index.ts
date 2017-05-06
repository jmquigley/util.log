'use strict';

import * as fs from 'fs-extra';
import {join} from 'util.join';
import {timestamp as ts} from 'util.timestamp';

export interface LoggingConfig {
	messages: string;
	events: string;
	directory: string;
	toConsole: boolean;
	enabled: boolean;
	dateFormat: string;
}

let opts: LoggingConfig = {
	messages: 'messages.log',
	events: 'events.log',
	directory: './logs',
	toConsole: true,
	enabled: true,
	dateFormat: '%Y-%m-%d @ %H:%M:%S:%L',
};

let messages: number = null;
let events: number = null;
let configured: boolean = false;

/**
 * Allows the user to override the default configuration for the simple logger.
 * See the LoggingConfig interface for valid options.
 * @param cfg {LoggingConfig} optional arguments to override the default logger
 */
export function config(cfg?: LoggingConfig) {
	opts = Object.assign(opts, cfg);

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
 * @param level {string} the logging level requested.
 * @returns {str} the message that was written/displayed
 */
function message(str: string, level: string): string {

	if (!opts.enabled) {
		return '';
	}

	if (!configured) {
		config();
	}
	
	let msg = `[${level.toUpperCase()}] ${ts({dateFormat: opts.dateFormat})} ~> ${str}`;

	if (level === 'EVENT') {
		fs.appendFileSync(events as any, msg + '\n');
	} else {
		fs.appendFileSync(messages as any, msg + '\n');
	}

	if (opts.toConsole) {
		if (level === 'ERROR') {
			console.error(msg);
		} else {
			console.log(msg);
		}
	}

	return msg;
}

export function info(str: string): string {
	return message(str, 'INFO ');
}

export function warning(str: string): string {
	return message(str, 'WARN ');
}

export function error(str: string): string {
	return message(str, 'ERROR');
}

export function event(str: string): string {
	return message(str, 'EVENT');
}
