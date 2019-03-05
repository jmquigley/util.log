module.exports = {
	bail: true,
	collectCoverage: true,
	coveragePathIgnorePatterns: [
		"<rootDir>/__tests__/helpers",
		"<rootDir>/node_modules"
	],
	moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
	notify: false,
	setupFiles: ["<rootDir>/jest.setup.js"],
	testPathIgnorePatterns: [
		"<rootDir>/__tests__/helpers",
		"<rootDir>/node_modules"
	],
	verbose: true
};
