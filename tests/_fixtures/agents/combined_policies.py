"""
Callables for the ``combined-policies`` fixture.
"""

from __future__ import annotations

from agent_meow.policies.types import EvaluationContext, PolicyResult
from agent_meow.spec.types import PolicyAction


def observe_all(ctx: EvaluationContext) -> PolicyResult:
    """
    Always-ALLOW observer.

    Pure classifier — records nothing, never blocks.

    :param ctx: Evaluation context (unused — this function
        never blocks regardless of content).
    :returns: :class:`PolicyResult` with ``ALLOW``.
    """
    del ctx
    return PolicyResult(action=PolicyAction.ALLOW)
