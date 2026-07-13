# Contributing

Use Node.js 20 or newer. Install dependencies with `npm install`, then run:

```bash
npm run lint
npm test
npm run build
```

Keep responsibilities in the existing module boundaries. Add unit tests for pure logic and integration tests for collaborations. Network and external executable behavior should be mocked in automated tests.
