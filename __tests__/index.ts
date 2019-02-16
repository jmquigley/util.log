"use strict";

import * as fs from "fs-extra";
import * as path from "path";
import {Fixture} from "util.fixture";
import {join} from "util.join";
import * as uuid from "uuid";
import logger from "../index";
import {cleanup} from "./helpers";

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
	jest.resetModules();
});

const param: number = 42;

test("Test debug message log", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		debug: true,
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.debug("Test Message debug: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*DEBUG\S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test debug message with debugging disabled", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		debug: false,
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.debug("Test Message debug: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(s === "").toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
});

test("Test info message log", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(typeof log.toString() === "string").toBe(true);
	expect(log).toBeDefined();
	const s = log.info("Test Message info: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test info message with no configuration", () => {
	const log = logger.instance();

	expect(log).toBeDefined();
	const s = log.info("Test Message info");
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(s).toMatch(r);
});

test("Test info message with no console output", () => {
	const log = logger.instance({
		toConsole: false
	});

	expect(log).toBeDefined();
	const s = log.info("Test Message info");
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(s).toMatch(r);
});

test("Test warn message log", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.warn("Test Message warn: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*WARN \S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test warning message log", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.warning("Test Message warning: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*WARN \S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test error message log", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.error("Test Message: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*ERROR\S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test event message log", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.event("SOME_EVENT_ID", "test message: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*EVENT\S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test event message log with no event id value", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		toConsole: true,
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.event(null, "Test Event Message no id: [%s]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*EVENT\S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test calling configuration twice", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	let log = logger.instance({
		directory: logdir,
		toConsole: false
	});

	log = logger.instance({
		directory: logdir,
		toConsole: false
	});

	expect(log).toBeDefined();
	const s = log.info("Test Message");
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test disabling the logger and show no message even when called", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		enabled: false,
		directory: logdir,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.info("Test Message");
	expect(typeof s === "string").toBe(true);
	expect(s).toBe("");
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
});

test("Test suppression of the message and events log", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		enabled: true,
		directory: logdir,
		eventFile: null,
		messageFile: null,
		namespace: uuid.v4(),
		nsWidth: 7
	});

	expect(log).toBeDefined();
	const s = log.info("Test Message with no event or message log");
	expect(typeof s === "string").toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(false);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(false);
});

test("Test using a null namespace value and having one assigned", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		enabled: false,
		directory: logdir,
		namespace: null
	});

	expect(log).toBeDefined();
	const s = log.info("Test Message");
	expect(typeof s === "string").toBe(true);
	expect(s).toBe("");
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(log.namespace).toBeTruthy();
});

test("Test using no color on a log message", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		colors: false,
		debug: true,
		directory: logdir,
		namespace: "nocolor",
		nsWidth: 7
	});

	expect(log).toBeDefined();
	let s = log.info("Test Colorless Info: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[INFO \].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(rnc);

	s = log.warn("Test Colorless Warning: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[WARN \].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(rnc);

	s = log.error("Test Colorless Error: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[ERROR\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(rnc);

	s = log.debug("Test Colorless Debug: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[DEBUG\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(rnc);

	s = log.event("EVT-JUNK", "Test Colorless Event: [%d]", param);
	expect(typeof s === "string").toBe(true);
	expect(/\[EVENT\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(rnc);
});

test("Test a dynamic log message with a circular object reference parameter", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		directory: logdir
	});

	var i = {a: "x", ref: null};
	var j = {b: "y", ref: null};
	var k = {c: "z", ref: null};
	i.ref = j;
	j.ref = k;
	k.ref = i;

	expect(typeof log.toString() === "string").toBe(true);
	expect(log).toBeDefined();
	const s = log.info("Test with circular object reference: [%j]", i);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(fs.existsSync(logdir)).toBe(true);
	expect(fs.existsSync(join(logdir, "messages.log"))).toBe(true);
	expect(fs.existsSync(join(logdir, "events.log"))).toBe(true);
	expect(s).toMatch(r);
});

test("Test using %j, %o, %O, and %J syntax", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		directory: logdir
	});

	const obj = {
		a: "x",
		b: "y"
	};

	expect(typeof log.toString() === "string").toBe(true);
	expect(log).toBeDefined();

	let s = log.info("Test with %j replacement: [%j]", obj);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);

	s = log.info("Test with %J replacement: [%J]", obj);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);

	s = log.info("Test with %O replacement: [%O]", obj);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);

	s = log.info("Test with %o replacement: [%o]", obj);
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
});

test("Create info message with newline characters", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.info("\n%s\n%s\n%s", "str1", "str2", "str3");
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(s).toMatch(r);
});

test("Test info message with default namespace sizing and uuid", () => {
	const fixture = new Fixture();
	const logdir = join(fixture.dir, "logs");
	const log = logger.instance({
		directory: logdir,
		namespace: uuid.v4()
	});

	expect(log).toBeDefined();
	const s = log.info("message with long namespace");
	expect(typeof s === "string").toBe(true);
	expect(/\[.*INFO \S*\].*/.test(s)).toBe(true);
	expect(s).toMatch(r);
});
