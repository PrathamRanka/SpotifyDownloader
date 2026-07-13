# Programmatic API

The public entry point is `src/index.ts` (compiled to `dist/index.js`). It exports configuration loading, Spotify playlist services, downloader orchestration, and domain types.

```ts
import { loadEnvironment, SpotifyClient, DownloadManager } from 'spotify-playlist-downloader';
```

Most applications should use the `spotifydl` CLI. Programmatic consumers can compose the same services shown in `src/cli/commands.ts` and replace dependencies through constructors.

No private Spotify endpoint is required. `SpotifyGraphqlClient` is an explicit extension point and is not used by the v1 pipeline.
