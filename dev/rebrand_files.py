"""Apply omnigent -> agent_meow rebrand to specific files."""
import re

files = [
    "integrations/slack/src/omnigent_slack/elicitation.py",
    "integrations/slack/src/omnigent_slack/service.py",
    "integrations/slack/src/omnigent_slack/setup.py",
    "integrations/slack/tests/test_service.py",
    "tests/e2e_ui/chat/test_dictation.py",
    "agent_meow/db/migrations/versions/f4664ca64ea8_consolidate_scheduled_tasks_user_scope_index.py",
]

for f in files:
    try:
        with open(f, "r", encoding="utf-8") as fh:
            content = fh.read()
    except Exception as e:
        print(f"SKIP {f}: {e}")
        continue
    new = content
    new = re.sub(r'from omnigent\.', 'from agent_meow.', new)
    new = re.sub(r'import omnigent\.', 'import agent_meow.', new)
    new = re.sub(r'from omnigent ', 'from agent_meow ', new)
    new = re.sub(r'import omnigent ', 'import agent_meow ', new)
    new = re.sub(r'omnigent\.', 'agent_meow.', new)
    if new != content:
        with open(f, "w", encoding="utf-8", newline="") as fh:
            fh.write(new)
        print(f"REBRANDED: {f}")
    else:
        print(f"OK (no change): {f}")
