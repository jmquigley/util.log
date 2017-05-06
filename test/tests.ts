'use strict';

import test from 'ava';

test.beforeEach(t => {
	delete require.cache[require.resolve('../index')];
	t.pass();
});

test('Test info message log', t => {
	const log = require('../index');

	t.truthy(log);
	let s = log.info('Test Message');
	t.true(typeof s === 'string');
	t.regex(s, '');
});
