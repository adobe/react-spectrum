/** Compiles an object containing ICU messages to a JavaScript module. */
export function compileMessages(messages: Record<string, string>): string;
/** Compiles a single ICU message to JavaScript source code. */
export function compileMessage(message: string): string;
