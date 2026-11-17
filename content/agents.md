=== agent-arch ===
# What an agent is

An LLM in a loop with tools. The model decides the next action, your code runs it, the result goes back to the model, and this repeats until the task is done.

```python
messages = [system, user_task]
for step in range(MAX_STEPS):
    reply = llm(messages, tools)
    if not reply.tool_calls:
        return reply.text                      # final answer
    for call in reply.tool_calls:
        result = run_tool(call)                # validate, execute, catch errors
        messages.append(tool_result(call, result))
```

# Workflow or agent?

| | Workflow | Agent |
| --- | --- | --- |
| Control | Your code decides the steps | The model decides |
| Best for | Known, repeatable processes | Open-ended tasks |
| Cost and latency | Lower, predictable | Higher, variable |
| Debugging | Easy | Harder |

Common workflow patterns: prompt chaining, routing, parallel calls, evaluator-optimiser loops.

# Reasoning patterns

- **ReAct:** thought, action, observation, repeated.
- **Plan and execute:** write a plan first, then carry it out; replan on failure.
- **Reflection:** the model critiques and revises its own output.
- **Native tool calling:** structured calls from the API, no text parsing.

# Memory

- **Short-term:** the context window. Trim, summarise or compact old turns.
- **Working:** a scratchpad or task file for long jobs.
- **Long-term:** an external store (database, files, vector index) with retrieval.

Decide what to write, when, and how to keep it correct.

# Tools

- Few, clearly named, with precise descriptions and schemas.
- Return concise results and helpful error messages.
- Prefer one well-designed tool over many overlapping ones.

# Limits

Cap steps, time and spend. Detect loops. Checkpoint long tasks.

=== agent-prod ===
# From demo to product

A demo agent works once. A production agent must work reliably, safely and at a known cost.

# Reliability

- **Validate** tool arguments against the schema; return errors to the model so it can correct itself.
- **Retry** transient failures with capped back-off. Retry side effects only if they are idempotent.
- **Timeouts** on every tool.
- **Checkpoints** so a long task can resume.
- Step, time and budget limits.

Reliability compounds: 95% per step is about 36% over 20 steps.

# Multi-agent systems

- **Orchestrator and workers:** a lead splits the task, briefs workers, merges results.
- **Specialists:** for example coder and reviewer.
- Each agent has its own clean context: the main benefit.
- Costs: more tokens, hand-off losses, harder debugging. Start with one agent.

# Model Context Protocol (MCP)

An open standard for exposing tools and data to models. A server offers tools, resources and prompts; any compatible client can connect. It replaces one-off integrations.

# Security

- **Prompt injection:** anything the agent reads may contain instructions. Treat it as data.
- **Least privilege:** narrow tools and credentials.
- **Human approval** for irreversible actions.
- **Sandbox** code execution; restrict the network.
- **Audit logs** of every action.

# Evaluation

- Realistic tasks with a programmatic check of the **final state**.
- Trajectory metrics: steps, tool errors, tokens, cost, latency.
- Repeat runs; report success rates.
- Run the suite on every prompt, tool or model change.

# Cost and latency

Cache stable prompt prefixes, keep tool outputs short, route easy steps to a smaller model, run independent tool calls in parallel.

# Observability

Trace every run: prompts, tool calls, results, tokens and timing. Sample traces for human review and feed failures back into the test set.
