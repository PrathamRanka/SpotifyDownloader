import type { Command } from 'commander';

export function configureHelp(program: Command): void {
  program.addHelpText(
    'after',
    `
Examples:
  $ spotifydl https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  $ spotifydl <playlist-id> --output ./Music --workers 8 --resume

Required environment:
  SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET

External tools:
  yt-dlp and FFmpeg must be installed or configured with YTDLP_PATH and FFMPEG_PATH.
`,
  );
}
