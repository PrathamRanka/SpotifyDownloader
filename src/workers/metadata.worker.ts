import { Id3Writer } from '../audio/id3.js';
import type { AudioMetadata } from '../types/metadata.js';

export interface MetadataWorkerMessage {
  file: string;
  metadata: AudioMetadata;
  artwork?: Uint8Array;
}

export function runMetadataTask(message: MetadataWorkerMessage): void {
  new Id3Writer().write(
    message.file,
    message.metadata,
    message.artwork ? Buffer.from(message.artwork) : undefined,
  );
}
