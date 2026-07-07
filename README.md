# Spotify Playlist Downloader CLI

A high-performance command-line application built with TypeScript that downloads complete Spotify playlists as MP3 files with embedded metadata and album artwork. The application provides a fast, concurrent download pipeline, automatic tagging, and a modern terminal interface.

> **Disclaimer**
>
> This project is intended for educational and research purposes. Ensure that your use complies with applicable laws, platform terms of service, and copyright regulations.

---

## Features

- Download an entire playlist using a single command
- Automatic playlist parsing
- Concurrent download pipeline
- Embedded album artwork
- Automatic ID3 tagging
- Track numbering and album metadata
- Progress tracking with live terminal updates
- Automatic retries for failed downloads
- Resume interrupted downloads
- Configurable download quality
- Lightweight and fast CLI
- Cross-platform support (Windows, macOS, Linux)

---

## Architecture

```
                   Playlist URL
                         │
                         ▼
                 Playlist Parser
                         │
                         ▼
              Playlist Metadata Fetcher
                         │
                         ▼
                  Download Queue
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
     Worker 1        Worker 2        Worker N
         │               │               │
         ▼               ▼               ▼
   Search Source   Search Source   Search Source
         │               │               │
         ▼               ▼               ▼
   Download Audio Download Audio Download Audio
         │               │               │
         ▼               ▼               ▼
    Convert MP3     Convert MP3     Convert MP3
         │               │               │
         ▼               ▼               ▼
      Add Tags        Add Tags        Add Tags
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
                  Final Output Folder
```

---

# Folder Structure

```
spotify-playlist-downloader/
│
├── src/
│   │
│   ├── cli/
│   │   ├── index.ts
│   │   ├── commands.ts
│   │   ├── options.ts
│   │   └── help.ts
│   │
│   ├── config/
│   │   ├── defaults.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── spotify/
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── playlist.ts
│   │   ├── track.ts
│   │   ├── graphql.ts
│   │   ├── parser.ts
│   │   └── types.ts
│   │
│   ├── downloader/
│   │   ├── queue.ts
│   │   ├── worker.ts
│   │   ├── manager.ts
│   │   ├── retry.ts
│   │   └── scheduler.ts
│   │
│   ├── source/
│   │   ├── search.ts
│   │   ├── downloader.ts
│   │   └── matcher.ts
│   │
│   ├── audio/
│   │   ├── converter.ts
│   │   ├── metadata.ts
│   │   ├── artwork.ts
│   │   ├── id3.ts
│   │   └── ffmpeg.ts
│   │
│   ├── storage/
│   │   ├── cache.ts
│   │   ├── database.ts
│   │   ├── filesystem.ts
│   │   └── output.ts
│   │
│   ├── network/
│   │   ├── client.ts
│   │   ├── headers.ts
│   │   ├── session.ts
│   │   └── proxy.ts
│   │
│   ├── terminal/
│   │   ├── progress.ts
│   │   ├── logger.ts
│   │   ├── spinner.ts
│   │   └── renderer.ts
│   │
│   ├── workers/
│   │   ├── download.worker.ts
│   │   ├── metadata.worker.ts
│   │   └── convert.worker.ts
│   │
│   ├── utils/
│   │   ├── file.ts
│   │   ├── path.ts
│   │   ├── sleep.ts
│   │   ├── hash.ts
│   │   ├── retry.ts
│   │   ├── validator.ts
│   │   └── formatter.ts
│   │
│   ├── types/
│   │   ├── playlist.ts
│   │   ├── track.ts
│   │   ├── metadata.ts
│   │   └── common.ts
│   │
│   └── index.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── scripts/
│   ├── build.ts
│   ├── release.ts
│   └── clean.ts
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── contributing.md
│
├── .github/
│   └── workflows/
│
├── dist/
├── downloads/
├── package.json
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── .gitignore
├── LICENSE
└── README.md
```

---

# Installation

```bash
git clone https://github.com/username/spotify-playlist-downloader.git

cd spotify-playlist-downloader

npm install
```

---

# Usage

```bash
spotifydl <playlist-url>
```

Example

```bash
spotifydl https://open.spotify.com/playlist/xxxxxxxxxxxxxxxx
```

Specify an output directory

```bash
spotifydl <playlist-url> --output ./Music
```

Control concurrent downloads

```bash
spotifydl <playlist-url> --workers 8
```

Resume a previous download

```bash
spotifydl <playlist-url> --resume
```

---

# Download Pipeline

```
Playlist URL
      │
      ▼
Extract Playlist ID
      │
      ▼
Retrieve Playlist Metadata
      │
      ▼
Create Download Queue
      │
      ▼
Search Matching Audio
      │
      ▼
Download Source
      │
      ▼
Convert to MP3
      │
      ▼
Download Album Artwork
      │
      ▼
Embed Metadata
      │
      ▼
Write Output File
```

---

# Configuration

Configuration can be provided using command-line arguments or environment variables.

Example:

```env
OUTPUT_DIRECTORY=./downloads
CONCURRENT_DOWNLOADS=5
AUDIO_QUALITY=320
LOG_LEVEL=info
```

---

# Output Structure

```
downloads/

└── Playlist Name/
    ├── 01 - Track One.mp3
    ├── 02 - Track Two.mp3
    ├── 03 - Track Three.mp3
    └── cover.jpg
```

---

# Tech Stack

| Component | Technology |
|------------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| CLI | Commander |
| HTTP Client | Undici |
| Audio Conversion | FFmpeg |
| Metadata | node-id3 |
| Concurrency | Worker Threads |
| Terminal UI | Ink / cli-progress |
| Package Manager | npm |

---

# Development

Run in development mode

```bash
npm run dev
```

Run tests

```bash
npm test
```

Run lint

```bash
npm run lint
```

Build production

```bash
npm run build
```

---

# Roadmap

- Incremental downloads
- Download history
- Local cache
- Playlist synchronization
- Multiple output formats
- Automatic updates
- Configuration profiles
- Plugin architecture
- Cross-platform standalone binaries

---

# Contributing

Contributions are welcome. Please open an issue before submitting significant changes. Ensure that all tests pass and follow the project's coding standards.

---

# License

This project is licensed under the MIT License.