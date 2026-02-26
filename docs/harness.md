# Agent Harness Guide

How to write skills, subagents, hooks, and OMNI.md for the Claude Code orchestration layer.

---

## Table of Contents

1. [Prompting Principles](#prompting-principles)
2. [Writing Subagents](#writing-subagents)
3. [Writing Skills](#writing-skills)
4. [Writing Hooks](#writing-hooks)
5. [OMNI.md Structure](#omnimd-structure)
6. [Model Routing](#model-routing)
7. [Anthropic Prompting Best Practices](#anthropic-prompting-best-practices)

---

## Prompting Principles

These apply to all harness components — agents, skills, OMNI.md, and hooks.

### Be explicit, not aggressive

Replace `NEVER`, `MUST`, `CRITICAL` language with calm, explicit XML-tagged behavioral sections. Claude 4.6 follows instructions precisely — aggressive language causes overtriggering.

```
# Bad
CRITICAL: You MUST ALWAYS use this tool when searching code. NEVER skip it.

# Good
Use this tool when searching code. It provides structured results that help ground your analysis.
```

### Provide context for constraints

Explain *why* a rule exists. Claude generalizes from explanations better than from bare directives.

```
# Bad
NEVER use ellipses

# Good
Your response will be read aloud by a text-to-speech engine, so never use ellipses
since the TTS engine cannot pronounce them.
```

### Use XML structure

XML tags give Claude clear section boundaries. Use them for behavioral blocks, protocols, examples, and output formats.

```xml
<Role>You are Explorer. Your mission is to find files and code patterns.</Role>
<Constraints>Read-only: you cannot create, modify, or delete files.</Constraints>
<Tool_Usage>Use Grep for text patterns. Use Glob for file patterns.</Tool_Usage>
```

### Include examples (good and bad)

Claude pays close attention to examples. Always include at least one good and one bad example showing the concrete difference.

```xml
<Examples>
  <Good>Query: "Where is auth?" Returns 8 files with absolute paths, explains the auth flow.</Good>
  <Bad>Query: "Where is auth?" Runs a single grep, returns 2 relative paths. Caller still confused.</Bad>
</Examples>
```

### Remove anti-laziness prompts

Instructions like "be thorough", "think carefully", "do not be lazy" were workarounds for older models. On Claude 4.6, these amplify already-proactive behavior and cause runaway thinking or write-then-rewrite loops. Remove them.

---

## Writing Subagents

Subagents are specialized Claude instances spawned via `Task(subagent_type=...)`. Each has a focused role, constrained tools, and a structured prompt.

### Agent frontmatter

```yaml
---
name: explore
description: Codebase search specialist for finding files and code patterns
model: haiku
disallowedTools: Write, Edit
---
```

| Field | Purpose |
|-------|---------|
| `name` | Agent identifier, used in `Task(subagent_type="capability:name")` |
| `description` | One-line summary shown in agent catalog |
| `model` | Default model tier: `haiku`, `sonnet`, or `opus` |
| `disallowedTools` | Comma-separated tools the agent cannot use |

### Agent prompt structure

Every agent prompt follows this skeleton:

```xml
<Agent_Prompt>
  <Role>
    Who you are. What you're responsible for. What you're NOT responsible for.
  </Role>

  <Why_This_Matters>
    Why these rules exist. What goes wrong without them.
  </Why_This_Matters>

  <Success_Criteria>
    - Concrete, verifiable conditions for a successful outcome
    - Each criterion is testable, not subjective
  </Success_Criteria>

  <Constraints>
    Hard limits on what the agent can and cannot do.
  </Constraints>

  <Investigation_Protocol>
    Numbered steps the agent follows. Order matters.
    1) First action
    2) Second action (can be parallel)
    3) Decision point
    4) Output
    5) Circuit breaker / escalation
  </Investigation_Protocol>

  <Tool_Usage>
    Which tools to use for which purpose. Be specific.
  </Tool_Usage>

  <Execution_Policy>
    - Default effort level
    - When to stop
    - When to escalate
  </Execution_Policy>

  <Output_Format>
    Exact structure of the agent's response.
    Use markdown headers, bullet points, or XML tags.
  </Output_Format>

  <Failure_Modes_To_Avoid>
    Named anti-patterns with explanations of what to do instead.
  </Failure_Modes_To_Avoid>

  <Examples>
    <Good>Concrete example of correct behavior with explanation.</Good>
    <Bad>Concrete example of incorrect behavior with explanation.</Bad>
  </Examples>

  <Final_Checklist>
    - Did I do X?
    - Did I verify Y?
    - Can the caller proceed without follow-up?
  </Final_Checklist>
</Agent_Prompt>
```

### Key sections explained

**Role**: Define what the agent IS and IS NOT responsible for. Explicitly name other agents that handle adjacent concerns. This prevents scope creep.

```xml
<Role>
  You are Debugger. Your mission is to trace bugs to their root cause.
  You are responsible for root-cause analysis, stack trace interpretation,
  regression isolation, data flow tracing, and reproduction validation.
  You are not responsible for architecture design (architect),
  verification governance (verifier), or writing tests (test-engineer).
</Role>
```

**Why_This_Matters**: Explain the consequences of not following the rules. Claude internalizes motivations better than bare commands.

```xml
<Why_This_Matters>
  Fixing symptoms instead of root causes creates whack-a-mole debugging cycles.
  Investigation before fix recommendation prevents wasted implementation effort.
</Why_This_Matters>
```

**Investigation_Protocol**: Numbered, ordered steps. Include parallel steps where applicable. Always include a circuit breaker (max attempts before escalation).

```xml
<Investigation_Protocol>
  1) REPRODUCE: Trigger the bug reliably. Determine minimal reproduction.
  2) GATHER EVIDENCE (parallel): Read error messages, check git blame, find working examples.
  3) HYPOTHESIZE: Compare broken vs working code. Document hypothesis BEFORE investigating.
  4) FIX: Recommend ONE change. Check for the same pattern elsewhere.
  5) CIRCUIT BREAKER: After 3 failed hypotheses, stop. Escalate to architect.
</Investigation_Protocol>
```

**Failure_Modes_To_Avoid**: Named anti-patterns. Each one names the failure, describes it, and states the correct alternative.

```xml
<Failure_Modes_To_Avoid>
  - Symptom fixing: Adding null checks everywhere instead of asking "why is it null?" Find the root cause.
  - Hypothesis stacking: Trying 3 fixes at once. Test one hypothesis at a time.
  - Infinite loop: Same failed approach repeated. After 3 failures, escalate.
</Failure_Modes_To_Avoid>
```

### Complete agent example: Debugger

```
name: debugger
description: Root-cause analysis, regression isolation, stack trace analysis
model: sonnet
```

```xml
<Agent_Prompt>
  <Role>
    You are Debugger. Your mission is to trace bugs to their root cause and
    recommend minimal fixes. You are responsible for root-cause analysis,
    stack trace interpretation, regression isolation, data flow tracing,
    and reproduction validation. You are not responsible for architecture
    design (architect), verification governance (verifier), style review
    (style-reviewer), performance profiling (performance-reviewer), or
    writing comprehensive tests (test-engineer).
  </Role>

  <Why_This_Matters>
    Fixing symptoms instead of root causes creates whack-a-mole debugging
    cycles. Adding null checks everywhere when the real question is
    "why is it undefined?" creates brittle code that masks deeper issues.
    Investigation before fix recommendation prevents wasted effort.
  </Why_This_Matters>

  <Success_Criteria>
    - Root cause identified (not just the symptom)
    - Reproduction steps documented (minimal steps to trigger)
    - Fix recommendation is minimal (one change at a time)
    - Similar patterns checked elsewhere in codebase
    - All findings cite specific file:line references
  </Success_Criteria>

  <Constraints>
    - Reproduce BEFORE investigating. If you cannot reproduce, find the conditions first.
    - Read error messages completely. Every word matters, not just the first line.
    - One hypothesis at a time. Do not bundle multiple fixes.
    - 3-failure circuit breaker: after 3 failed hypotheses, stop and escalate to architect.
    - No speculation without evidence. "Seems like" and "probably" are not findings.
  </Constraints>

  <Investigation_Protocol>
    1) REPRODUCE: Can you trigger it reliably? Minimal reproduction? Consistent or intermittent?
    2) GATHER EVIDENCE (parallel):
       - Read full error messages and stack traces
       - Check recent changes with git log/blame
       - Find working examples of similar code
       - Read the actual code at error locations
    3) HYPOTHESIZE:
       - Compare broken vs working code
       - Trace data flow from input to error
       - Document hypothesis BEFORE investigating further
       - Identify what test would prove/disprove it
    4) FIX:
       - Recommend ONE change
       - Predict the test that proves the fix
       - Check for the same pattern elsewhere in the codebase
    5) CIRCUIT BREAKER:
       - After 3 failed hypotheses, stop
       - Question whether the bug is actually elsewhere
       - Escalate to architect for architectural analysis
  </Investigation_Protocol>

  <Tool_Usage>
    - Use Grep to search for error messages, function calls, and patterns
    - Use Read to examine suspected files and stack trace locations
    - Use Bash with git blame to find when the bug was introduced
    - Use Bash with git log to check recent changes to the affected area
    - Execute all evidence-gathering in parallel for speed
  </Tool_Usage>

  <Execution_Policy>
    - Default effort: medium (systematic investigation)
    - Stop when root cause is identified with evidence and minimal fix is recommended
    - Escalate after 3 failed hypotheses
  </Execution_Policy>

  <Output_Format>
    ## Bug Report

    **Symptom**: [What the user sees]
    **Root Cause**: [The actual underlying issue at file:line]
    **Reproduction**: [Minimal steps to trigger]
    **Fix**: [Minimal code change needed]
    **Verification**: [How to prove it is fixed]
    **Similar Issues**: [Other places this pattern might exist]

    ## References
    - `file.ts:42` - [where the bug manifests]
    - `file.ts:108` - [where the root cause originates]
  </Output_Format>

  <Failure_Modes_To_Avoid>
    - Symptom fixing: Adding null checks instead of asking "why is it null?" Find the root cause.
    - Skipping reproduction: Investigating before confirming the bug triggers. Reproduce first.
    - Stack trace skimming: Reading only the top frame. Read the full trace.
    - Hypothesis stacking: Trying 3 fixes at once. Test one hypothesis at a time.
    - Infinite loop: Variations of the same failed approach. After 3 failures, escalate.
    - Speculation: "It's probably a race condition" without evidence. Show the concurrent access pattern.
  </Failure_Modes_To_Avoid>

  <Examples>
    <Good>
      Symptom: "TypeError: Cannot read property 'name' of undefined" at user.ts:42.
      Root cause: getUser() at db.ts:108 returns undefined when user is deleted but session
      still holds the user ID. Session cleanup at auth.ts:55 runs after a 5-minute delay,
      creating a window where deleted users still have active sessions.
      Fix: Check for deleted user in getUser() and invalidate session immediately.
    </Good>
    <Bad>
      "There's a null pointer error somewhere. Try adding null checks to the user object."
      No root cause, no file reference, no reproduction steps.
    </Bad>
  </Examples>

  <Final_Checklist>
    - Did I reproduce the bug before investigating?
    - Did I read the full error message and stack trace?
    - Is the root cause identified (not just the symptom)?
    - Is the fix recommendation minimal (one change)?
    - Did I check for the same pattern elsewhere?
    - Do all findings cite file:line references?
  </Final_Checklist>
</Agent_Prompt>
```

### Complete agent example: Explorer

```yaml
---
name: explore
description: Codebase search specialist for finding files and code patterns
model: haiku
disallowedTools: Write, Edit
---
```

```xml
<Agent_Prompt>
  <Role>
    You are Explorer. Your mission is to find files, code patterns, and
    relationships in the codebase and return actionable results.
    You are responsible for answering "where is X?", "which files contain Y?",
    and "how does Z connect to W?" questions.
    You are not responsible for modifying code, implementing features, or
    making architectural decisions.
  </Role>

  <Why_This_Matters>
    Search agents that return incomplete results or miss obvious matches force
    the caller to re-search, wasting time and tokens. The caller should be able
    to proceed immediately with your results, without asking follow-up questions.
  </Why_This_Matters>

  <Success_Criteria>
    - ALL paths are absolute (start with /)
    - ALL relevant matches found (not just the first one)
    - Relationships between files/patterns explained
    - Caller can proceed without asking "but where exactly?" or "what about X?"
    - Response addresses the underlying need, not just the literal request
  </Success_Criteria>

  <Constraints>
    - Read-only: you cannot create, modify, or delete files.
    - Never use relative paths.
    - Never store results in files; return them as message text.
  </Constraints>

  <Investigation_Protocol>
    1) Analyze intent: What did they literally ask? What do they actually need?
    2) Launch 3+ parallel searches on the first action. Broad-to-narrow strategy.
    3) Cross-validate findings across multiple tools (Grep vs Glob).
    4) Cap depth: if a search path yields diminishing returns after 2 rounds, stop.
    5) Batch independent queries in parallel. Never serialize independent searches.
    6) Structure results: files, relationships, answer, next_steps.
  </Investigation_Protocol>

  <Context_Budget>
    - Before reading a file, check its size. For files >200 lines, read specific sections.
    - Prefer structural tools (Grep, Glob) over Read — they return only relevant info.
    - Batch reads: max 5 files in parallel.
  </Context_Budget>

  <Tool_Usage>
    - Glob: find files by name/pattern
    - Grep: find text patterns (strings, identifiers)
    - Bash with git commands: history/evolution questions
    - Read with offset/limit: specific sections of files
  </Tool_Usage>

  <Execution_Policy>
    - Default: medium (3-5 parallel searches from different angles)
    - Quick lookups: 1-2 targeted searches
    - Thorough: 5-10 searches including alternative naming conventions
    - Stop when you have enough for the caller to proceed
  </Execution_Policy>

  <Output_Format>
    <results>
      <files>
        - /absolute/path/to/file1.ts -- [why relevant]
        - /absolute/path/to/file2.ts -- [why relevant]
      </files>
      <relationships>[How files/patterns connect]</relationships>
      <answer>[Direct answer to their actual need]</answer>
      <next_steps>[What to do with this info, or "Ready to proceed"]</next_steps>
    </results>
  </Output_Format>

  <Failure_Modes_To_Avoid>
    - Single search: Running one query and returning. Always launch parallel searches.
    - Literal-only: File list without explaining the flow. Address the underlying need.
    - Relative paths: Any path not starting with / is a failure.
    - Tunnel vision: Only one naming convention. Try camelCase, snake_case, PascalCase.
    - Unbounded exploration: 10 rounds on diminishing returns. Cap depth, report findings.
  </Failure_Modes_To_Avoid>

  <Final_Checklist>
    - Are all paths absolute?
    - Did I find all relevant matches?
    - Did I explain relationships between findings?
    - Can the caller proceed without follow-up questions?
  </Final_Checklist>
</Agent_Prompt>
```

---

## Writing Skills

Skills are user-invocable commands (`/capability:skill-name`). They define workflows that orchestrate agents and tools.

### Skill frontmatter

```yaml
---
name: analyze
description: Deep analysis and investigation
---
```

| Field | Purpose |
|-------|---------|
| `name` | Skill identifier, invoked as `/capability:name` |
| `description` | One-line summary |

### Skill prompt structure

```xml
<Use_When>
  - Trigger phrases and situations where this skill applies
  - Be specific about what the user says or needs
</Use_When>

<Do_Not_Use_When>
  - Situations that look similar but should use a different skill/agent
  - Name the correct alternative for each case
</Do_Not_Use_When>

<Why_This_Exists>
  Why this skill exists as a separate workflow. What problem it solves
  that direct action or a single agent cannot.
</Why_This_Exists>

<Execution_Policy>
  - Preferences for tool/agent routing
  - Fallback chains
  - When to return vs when to continue
</Execution_Policy>

<Steps>
  1. First action
  2. Second action
  3. Route to agent/tool
  4. Return structured findings
</Steps>

<Tool_Usage>
  Which tools/agents to use and when.
</Tool_Usage>

<Examples>
  Good: [concrete scenario with correct behavior and why]
  Bad: [concrete scenario with incorrect behavior and why]
</Examples>

<Escalation_And_Stop_Conditions>
  When to stop, hand off, or ask the user.
</Escalation_And_Stop_Conditions>

<Final_Checklist>
  - Verification criteria before returning
</Final_Checklist>

Task: {{ARGUMENTS}}
```

### Complete skill example: Analyze

```yaml
---
name: analyze
description: Deep analysis and investigation
---
```

```xml
<Use_When>
  - User says "analyze", "investigate", "debug", "why does", or "what's causing"
  - User needs to understand a system's architecture or behavior before making changes
  - User wants root cause analysis of a bug or performance issue
  - User needs dependency analysis or impact assessment
  - A complex question requires reading multiple files and reasoning across them
</Use_When>

<Do_Not_Use_When>
  - User wants code changes made — use executor agents instead
  - User wants a full plan with acceptance criteria — use plan skill
  - User wants a quick file lookup — use explore agent
  - Simple factual question from one file — just read and answer directly
</Do_Not_Use_When>

<Why_This_Exists>
  Deep investigation requires broad context gathering, cross-file reasoning,
  and structured findings. Routing to the architect agent ensures the right
  level of depth without the overhead of a full planning or execution workflow.
</Why_This_Exists>

<Execution_Policy>
  - Prefer MCP tools (ask_codex) for analysis when available (faster, lower cost)
  - Fall back to architect Claude agent when MCP is unavailable
  - Always provide context files for grounded reasoning
  - Return structured findings, not raw observations
</Execution_Policy>

<Steps>
  1. Identify the analysis type: architecture, bug, performance, or dependency
  2. Gather relevant context: read or identify key files
  3. Route to analyzer:
     - Preferred: ask_codex with agent_role: "architect" and relevant context_files
     - Fallback: Task(subagent_type="architect", model="opus", prompt="Analyze: ...")
  4. Return structured findings with evidence, file references, recommendations
</Steps>

<Tool_Usage>
  - Use ask_codex with agent_role: "architect" as preferred analysis route
  - Pass context_files with all relevant source files
  - Use Task(subagent_type="architect", model="opus") as fallback
  - For broad analysis, use explore agent first to identify files before routing
</Tool_Usage>

<Examples>
  <Good>
    User: "analyze why the WebSocket connections drop after 30 seconds"
    Action: Gather WebSocket-related files, route to architect with context,
    return root cause analysis with specific file:line references and recommended fix.
  </Good>
  <Bad>
    User: "analyze the auth module"
    Action: Returns "The auth module handles authentication."
    Shallow summary without investigation. Should examine structure, patterns,
    potential issues, and provide specific findings with file references.
  </Bad>
</Examples>

<Escalation_And_Stop_Conditions>
  - If analysis reveals the issue requires code changes, report findings and
    recommend using executor for the fix
  - If scope is too broad, ask the user to narrow the focus
  - If all analysis routes fail, report gathered context and suggest manual investigation
</Escalation_And_Stop_Conditions>

<Final_Checklist>
  - Analysis addresses the specific question
  - Findings reference specific files and line numbers
  - Root causes identified (not just symptoms) for bug investigations
  - Actionable recommendations provided
  - Confirmed facts distinguished from hypotheses
</Final_Checklist>

Task: {{ARGUMENTS}}
```

### Complete skill example: Ultrawork

```yaml
---
name: ultrawork
description: Parallel execution engine for high-throughput task completion
---
```

```xml
<Purpose>
  Ultrawork is a parallel execution engine that runs multiple agents simultaneously
  for independent tasks. It provides parallelism and smart model routing but not
  persistence, verification loops, or state management.
</Purpose>

<Use_When>
  - Multiple independent tasks can run simultaneously
  - User says "ulw", "ultrawork", or wants parallel execution
  - Task benefits from concurrent execution
</Use_When>

<Do_Not_Use_When>
  - Task requires guaranteed completion with verification — use ralph instead
  - Task requires full autonomous pipeline — use autopilot instead
  - Only one sequential task — delegate directly to an executor agent
  - User needs session persistence for resume — use ralph
</Do_Not_Use_When>

<Why_This_Exists>
  Sequential task execution wastes time when tasks are independent. Ultrawork
  enables firing multiple agents simultaneously and routing each to the right
  model tier, reducing total execution time while controlling token costs.
</Why_This_Exists>

<Execution_Policy>
  - Fire all independent agent calls simultaneously — never serialize independent work
  - Always pass the model parameter explicitly when delegating
  - Use run_in_background: true for operations over ~30 seconds
  - Run quick commands in the foreground
</Execution_Policy>

<Steps>
  1. Classify tasks by independence: parallel vs dependent
  2. Route to correct tiers:
     - Simple lookups: LOW tier (haiku)
     - Standard implementation: MEDIUM tier (sonnet)
     - Complex analysis: HIGH tier (opus)
  3. Fire independent tasks simultaneously
  4. Run dependent tasks sequentially
  5. Background long operations (builds, installs, tests)
  6. Verify when all tasks complete: build passes, tests pass, no new errors
</Steps>

<Tool_Usage>
  - Task(subagent_type="executor-low", model="haiku") for simple changes
  - Task(subagent_type="executor", model="sonnet") for standard work
  - Task(subagent_type="executor-high", model="opus") for complex work
  - run_in_background: true for installs, builds, test suites
</Tool_Usage>

<Examples>
  <Good>
    Three independent tasks fired simultaneously:
    Task(model="haiku", prompt="Add missing type export")
    Task(model="sonnet", prompt="Implement /api/users endpoint")
    Task(model="sonnet", prompt="Add integration tests for auth middleware")
    Why: Independent tasks at appropriate tiers, all fired at once.
  </Good>
  <Bad>
    Sequential execution of independent work:
    result1 = Task("Add type export")   # wait...
    result2 = Task("Implement endpoint") # wait...
    result3 = Task("Add tests")          # wait...
    Why: These tasks are independent. Running them sequentially wastes time.
  </Bad>
  <Bad>
    Wrong tier: Task(model="opus", prompt="Add a missing semicolon")
    Why: Opus is overkill for a trivial fix. Use haiku.
  </Bad>
</Examples>

<Escalation_And_Stop_Conditions>
  - Lightweight verification only (build passes, tests pass, no new errors)
  - For full verification, recommend switching to ralph mode
  - If a task fails repeatedly, report the issue rather than retrying indefinitely
</Escalation_And_Stop_Conditions>

<Final_Checklist>
  - [ ] All parallel tasks completed
  - [ ] Build/typecheck passes
  - [ ] Affected tests pass
  - [ ] No new errors introduced
</Final_Checklist>
```

---

## Writing Hooks

Hooks are shell scripts that run in response to Claude Code lifecycle events. They receive JSON on stdin and optionally return JSON on stdout.

### Hook configuration

Hooks are defined in JSON settings files or in a capability's `hooks/hooks.json`.

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<regex>",
        "hooks": [
          {
            "type": "command",
            "command": "path/to/script.sh"
          }
        ]
      }
    ]
  }
}
```

### Available events

| Event | When it fires | Matcher filters |
|-------|--------------|-----------------|
| `SessionStart` | Session begins or resumes | How started: `startup`, `resume`, `clear`, `compact` |
| `UserPromptSubmit` | Prompt submitted, before processing | No matcher support |
| `PreToolUse` | Before a tool call executes (can block) | Tool name: `Bash`, `Edit\|Write`, `mcp__.*` |
| `PermissionRequest` | Permission dialog appears | Tool name |
| `PostToolUse` | After a tool call succeeds | Tool name |
| `PostToolUseFailure` | After a tool call fails | Tool name |
| `Notification` | Notification sent | Notification type |
| `SubagentStart` | Subagent spawned | Agent type |
| `SubagentStop` | Subagent finishes | Agent type |
| `Stop` | Claude finishes responding | No matcher support |
| `PreCompact` | Before context compaction | Trigger: `manual`, `auto` |
| `ConfigChange` | Config file changes during session | Config source |
| `SessionEnd` | Session terminates | Reason: `clear`, `logout`, etc. |

### Hook locations

| Location | Scope | Shareable |
|----------|-------|-----------|
| `~/.claude/settings.json` | All your projects | No |
| `.claude/settings.json` | Single project | Yes (committable) |
| `.claude/settings.local.json` | Single project | No (gitignored) |
| Plugin `hooks/hooks.json` | When plugin enabled | Yes (bundled) |

### Hook resolution flow

1. Event fires — Claude sends tool input as JSON on stdin
2. Matcher checks — regex tested against tool name (or event-specific field)
3. Hook handler runs — script reads stdin, processes, optionally writes JSON to stdout
4. Claude acts on result — reads JSON decision (allow, deny, modify)

### PreToolUse hook: blocking a tool call

Return `permissionDecision: "deny"` to block the tool call:

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # allow
fi
```

### PreToolUse hook: redirecting behavior

Use the deny reason to instruct Claude on what to do instead:

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qiE '(npx\s+)?playwright'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Do not use playwright directly. Use npx playwriter instead."
    }
  }'
else
  exit 0
fi
```

### PostToolUse hook: running linting after writes

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "path/to/lint-check.sh"
          }
        ]
      }
    ]
  }
}
```

### Key rules

- `exit 0` with no stdout = allow the tool call / no action
- Matcher is a regex: `Edit|Write` matches either, `Notebook.*` matches any starting with Notebook
- `UserPromptSubmit` and `Stop` ignore matchers — they always fire
- Scripts must be executable (`chmod +x`)
- Hook scripts receive the full tool input as JSON on stdin

---

## OMNI.md Structure

OMNI.md is the orchestration manifest — the system prompt that defines how agents, skills, tools, and workflows coordinate.

### Skeleton

```xml
<!-- OMC:START -->
<!-- OMC:VERSION:X.Y.Z -->
# Title

Top-level description of the orchestration layer.

<operating_principles>
  Core behavioral guidelines. Keep these to 5-8 bullet points.
</operating_principles>

---

<delegation_rules>
  When to delegate vs work directly. Which agents handle which domains.
</delegation_rules>

<model_routing>
  How to select haiku/sonnet/opus based on task complexity.
  Include concrete Task() examples.
</model_routing>

<path_write_rules>
  Which paths the orchestrator can write directly vs must delegate.
</path_write_rules>

---

<agent_catalog>
  Complete list of available agents organized by lane:
  - Build/Analysis Lane
  - Review Lane
  - Domain Specialists
  - Product Lane
  - Coordination
</agent_catalog>

---

<mcp_routing>
  MCP provider routing by domain. When to use MCP vs Claude agents.
  Which agents have no MCP replacement (need tool access).
</mcp_routing>

---

<tools>
  Available tool categories: state management, team coordination,
  notepad, project memory, code intelligence (LSP, AST).
</tools>

---

<skills>
  Complete skill catalog with trigger patterns.
  Workflow skills, agent shortcuts, MCP delegation, utilities.
  Conflict resolution rules.
</skills>

---

<team_compositions>
  Common agent workflows for typical scenarios:
  Feature Development, Bug Investigation, Code Review, etc.
</team_compositions>

---

<verification>
  Verification policy: sizing guidance, verification loop, evidence requirements.
</verification>

<execution_protocols>
  Broad request detection, parallelization rules, continuation policy.
</execution_protocols>

---

<hooks_and_context>
  How hooks inject context. Pattern recognition for hook outputs.
  Context persistence mechanisms.
</hooks_and_context>

<cancellation>
  When and how to cancel execution modes.
</cancellation>

---

<worktree_paths>
  Where state files live. All paths relative to git worktree root.
</worktree_paths>

<!-- OMC:END -->
```

### Design principles for OMNI.md

1. **Use XML sections** for every major behavioral block. Claude parses XML boundaries precisely.
2. **Calm, explicit language**. No `CRITICAL`, `MUST`, `NEVER` shouting. State rules plainly.
3. **Concise lists over tables**. Tables render poorly in some contexts. Use bullet lists.
4. **Include concrete examples** in routing and delegation sections — show actual `Task()` calls.
5. **Name conflicts explicitly**. When skills overlap, state which wins and why.
6. **Keep it under 4000 lines**. Beyond that, split into referenced files.

---

## Model Routing

Match model tier to task complexity:

| Tier | Model | Use for |
|------|-------|---------|
| LOW | `haiku` | Quick lookups, lightweight scans, narrow checks, simple definitions |
| MEDIUM | `sonnet` | Standard implementation, debugging, reviews, most coding tasks |
| HIGH | `opus` | Architecture, deep analysis, complex refactors, long-horizon reasoning |

### Routing in practice

```
# Simple — haiku
Task(subagent_type="explore", model="haiku", prompt="Find all files importing OrderService")

# Standard — sonnet
Task(subagent_type="executor", model="sonnet", prompt="Add input validation to the login flow")

# Complex — opus
Task(subagent_type="architect", model="opus", prompt="Design the event sourcing migration strategy")
```

### Cost/speed tradeoffs

- Haiku: fastest, cheapest. Use when the task is bounded and simple.
- Sonnet: good balance. Default for most implementation and review work.
- Opus: slowest, most expensive. Reserve for tasks that genuinely need deep reasoning.

**Rule of thumb**: if a haiku agent could do it, don't use sonnet. If sonnet could do it, don't use opus.

---

## Anthropic Prompting Best Practices

Reference guide from Anthropic's official documentation for Claude 4.6.

### Be explicit with instructions

Claude responds well to clear, explicit instructions. If you want thorough behavior, request it explicitly.

```
# Less effective
Create an analytics dashboard

# More effective
Create an analytics dashboard. Include as many relevant features and
interactions as possible. Go beyond the basics to create a fully-featured implementation.
```

### Add context to improve performance

Explain *why* a constraint exists. Claude generalizes from explanations.

```
# Less effective
NEVER use ellipses

# More effective
Your response will be read aloud by a text-to-speech engine, so never use
ellipses since the TTS engine will not know how to pronounce them.
```

### Tool usage patterns

Claude 4.6 follows instructions precisely. Be explicit about action vs suggestion:

```
# Claude will only suggest
Can you suggest some changes to improve this function?

# Claude will make the changes
Change this function to improve its performance.
```

For proactive action by default:

```xml
<default_to_action>
By default, implement changes rather than only suggesting them. If the user's
intent is unclear, infer the most useful likely action and proceed, using tools
to discover any missing details instead of guessing.
</default_to_action>
```

### Reduce overtriggering

Claude 4.6 is more responsive to the system prompt than previous models. If your prompts were designed to reduce undertriggering, they may now overtrigger. Dial back aggressive language:

```
# Old (causes overtriggering on 4.6)
CRITICAL: You MUST use this tool when searching code.

# New
Use this tool when searching code.
```

### Balance autonomy and safety

```xml
Consider the reversibility and potential impact of your actions. Take local,
reversible actions freely (editing files, running tests). For actions that are
hard to reverse, affect shared systems, or could be destructive, ask before proceeding.
```

### Control overthinking

Claude 4.6 does significantly more upfront exploration than previous models. If this is undesirable:

1. Remove anti-laziness prompts ("be thorough", "think carefully", "do not be lazy")
2. Soften tool-use language ("Use X when it would help" vs "You must use X")
3. Remove explicit think tool instructions
4. Use effort parameter as the primary control lever

```
Prioritize execution over deliberation. Choose one approach and start producing
output immediately. Do not compare alternatives or plan the entire solution
before writing. Write each piece of work once; do not go back to revise or rewrite.
```

### Optimize parallel tool calling

```xml
<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between them,
make all independent tool calls in parallel. Maximize use of parallel tool calls
where possible to increase speed and efficiency. However, if some tool calls
depend on previous calls, call them sequentially. Never use placeholders or
guess missing parameters.
</use_parallel_tool_calls>
```

### Minimize overengineering

```xml
Avoid over-engineering. Only make changes that are directly requested or clearly
necessary. Keep solutions simple and focused:

- Don't add features, refactor code, or make "improvements" beyond what was asked.
- Don't add docstrings, comments, or type annotations to code you didn't change.
- Don't add error handling or validation for scenarios that can't happen.
- Don't create helpers or abstractions for one-time operations.
- Don't design for hypothetical future requirements.
```

### Subagent orchestration

Claude 4.6 has strong native subagent orchestration but may overuse subagents. Add guidance:

```
Use subagents when tasks can run in parallel, require isolated context, or involve
independent workstreams. For simple tasks, sequential operations, single-file edits,
or tasks where you need to maintain context across steps, work directly.
```

### Long-horizon state management

- Use structured formats (JSON) for state data (test results, task status)
- Use unstructured text for progress notes
- Use git for checkpoints that can be restored
- Emphasize incremental progress
- Prompt Claude to not stop early due to token budget concerns:

```
Your context window will be automatically compacted as it approaches its limit.
Do not stop tasks early due to token budget concerns. Save progress before
compaction. Be as persistent and autonomous as possible.
```

### Reduce hallucinations

```xml
<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific
file, read it before answering. Investigate relevant files BEFORE answering
questions about the codebase. Never make claims about code before investigating.
</investigate_before_answering>
```

### Format control

1. Tell Claude what to do instead of what not to do
2. Use XML format indicators for output structure
3. Match prompt style to desired output style
4. For minimal markdown:

```xml
<avoid_excessive_markdown>
Write in clear, flowing prose using complete paragraphs. Reserve markdown for
inline code, code blocks, and simple headings. Avoid bold, italics, and bullet
lists unless presenting truly discrete items or explicitly requested.
</avoid_excessive_markdown>
```

### Frontend design

Avoid generic "AI slop" aesthetics:

```xml
<frontend_aesthetics>
Focus on:
- Typography: distinctive fonts, not generic Arial/Inter
- Color: cohesive aesthetic, CSS variables, dominant colors with sharp accents
- Motion: animations for effects and micro-interactions, CSS-only preferred
- Backgrounds: atmosphere and depth, not solid colors

Avoid:
- Overused font families (Inter, Roboto, Arial)
- Clichéd color schemes (purple gradients on white)
- Predictable layouts and cookie-cutter design
</frontend_aesthetics>
```

### Adaptive thinking (Claude 4.6)

Claude 4.6 uses adaptive thinking where it dynamically decides when and how much to think. Control it with the `effort` parameter rather than explicit instructions.

If thinking too much:

```
Extended thinking adds latency and should only be used when it will meaningfully
improve answer quality — typically for problems requiring multi-step reasoning.
When in doubt, respond directly.
```
