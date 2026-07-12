# Changelog

All notable changes to the agent-meow VS Code extension are documented here.

## [0.1.0]

Initial release — a minimal, iframe-only client for a locally running agent-meow
server.

- Open a running local agent-meow server in an editor-beside panel.
- **agent-meow: Open** command, available from the editor-title bar and the
command palette, plus an activity-bar view with an "Open agent-meow" button.
- Automatically discovers a local server via `~/.agent_meow/local_server.pid`, or
point the extension at one with the `agent_meow.serverUrl` setting. Localhost
servers only in this build.

