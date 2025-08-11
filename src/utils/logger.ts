import pino from "pino";

// In test environment, use a mock logger
const isTest = process.env.NODE_ENV === "test";

let logger: pino.Logger;

if (isTest) {
	logger = {
		info: console.log,
		error: console.error,
		warn: console.warn,
		debug: console.debug,
		// Add missing required methods
		fatal: console.error,
		trace: console.debug,
		silent: () => {},
		child: () => ({
			info: console.log,
			error: console.error,
			warn: console.warn,
			debug: console.debug,
			fatal: console.error,
			trace: console.debug,
			silent: () => {},
		}),
	} as unknown as pino.Logger;
} else {
	logger = pino({
		level: process.env.LOG_LEVEL || "info",
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "SYS:standard",
				ignore: "pid,hostname",
			},
		},
	});
}

export default logger;
