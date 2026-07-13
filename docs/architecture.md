# Architecture

The v1 pipeline is deliberately split into replaceable layers:

1. `cli` merges command-line options with validated environment configuration.
2. `spotify` authenticates with Spotify and maps playlist responses into domain types.
3. `downloader` schedules bounded concurrent track jobs and records completion state.
4. `source` asks yt-dlp for candidates, scores them, and downloads the best match.
5. `audio` converts source audio with FFmpeg and writes ID3 metadata and artwork.
6. `storage` owns paths, cache files, download history, and filesystem operations.
7. `terminal` renders progress without leaking presentation concerns into the pipeline.

Services use constructor injection so search providers, storage, networking, and renderers can be replaced in tests or future plugins.

The files in `workers` define serializable task boundaries. v1 uses the bounded scheduler because yt-dlp and FFmpeg already perform CPU-heavy work in child processes; these boundaries allow a future worker-thread pool without changing the manager API.
