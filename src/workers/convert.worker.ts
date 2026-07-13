import { AudioConverter } from '../audio/converter.js';

export interface ConvertWorkerMessage {
  input: string;
  output: string;
  quality: number;
  ffmpegPath: string;
}

export async function runConvertTask(message: ConvertWorkerMessage): Promise<void> {
  await new AudioConverter(message.ffmpegPath).toMp3(message.input, message.output, message.quality);
}
