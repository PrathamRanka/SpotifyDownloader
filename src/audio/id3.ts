import NodeID3 from 'node-id3';
import type { AudioMetadata } from '../types/metadata.js';

export class Id3Writer {
  write(file: string, metadata: AudioMetadata, artwork?: Buffer): void {
    const success = NodeID3.write(
      {
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        performerInfo: metadata.albumArtist,
        trackNumber: metadata.trackNumber,
        partOfSet: metadata.discNumber,
        year: metadata.year,
        ISRC: metadata.isrc,
        image: artwork
          ? {
              mime: 'image/jpeg',
              type: { id: 3, name: 'front cover' },
              description: 'Cover',
              imageBuffer: artwork,
            }
          : undefined,
      },
      file,
    );
    if (!success) throw new Error(`Unable to write ID3 metadata to ${file}`);
  }
}
