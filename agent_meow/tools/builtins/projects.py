"""Session-project tools (``project_*``) for the agent-meow Projects surface.

These tools are **runner-dispatched**: the runner proxies the agent-meow
server's project REST endpoints over ``server_client`` (same channel as
``sys_agent_*``). They ship as schema-only :class:`Tool` subclasses.

- ``project_create`` → ``POST /v1/sessions/{id}/resources/projects``
- ``project_get`` → ``GET /v1/sessions/{id}/resources/projects/{project_id}``
- ``project_list`` → ``GET /v1/sessions/{id}/resources/projects``
- ``project_update`` → ``PATCH /v1/sessions/{id}/resources/projects/{project_id}``
- ``project_delete`` → ``DELETE /v1/sessions/{id}/resources/projects/{project_id}``
"""

from __future__ import annotations

from typing import Any

from agent_meow.tools.base import Tool


class ProjectCreateTool(Tool):
    """Create a new project in a session.

    Runner-dispatched: proxies ``POST /v1/sessions/{id}/resources/projects``.
    """

    @classmethod
    def name(cls) -> str:
        return "project_create"

    @classmethod
    def description(cls) -> str:
        return (
            "Create a new project in a session. Pass a name and optional "
            "description and status (active/archived/completed). "
            "Returns the new project's id, name, description, and status. "
            "Requires session_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ProjectCreateTool.name(),
                "description": ProjectCreateTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to create the project in.",
                        },
                        "name": {
                            "type": "string",
                            "description": "Project name. Defaults to 'Untitled Project'.",
                        },
                        "description": {
                            "type": "string",
                            "description": "Optional longer description.",
                        },
                        "status": {
                            "type": "string",
                            "description": "'active' (default), 'archived', or 'completed'.",
                        },
                    },
                    "required": ["session_id", "name"],
                    "additionalProperties": False,
                },
            },
        }


class ProjectGetTool(Tool):
    """Fetch a single project by id.

    Runner-dispatched: proxies ``GET /v1/sessions/{id}/resources/projects/{project_id}``.
    """

    @classmethod
    def name(cls) -> str:
        return "project_get"

    @classmethod
    def description(cls) -> str:
        return (
            "Fetch a single project by id: name, description, status, "
            "updated_at. Requires session_id and project_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ProjectGetTool.name(),
                "description": ProjectGetTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the project.",
                        },
                        "project_id": {
                            "type": "string",
                            "description": "The project id to fetch.",
                        },
                    },
                    "required": ["session_id", "project_id"],
                    "additionalProperties": False,
                },
            },
        }


class ProjectListTool(Tool):
    """List all projects in a session.

    Runner-dispatched: proxies ``GET /v1/sessions/{id}/resources/projects``.
    """

    @classmethod
    def name(cls) -> str:
        return "project_list"

    @classmethod
    def description(cls) -> str:
        return (
            "List all projects in a session, newest-first. Returns id, "
            "name, description, status, updated_at for each. Requires session_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ProjectListTool.name(),
                "description": ProjectListTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to list projects for.",
                        },
                    },
                    "required": ["session_id"],
                    "additionalProperties": False,
                },
            },
        }


class ProjectUpdateTool(Tool):
    """Update a project's name, description, and/or status.

    Runner-dispatched: proxies ``PATCH /v1/sessions/{id}/resources/projects/{project_id}``.
    """

    @classmethod
    def name(cls) -> str:
        return "project_update"

    @classmethod
    def description(cls) -> str:
        return (
            "Update a project's name, description, and/or status. "
            "Requires session_id and project_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ProjectUpdateTool.name(),
                "description": ProjectUpdateTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the project.",
                        },
                        "project_id": {
                            "type": "string",
                            "description": "The project id to update.",
                        },
                        "name": {
                            "type": "string",
                            "description": "New name, or omit to leave unchanged.",
                        },
                        "description": {
                            "type": "string",
                            "description": "New description, or omit to leave unchanged.",
                        },
                        "status": {
                            "type": "string",
                            "description": "'active', 'archived', or 'completed'.",
                        },
                    },
                    "required": ["session_id", "project_id"],
                    "additionalProperties": False,
                },
            },
        }


class ProjectDeleteTool(Tool):
    """Delete a project.

    Runner-dispatched: proxies ``DELETE /v1/sessions/{id}/resources/projects/{project_id}``.
    """

    @classmethod
    def name(cls) -> str:
        return "project_delete"

    @classmethod
    def description(cls) -> str:
        return (
            "Delete a project by id. Requires session_id and project_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ProjectDeleteTool.name(),
                "description": ProjectDeleteTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the project.",
                        },
                        "project_id": {
                            "type": "string",
                            "description": "The project id to delete.",
                        },
                    },
                    "required": ["session_id", "project_id"],
                    "additionalProperties": False,
                },
            },
        }