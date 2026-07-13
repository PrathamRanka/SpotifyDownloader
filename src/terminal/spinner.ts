export class Spinner {
  private timer?: NodeJS.Timeout;
  private frame = 0;
  private readonly frames = ['-', '\\', '|', '/'];

  start(message: string): void {
    if (!process.stdout.isTTY) {
      console.log(message);
      return;
    }
    this.timer = setInterval(() => {
      process.stdout.write(`\r${this.frames[this.frame++ % this.frames.length]} ${message}`);
    }, 80);
  }

  stop(finalMessage?: string): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
      process.stdout.write(`\r${' '.repeat(80)}\r`);
    }
    if (finalMessage) console.log(finalMessage);
  }
}
