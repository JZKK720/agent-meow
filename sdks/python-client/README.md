# agent-meow-client

Python client SDK for [agent-meow](https://github.com/JZKK720/agent-meow)
server API.

`agent-meow-client` is a typed client for driving agent-meow sessions over the
server's HTTP + SSE API — creating sessions, sending turns, and streaming
responses. It shares the `StreamEvent` / `SessionStreamEventType` types that the
server emits, so streamed envelopes are validated against a single source of
truth.

It is released in lockstep with the core `agent-meow` package at a matching
version:

```bash
pip install agent-meow-client
```

See the [agent-meow repository](https://github.com/JZKK720/agent-meow) for full
documentation.
