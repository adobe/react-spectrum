export async function waitForKeypress() {
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => {
      resolve();
    });
  });
}
