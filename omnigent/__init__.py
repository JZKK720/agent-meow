"""Compatibility shim: redirects ``import omnigent`` → ``import agent_meow``.

The Python package directory was renamed from ``omnigent/`` to ``agent_meow/``
as part of the agent-meow rebrand. This shim keeps existing code, agent YAML
configs, and third-party packages that reference ``omnigent.*`` working by
transparently redirecting all attribute access to the new ``agent_meow`` package.

Remove this file once all consumers have migrated to ``agent_meow.*`` imports.
"""

import importlib
import sys
from types import ModuleType

# The real package lives at agent_meow/.
_REAL_PACKAGE = "agent_meow"

# Ensure the real package is imported and registered in sys.modules.
if _REAL_PACKAGE not in sys.modules:
    importlib.import_module(_REAL_PACKAGE)

# Point sys.modules["omnigent"] at the real package so `import omnigent`
# resolves to the same module object as `import agent_meow`.
sys.modules["omnigent"] = sys.modules[_REAL_PACKAGE]

# Also redirect submodules: when `import omnigent.foo` runs, Python looks
# up "omnigent.foo" in sys.modules. We intercept the import by wrapping
# the real package's __getattr__ so `omnigent.foo` resolves to
# `agent_meow.foo`.
_real = sys.modules[_REAL_PACKAGE]


class _CompatModule(ModuleType):
    """A module wrapper that redirects attribute access to agent_meow."""

    def __getattr__(self, name: str):
        # First try the real package's attributes.
        return getattr(_real, name)


# Replace the omnigent entry in sys.modules with our compat wrapper,
# but preserve the real package's __path__ so submodule imports work.
_compat = _CompatModule("omnigent")
_compat.__path__ = getattr(_real, "__path__", [])  # type: ignore[attr-defined]
_compat.__version__ = getattr(_real, "__version__", "")
_compat.__all__ = getattr(_real, "__all__", [])
sys.modules["omnigent"] = _compat