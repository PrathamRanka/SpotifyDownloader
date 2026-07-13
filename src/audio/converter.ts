import { runProcess } from './ffmpeg.js';

export class AudioConverter {
  constructor(private readonly ffmpegPath: string) {}

  async toMp3(input: string, output: string, quality: number): Promise<void> {
    await runProcess(this.ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      input,
      '-vn',
      '-codec:a',
      'libmp3lame',
      '-b:a',
      `${quality}k`,
      output,
    ]);
  }
}
