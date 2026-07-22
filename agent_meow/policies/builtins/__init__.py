"""Built-in policy functions shipped with agent_meow.

Each submodule exports a ``POLICY_REGISTRY`` list â€?a catalog of
policy callables with their handler paths, descriptions, and
parameter schemas. The server discovers these at startup and
exposes them via ``GET /v1/policy-registry`` so users can browse
available policies and attach them to sessions.

The ``POLICY_REGISTRY`` convention::

    POLICY_REGISTRY = [
        {
            "handler": "agent_meow.policies.builtins.safety.max_tool_calls_per_session",
            "kind": "factory",  # called with factory_params to produce evaluator
            "description": "Limits tool calls per session",
            "params_schema": {
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Max calls allowed per turn",
                        "default": 10,
                    }
                },
                "required": ["limit"],
            },
        },
    ]

Modules to scan are listed in :data:`BUILTIN_POLICY_MODULES`.
"""

from __future__ import annotations

# Modules scanned at startup for POLICY_REGISTRY entries.
# Add new builtin modules here.
BUILTIN_POLICY_MODULES = [
    "agent_meow.policies.builtins.safety",
    "agent_meow.policies.builtins.cost",
    "agent_meow.policies.builtins.google",
    "agent_meow.policies.builtins.github",
    "agent_meow.policies.builtins.working_dir",
    "agent_meow.policies.builtins.risk_score",
    "agent_meow.policies.builtins.routing",
    "agent_meow.policies.builtins.cel",
    "agent_meow.policies.builtins.prompt",
    "agent_meow.policies.builtins.context",
    "agent_meow.policies.builtins.orchestration",
    # Legacy alias module â€?registers old agent_meow.inner.nessie.policies.*
    # handler paths so deployed bundles that pre-date the rename still work.
    "agent_meow.inner.nessie.policies",
]
