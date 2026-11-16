# Mitigating Indirect Prompt Injection in MCP

Tools returning unvetted content can inject instructions that override LLM system prompts:
- Sanitize tool return payloads before forwarding to the model.
- Restrict file and command scopes using explicit boundary configurations.
