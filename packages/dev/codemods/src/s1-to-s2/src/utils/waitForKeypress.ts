export async function waitForKeypress(): Promise<void> {
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => {
      resolve();
    });
  });
}
