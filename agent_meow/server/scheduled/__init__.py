"""Server-process scheduler for recurring scheduled tasks.

Two pieces live here:

* :mod:`agent_meow.server.scheduled.rrule` â€?RRULE (RFC 5545) next-fire
  computation and the minimum-interval validator, backed by
  :mod:`dateutil.rrule`.
* :mod:`agent_meow.server.scheduled.scheduler` â€?the
  :class:`~agent_meow.server.scheduled.scheduler.ScheduledTaskScheduler`, which
  arms one self-rearming timer per active scheduled task and invokes an injected
  ``on_fire`` callback when a task is due.

The scheduler only decides *when* a task fires; the firing itself (creating an
agent session) is supplied by the caller via the ``on_fire`` seam.
"""

from __future__ import annotations

from agent_meow.server.scheduled.rrule import (
    MIN_INTERVAL_SECONDS,
    RRuleTrigger,
    RRuleValidationError,
    get_next_fire_time,
    validate_rrule,
)
from agent_meow.server.scheduled.scheduler import (
    MISFIRE_GRACE_TIME_S,
    OnFire,
    ScheduledTaskScheduler,
)

__all__ = [
    "MIN_INTERVAL_SECONDS",
    "MISFIRE_GRACE_TIME_S",
    "OnFire",
    "RRuleTrigger",
    "RRuleValidationError",
    "ScheduledTaskScheduler",
    "get_next_fire_time",
    "validate_rrule",
]
