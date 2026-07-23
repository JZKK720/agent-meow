"""Backward-compat shim —policy handler paths in deployed configs still reference
``agent_meow.inner.nessie.policies.*``.  Real implementation lives at
``agent_meow.policies.builtins.orchestration``.
"""

from agent_meow.policies.builtins.orchestration import *  # noqa: F403
from agent_meow.policies.builtins.orchestration import POLICY_REGISTRY as _new_registry

# Re-advertise under the legacy handler paths so the policy registry accepts
# bundles that were deployed before the module was renamed.
_OLD = "agent_meow.inner.nessie.policies."
_NEW = "agent_meow.policies.builtins.orchestration."
POLICY_REGISTRY = [
    {**entry, "handler": entry["handler"].replace(_NEW, _OLD), "internal_only": True}
    for entry in _new_registry
]
