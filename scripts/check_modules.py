import sys

print(f"sitecustomize loaded: {'sitecustomize' in sys.modules}")
print(f"opentelemetry loaded: {'opentelemetry' in sys.modules}")
print(
    f"aiohttp_client patched: {'opentelemetry.instrumentation.aiohttp_client' in sys.modules}"
)
