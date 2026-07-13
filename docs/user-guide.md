# User Guide

This guide is for someone using the project on a new Windows, macOS, or Linux computer.

## 1. Install prerequisites

Install:

- Node.js 20 or newer
- Git
- FFmpeg
- yt-dlp
- A Spotify Premium account and Spotify developer application

Confirm the command-line tools are available:

```bash
node --version
npm --version
ffmpeg -version
yt-dlp --version
```

If FFmpeg or yt-dlp is installed outside `PATH`, keep its full executable path for step 3.

## 2. Download and build the project

```bash
git clone <repository-url>
cd SpotifyDownloader
npm ci
npm run release:check
npm link
```

`npm link` makes the `spotifydl` command available globally. It is optional; without it, use `npm run dev --` before the playlist URL.

## 3. Configure Spotify and external tools

Create a Spotify developer application and copy its client ID and client secret. Then create `.env` from the example:

macOS/Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env`:

```env
SPOTIFY_CLIENT_ID=replace_with_your_client_id
SPOTIFY_CLIENT_SECRET=replace_with_your_client_secret
OUTPUT_DIRECTORY=./downloads
CONCURRENT_DOWNLOADS=4
AUDIO_QUALITY=320
DOWNLOAD_RETRIES=2
LOG_LEVEL=info
```

If necessary, add executable paths:

```env
YTDLP_PATH=C:\Tools\yt-dlp.exe
FFMPEG_PATH=C:\Tools\ffmpeg.exe
```

Use normal absolute paths on macOS/Linux, such as `/usr/local/bin/ffmpeg`.

Never commit `.env`; it contains credentials and is ignored by Git.

## 4. Download a playlist

Copy a Spotify playlist URL and run:

```bash
spotifydl "https://open.spotify.com/playlist/PLAYLIST_ID"
```

Without `npm link`:

```bash
npm run dev -- "https://open.spotify.com/playlist/PLAYLIST_ID"
```

Common options:

```bash
spotifydl <playlist> --output ./Music
spotifydl <playlist> --workers 8
spotifydl <playlist> --quality 192
spotifydl <playlist> --resume
spotifydl <playlist> --retries 3 --log-level debug
```

Run `spotifydl --help` for the complete option list.

## 5. Output and resume behavior

Each playlist receives its own directory:

```text
downloads/
  Playlist Name/
    01 - First Track.mp3
    02 - Second Track.mp3
    cover.jpg
    .spotifydl.json
```

Use `--resume` after an interruption. Existing final MP3 files are skipped. Temporary source and conversion files are removed after each attempt.

## 6. Verify the project

Before sharing changes or creating a release, run:

```bash
npm run format:check
npm run workflows:check
npm run lint
npm test
npm run build
npm run smoke
npm run release:check
```

The end-to-end test uses controlled fake search/download/conversion services. It verifies the complete scheduler, worker, output, metadata boundary, history, cleanup, and resume flow without downloading copyrighted media or requiring secrets.

GitHub Actions repeats these checks on supported Node.js versions and on Linux, Windows, and macOS. Tagged versions matching `v*.*.*` produce an npm tarball and GitHub release artifact.

## 7. Troubleshooting

### `Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET`

Confirm `.env` exists in the project root and both values are present without surrounding quotes or spaces.

### `Could not start yt-dlp` or `Could not start ffmpeg`

Run the tool directly to verify installation. Add `YTDLP_PATH` or `FFMPEG_PATH` to `.env` when the executable is not on `PATH`.

### Spotify returns 401 or 403

Recheck the credentials, developer application access, account eligibility, and playlist visibility. Do not paste secrets into issue reports.

### A wrong source is selected

The matcher scores title, artist, duration, and unwanted variants. Retry with debug logging and report the track metadata and selected public source URL—never credentials.

### Some tracks fail

Run the same command with `--resume --retries 3`. Completed MP3 files will remain untouched while failed tracks are attempted again.

## 8. Updating

```bash
git pull
npm ci
npm run release:check
npm link
```

Read `README.md` for the feature overview and `docs/architecture.md` before extending the implementation.
