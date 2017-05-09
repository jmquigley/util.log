'use strict';

import test from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
import {Fixture} from 'util.fixture';
import {join} from 'util.join';
import {cleanup} from './helpers';

const r = /\[.*(INFO |WARN |ERROR|EVENT).*\] \d{4}-\d{2}-\d{2} @ \d*:\d*:\d*:\d* ~> .*/;

test.after.always.cb(t => {
	cleanup(path.basename(__filename), t);
});

test.beforeEach(t => {
	delete require.cache[require.resolve('../index')];
	t.pass();
});

test('Test info message log', t => {
	const fixture = new Fixture();
	const log = require('../index').default;
	const logdir = join(fixture.dir, 'logs');

	log.configure({
		toConsole: true,
		directory: logdir
	});

	t.truthy(log);
	const s = log.info('Test Message', __filename);
	t.true(typeof s === 'string');
	t.true(/\[.*INFO \S*\].*/.test(s));
	t.true(fs.existsSync(logdir));
	t.true(fs.existsSync(join(logdir, 'messages.log')));
	t.true(fs.existsSync(join(logdir, 'events.log')));
	t.regex(s, r);
});

test('Test info message with no configuration', t => {
	const log = require('../index').default;

	t.truthy(log);
	const s = log.info('Test Message');
	t.true(typeof s === 'string');
	t.true(/\[.*INFO \S*\].*/.test(s));
	t.regex(s, r);
});

test('Test warn message log', t => {
	const fixture = new Fixture();
	const log = require('../index').default;
	const logdir = join(fixture.dir, 'logs');

	log.configure({
		toConsole: true,
		directory: logdir
	});

	t.truthy(log);
	const s = log.warn('Test Message');
	t.true(typeof s === 'string');
	t.true(/\[.*WARN \S*\].*/.test(s));
	t.true(fs.existsSync(logdir));
	t.true(fs.existsSync(join(logdir, 'messages.log')));
	t.true(fs.existsSync(join(logdir, 'events.log')));
	t.regex(s, r);
});

test('Test error message log', t => {
	const fixture = new Fixture();
	const log = require('../index').default;
	const logdir = join(fixture.dir, 'logs');

	log.configure({
		toConsole: true,
		directory: logdir
	});

	t.truthy(log);
	const s = log.error('Test Message');
	t.true(typeof s === 'string');
	t.true(/\[.*ERROR\S*\].*/.test(s));
	t.true(fs.existsSync(logdir));
	t.true(fs.existsSync(join(logdir, 'messages.log')));
	t.true(fs.existsSync(join(logdir, 'events.log')));
	t.regex(s, r);
});

test('Test event message log', t => {
	const fixture = new Fixture();
	const log = require('../index').default;
	const logdir = join(fixture.dir, 'logs');

	log.configure({
		toConsole: true,
		directory: logdir
	});

	t.truthy(log);
	const s = log.event('Test Message', 'SOME_EVENT_ID');
	t.true(typeof s === 'string');
	t.true(/\[.*EVENT\S*\].*/.test(s));
	t.true(fs.existsSync(logdir));
	t.true(fs.existsSync(join(logdir, 'messages.log')));
	t.true(fs.existsSync(join(logdir, 'events.log')));
	t.regex(s, r);
});

test('Test calling configuration twice', t => {
	const fixture = new Fixture();
	const log = require('../index').default;
	const logdir = join(fixture.dir, 'logs');

	log.configure({
		directory: logdir
	});

	log.configure({
		directory: logdir
	});

	t.truthy(log);
	const s = log.info('Test Message');
	t.true(typeof s === 'string');
	t.true(/\[.*INFO \S*\].*/.test(s));
	t.true(fs.existsSync(logdir));
	t.true(fs.existsSync(join(logdir, 'messages.log')));
	t.true(fs.existsSync(join(logdir, 'events.log')));
	t.regex(s, r);
});

test('Test disabling the logger and show no message even when called', t => {
	const fixture = new Fixture();
	const log = require('../index').default;
	const logdir = join(fixture.dir, 'logs');

	log.configure({
		enabled: false,
		directory: logdir
	});

	t.truthy(log);
	const s = log.info('Test Message');
	t.true(typeof s === 'string');
	t.is(s, '');
	t.true(fs.existsSync(logdir));
	t.true(fs.existsSync(join(logdir, 'messages.log')));
	t.true(fs.existsSync(join(logdir, 'events.log')));
});

test('Test suppression of the message and events log', t => {
	const fixture = new Fixture();
	const log = require('../index').default;
	const logdir = join(fixture.dir, 'logs');

	log.configure({
		enabled: true,
		toConsole: true,
		directory: logdir,
		events: null,
		messages: null
	});

	t.truthy(log);
	const s = log.info('Test Message with no event or message log');
	t.true(typeof s === 'string');
	t.true(fs.existsSync(logdir));
	t.false(fs.existsSync(join(logdir, 'messages.log')));
	t.false(fs.existsSync(join(logdir, 'events.log')));
});
