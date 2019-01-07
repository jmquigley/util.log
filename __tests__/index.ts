'use strict';

import * as fs from 'fs-extra';
import * as path from 'path';
import {Fixture} from 'util.fixture';
import {join} from 'util.join';
import * as uuid from 'uuid';
import logger from '../index';
import {cleanup} from './helpers';

// Regex that looks for color values
const r = /\[.*(DEBUG|INFO |WARN |ERROR|EVENT).*\] .*\d{4}-\d{2}-\d{2} @ \d*:\d*:\d*:\d*.* \[.*\] ~> .*/;

// Regex that loosk for no color in the message
const rnc = /\[(DEBUG|INFO |WARN |ERROR|EVENT)\] \d{4}-\d{2}-\d{2} @ \d*:\d*:\d*:\d* \[.*\] ~> .*/;

afterAll((done) => {
	const log = logger.instance();
	console.log(log.toString());
	cleanup(path.basename(__filename), done);
});

beforeEach(() => {
	jest.resetModules()
});

test('Test debug message log', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		debug: true,
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.debug('Test Message', __filename);
	expect(typeof s === 'string').toBe(true);
	expect(/\[.*DEBUG\S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(r);
});

test('Test debug message with debugging disabled', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		debug: false,
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.debug('Test Message', __filename);
	expect(typeof s === 'string').toBe(true);
	expect(s === '').toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
});

test('Test info message log', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(typeof log.toString() === 'string').toBe(true);
	expect(log).toBeDefined();
	const s = log.info('Test Message', __filename);
	expect(typeof s === 'string').toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(r);
});

test('Test info message with no configuration', () => {
	const log = logger.instance();

	expect(log).toBeDefined();
	const s = log.info('Test Message');
	expect(typeof s === 'string').toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(s).toMatch(r);
});

test('Test warn message log', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.warn('Test Message');
	expect(typeof s === 'string').toBe(true);
	expect(/\[.*WARN \S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(r);
});

test('Test error message log', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.error('Test Message');
	expect(typeof s === 'string').toBe(true);
	expect(/\[.*ERROR\S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(r);
});

test('Test event message log', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.event('Test Message', 'SOME_EVENT_ID', 'tests.js');
	expect(typeof s === 'string').toBe(true);
	expect(/\[.*EVENT\S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(r);
});

test('Test event message log with no event id value', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.event('Test Event Message no id', 'tests.js');
	expect(typeof s === 'string').toBe(true);
	expect(/\[.*EVENT\S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(r);
});

test('Test calling configuration twice', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	let log = logger.instance({
		directory: logdir
	});

	log = logger.instance({
		directory: logdir
	});

	expect(log).toBeDefined();
	const s = log.info('Test Message');
	expect(typeof s === 'string').toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(r);
});

test('Test disabling the logger and show no message even when called', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		enabled: false,
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.info('Test Message');
	expect(typeof s === 'string').toBe(true);
	expect(s).toBe('');
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
});

test('Test suppression of the message and events log', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		enabled: true,
		toConsole: true,
		directory: logdir,
		eventFile: null,
		messageFile: null,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.info('Test Message with no event or message log');
	expect(typeof s === 'string').toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(false);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(false);
});

test('Test using a null namespace value and having one assigned', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		enabled: false,
		directory: logdir,
		namespace: null
	});

	expect(log).toBeDefined();
	const s = log.info('Test Message');
	expect(typeof s === 'string').toBe(true);
	expect(s).toBe('');
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(log.namespace).toBeTruthy();
});

test('Test using no color on a log message', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		colors: false,
		debug: true,
		toConsole: true,
		directory: logdir,
		namespace: 'nocolor'
	});

	expect(log).toBeDefined();
	let s = log.info('Test Colorless Info', __filename);
	expect(typeof s === 'string').toBe(true);
	expect(/\[INFO \].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(rnc);

	s = log.warn('Test Colorless Warning', __filename);
	expect(typeof s === 'string').toBe(true);
	expect(/\[WARN \].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(rnc);

	s = log.error('Test Colorless Error', __filename);
	expect(typeof s === 'string').toBe(true);
	expect(/\[ERROR\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(rnc);

	s = log.debug('Test Colorless Debug', __filename);
	expect(typeof s === 'string').toBe(true);
	expect(/\[DEBUG\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(rnc);

	s = log.event('Test Colorless Event', 'EVT-JUNK', __filename);
	expect(typeof s === 'string').toBe(true);
	expect(/\[EVENT\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(true);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(true);
	expect(s).toMatch(rnc);
});

test('Test writing log output to bad output source', () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, 'logs');
	const log = logger.instance({
		directory: logdir
	});

	expect(log).toBeDefined();
	fs.unlink(join(logdir, 'messages.log'));
	fs.unlink(join(logdir, 'events.log'));
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, 'messages.log'))).toBe(false);
	expect(fs.existsSync(join(logdir, 'events.log'))).toBe(false);

	const s = log.info('Test Message');
	expect(typeof s === 'string').toBe(true);
});
