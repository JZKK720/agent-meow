import os
k = os.getenv("API_SERVER_KEY", "")
print(f"ENV len={len(k)} repr={repr(k[:10])}...{repr(k[-10:])}")

from agent.secret_scope import get_secret, _SECRET_SCOPE, is_multiplex_active
print(f"multiplex_active={is_multiplex_active()}")
scope = _SECRET_SCOPE.get()
print(f"scope_installed={scope is not None}")
if scope is not None:
    scoped_key = scope.get("API_SERVER_KEY")
    print(f"scoped_key={'set' if scoped_key else 'None'} len={len(scoped_key) if scoped_key else 0}")

val = get_secret("API_SERVER_KEY", "")
print(f"get_secret len={len(val) if val else 0} repr={repr(val[:10] if val else '')}...{repr(val[-10:] if val else '')}")
