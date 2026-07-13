# Spotify Playlist Downloader CLI

A modular TypeScript CLI that retrieves Spotify playlist metadata, finds matching audio sources, downloads and converts tracks to MP3, embeds ID3 metadata and artwork, and resumes interrupted playlists.

> This project is intended for educational and research use. Follow copyright law and the terms of every service you use.

## v1 features

- Spotify Web API client-credentials authentication
- Playlist URL and ID parsing with paginated track retrieval
- Candidate search and title/artist/duration matching
- Bounded concurrent download scheduling
- Retry with exponential backoff
- FFmpeg MP3 conversion at 128, 192, 256, or 320 kbps
- ID3 tags, ISRC, disc/track numbers, and cover artwork
- Playlist cover output and resumable per-playlist history
- Cross-platform path sanitization and atomic state writes
- TTY progress bar with plain-text output for CI and redirected terminals
- Dependency-injected services and public TypeScript declarations

## Pipeline

```text
Playlist URL
    -> parse playlist ID
    -> Spotify authentication and metadata retrieval
    -> bounded download scheduler
    -> source search and candidate matching
    -> source download
    -> FFmpeg MP3 conversion
    -> artwork download and ID3 tagging
    -> atomic final output and history update
```

## Project structure

```text
src/
  cli/         index.ts, commands.ts, options.ts, help.ts
  config/      defaults.ts, env.ts, constants.ts
  spotify/     auth.ts, client.ts, playlist.ts, track.ts, graphql.ts, parser.ts, types.ts
  downloader/  queue.ts, worker.ts, manager.ts, retry.ts, scheduler.ts
  source/      search.ts, downloader.ts, matcher.ts
  audio/       converter.ts, metadata.ts, artwork.ts, id3.ts, ffmpeg.ts
  storage/     cache.ts, database.ts, filesystem.ts, output.ts
  network/     client.ts, headers.ts, session.ts, proxy.ts
  terminal/    progress.ts, logger.ts, spinner.ts, renderer.ts
  workers/     download.worker.ts, metadata.worker.ts, convert.worker.ts
  utils/       file.ts, path.ts, sleep.ts, hash.ts, retry.ts, validator.ts, formatter.ts
  types/       playlist.ts, track.ts, metadata.ts, common.ts
  index.ts
tests/
  unit/
  integration/
  fixtures/
scripts/
  build.ts
  release.ts
  clean.ts
docs/
  architecture.md
  api.md
  contributing.md
.github/workflows/ci.yml
```

Every file above is implemented in v1. The `workers` directory defines isolated, serializable task boundaries; the current scheduler runs orchestration in-process while yt-dlp and FFmpeg perform heavy work in child processes.

## Requirements

- Node.js 20 or newer
- FFmpeg on `PATH`, or an `FFMPEG_PATH`
- yt-dlp on `PATH`, or a `YTDLP_PATH`
- Spotify Premium account and a Web API client ID and secret

## Installation

```bash
npm install
cp .env.example .env
npm run build
npm link
```

On Windows PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env
```

Set these required values in `.env`:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

## Usage

```bash
spotifydl <playlist-url-or-id>
spotifydl <playlist-url-or-id> --output ./Music
spotifydl <playlist-url-or-id> --workers 8 --quality 320
spotifydl <playlist-url-or-id> --resume --retries 3
```

Run without a global link:

```bash
npm run dev -- <playlist-url-or-id> --resume
```

## Configuration

| Environment variable    |       Default | Purpose                                       |
| ----------------------- | ------------: | --------------------------------------------- |
| `SPOTIFY_CLIENT_ID`     |      required | Spotify application client ID                 |
| `SPOTIFY_CLIENT_SECRET` |      required | Spotify application client secret             |
| `OUTPUT_DIRECTORY`      | `./downloads` | Root output directory                         |
| `CONCURRENT_DOWNLOADS`  |           `4` | Concurrent track jobs, 1-32                   |
| `AUDIO_QUALITY`         |         `320` | MP3 bitrate: 128, 192, 256, or 320            |
| `DOWNLOAD_RETRIES`      |           `2` | Retries per failed track                      |
| `RETRY_DELAY_MS`        |        `1000` | Initial exponential-backoff delay             |
| `REQUEST_TIMEOUT_MS`    |       `30000` | HTTP request timeout                          |
| `LOG_LEVEL`             |        `info` | `debug`, `info`, `warn`, `error`, or `silent` |
| `YTDLP_PATH`            |      `yt-dlp` | yt-dlp executable path                        |
| `FFMPEG_PATH`           |      `ffmpeg` | FFmpeg executable path                        |
| `PROXY_URL`             |         unset | Optional HTTP proxy                           |

CLI options override environment configuration.

## Output

```text
downloads/
  Playlist Name/
    01 - Track One.mp3
    02 - Track Two.mp3
    cover.jpg
    .spotifydl.json
```

## Development

```bash
npm run dev -- <playlist>
npm run lint
npm test
npm run build
npm run release:check
```

See `docs/architecture.md`, `docs/api.md`, and `docs/contributing.md` for extension points and contribution guidance.

## License

MIT
