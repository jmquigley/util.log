# util.log [![Build Status](https://travis-ci.org/jmquigley/util.log.svg?branch=master)](https://travis-ci.org/jmquigley/util.log) [![tslint code style](https://img.shields.io/badge/code_style-TSlint-5ed9c7.svg)](https://palantir.github.io/tslint/) [![Test Runner](https://img.shields.io/badge/testing-ava-blue.svg)](https://github.com/avajs/ava) [![NPM](https://img.shields.io/npm/v/util.log.svg)](https://www.npmjs.com/package/util.log) [![Coverage Status](https://coveralls.io/repos/github/jmquigley/util.log/badge.svg?branch=master)](https://coveralls.io/github/jmquigley/util.log?branch=master)

> A simple logging utility module


## Installation

To install as an application dependency:
```
$ npm install --save util.log
```

To build the app and run all tests:
```
$ npm run all
```

## Usage

```javascript
const log = require('util.log');
log.info('This is a log message');
```

This uses the default options and logs an info level message to a file.  The message will be written to `./logs/messages.log`.  It will not write the message to `console.log` by default.

```javascript
const log = require('util.log`);
log.configure({
    directory: /var/log/app,
	toConsole: true
});

log.info('This is a log message);

```
Similar to the first example.  This overrides the default configuration and changes the directory where the log files will be written.  It also turns on console logging.

```javascript
const log = require('util.log');
log.event('button onClick()', 'EVT_BUTTON_PRESSED');
```

Writes an event message to the `events.log` file.  The `EVT_BUTTON_PRESSED` is an id associated with the event.  This is an optional parameter.


## Configuration
The module is configured with a call to the `.config()`.  It accepts an object with the following parameters:

- `colors` - Uses the chalk library to add color to the logging level in the messages.  This is on by default.  It adds ASCII escape sequences around the level to provide color (see [chalk](https://www.npmjs.com/package/chalk) module).
- `dateFormat` - the timestamp format used in [strftime](https://github.com/samsonjs/strftime).  The default is `%Y-%m-%d @ %H:%M:%S:%L`.
- `directory` - the directory location for the messages and event log files.  The default is the current directory with `logs` appended to it.
- `enabled` - a boolean flag.  If true, then the logger will produce messages, otherwise all messages are suppressed and no output is generated.  The default is `true`.
- `events` - the output file name for all `event` messages.  Any message sent to `log.event()` will be placed in this log file.
- `messages` - the output file name for all `info|warning|error` messages.  The default is `messages.log`.
- `toConsole` - a boolean flag.  If true, then the message written to the log is also written to console.log/error, otherwise it the message is suppressed from the console.  The default is `false`.

## API
The module contains the following functions:

- `.configure({})` - overrides the default configuration settings (settings listed above).
- `.info({string})` - writes an info message to the log.  These are written in green when color is enabled.
- `.warn({string})` or `warning()` - prints a warning message to the log.  These are written in yellow when color is enabled.
- `.error({string})` - prints an error message to the log.  If the console logging is enabled, then it also writes to console.error.  These are written in red when color is enabled.
- `.event({string}, [{id}])` - writes an event message (these are for react/redux events).  Used to track actions as they occur.  These are written to both the messages and the events log.  They are written in blue when color is enabled.
