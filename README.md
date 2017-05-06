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


## Configuration
The module is configured with a call to the `.config()`.  It accepts an object with the following parameters:

- `messages` - the output file name for all `info|warning|error` messages.  The default is `messages.log`.
- `events` - the output file name for all `event` messages.  Any message sent to `log.event()` will be placed in this log file.
- `directory` - the directory location for the messages and event log files.  The default is the current directory with `logs` appended to it.
- `toConsole` - a boolean flag.  If true, then the message written to the log is also written to console.log/error, otherwise it the message is suppressed from the console.  The default is `false`.
- `enabled` - a boolean flag.  If true, then the logger will produce messages, otherwise all messages are suppressed and no output is generated.  The default is `true`.
  

