"""Update Hermes config to use cloud model with local fallback."""
import yaml

CONFIG_PATH = '/opt/data/config.yaml'

with open(CONFIG_PATH) as f:
    cfg = yaml.safe_load(f)

# Switch main model to cloud deepseek-v4-flash
cfg['model']['default'] = 'deepseek-v4-flash:0731-cloud'

# Set fallback to local nemotron
cfg['fallback_model'] = [{
    'base_url': 'http://host.docker.internal:11434/v1',
    'model': 'nemotron-3.5-lightning:30b-a3b',
    'provider': 'custom',
}]

with open(CONFIG_PATH, 'w') as f:
    yaml.dump(cfg, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

print("Config updated:")
print("  model.default:", cfg['model']['default'])
print("  fallback:", cfg['fallback_model'][0]['model'])
