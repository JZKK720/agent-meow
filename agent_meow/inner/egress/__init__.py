"""L7 egress proxy — fine-grained HTTP(S) filtering with TLS interception.

Public API::

    from agent_meow.inner.egress import (
        EgressProxy,
        EgressRule,
        ensure_ca,
        ensure_ca_bundle,
        parse_rule,
        parse_rules,
        check_request,
        start_relay,
    )
"""

from agent_meow.inner.egress.ca import ensure_ca, ensure_ca_bundle

# ``controller`` imports the concrete classes/functions it needs
# directly from the leaf submodules (``ca``, ``proxy``, ``rules``),
# never from this package, so re-exporting it here doesn't create a
# circular import even though this file is what makes that name
# importable as ``agent_meow.inner.egress.<name>``.
from agent_meow.inner.egress.controller import (
    EgressProxyHandle,
    apply_egress_env,
    start_egress_proxy,
)
from agent_meow.inner.egress.proxy import EgressProxy
from agent_meow.inner.egress.relay import start_relay
from agent_meow.inner.egress.rules import (
    EgressRule,
    check_request,
    parse_rule,
    parse_rules,
)

__all__ = [
    "EgressProxy",
    "EgressProxyHandle",
    "EgressRule",
    "apply_egress_env",
    "check_request",
    "ensure_ca",
    "ensure_ca_bundle",
    "parse_rule",
    "parse_rules",
    "start_egress_proxy",
    "start_relay",
]
