# Task Management Guide

**Version**: 1.0  
**Created**: 2026-02-06  
**Purpose**: Comprehensive guide for using the task management and knowledge base system

---

## Table of Contents

1. [Overview](#overview)
2. [Task Difficulty Classification](#task-difficulty-classification)
3. [Creating Tasks](#creating-tasks)
4. [Managing Tasks](#managing-tasks)
5. [Knowledge Base](#knowledge-base)
6. [Task Management Tool](#task-management-tool)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The task management system provides a structured approach to tracking development work, classifying task difficulty, and maintaining a knowledge base of high-difficulty issues and solutions.

### Key Components

1. **Task Difficulty Classification**: Categorize tasks by complexity (Low/Medium/High)
2. **Task Tracking**: Track tasks through their lifecycle
3. **Knowledge Base**: Document high-difficulty issues and solutions
4. **Management Tools**: Automate task and knowledge base operations

### Benefits

- **Improved Planning**: Better estimation and resource allocation
- **Knowledge Sharing**: Learn from past issues and solutions
- **Quality Assurance**: Ensure high-difficulty work is properly documented
- **Team Visibility**: Clear view of all tasks and their status

---

## Task Difficulty Classification

### Understanding Difficulty Levels

#### Low Difficulty

**Characteristics:**
- Simple logic, single module
- Minimal dependencies (0-2)
- Short implementation time (1-4 hours)
- Low risk and impact

**When to Use:**
- Adding new fields to existing models
- Simple API endpoints
- Basic UI updates
- Writing unit tests

**Documentation:** Not required in knowledge base (reference only)

#### Medium Difficulty

**Characteristics:**
- Moderate complexity, 2-3 modules
- Moderate dependencies (3-5)
- Medium implementation time (4-16 hours)
- Medium risk and impact

**When to Use:**
- Implementing new features
- Integrating third-party services
- Refactoring for performance
- Creating reusable components

**Documentation:** Not required in knowledge base (reference only)

#### High Difficulty

**Characteristics:**
- High complexity, 4+ modules
- High dependencies (6+)
- Long implementation time (16+ hours)
- High risk and impact

**When to Use:**
- Real-time communication systems
- Major database migrations
- ML model implementation
- Complex distributed systems
- Security vulnerability fixes

**Documentation:** **REQUIRED** - Must be documented in knowledge base

### Classification Process

#### Step 1: Initial Assessment

Answer these questions:

1. **How many modules will be affected?**
   - 1 module → Likely Low
   - 2-3 modules → Likely Medium
   - 4+ modules → Likely High

2. **How many external dependencies are required?**
   - 0-2 → Likely Low
   - 3-5 → Likely Medium
   - 6+ → Likely High

3. **How much research/planning is needed?**
   - Minimal → Likely Low
   - Some → Likely Medium
   - Extensive → Likely High

4. **What is the risk level?**
   - Low impact → Likely Low
   - Medium impact → Likely Medium
   - High impact → Likely High

#### Step 2: Time Estimation

Use these guidelines:

| Difficulty | Time Range | Notes |
|------------|-----------|-------|
| Low | 1-4 hours | Can be completed in one session |
| Medium | 4-16 hours | May span 1-2 days |
| High | 16+ hours | Requires multiple days or weeks |

#### Step 3: Final Classification

Combine assessment from Steps 1-2. If criteria conflict, use the **highest** level identified.

**Example:**
- Modules: 2 (Medium)
- Dependencies: 3 (Medium)
- Time: 20 hours (High)
- Risk: High (High)

**Result:** High difficulty (use highest level)

### Using the Assessment Tool

Use the task manager tool to assess difficulty:

```bash
python scripts/task_manager.py assess \
  --modules 4 \
  --dependencies 7 \
  --hours 20 \
  --research-needed \
  --risk high
```

**Output:**
```
Assessed Difficulty: HIGH
Reasoning: Affects 4 modules (high complexity); Has 7 dependencies (high); Estimated 20+ hours (long duration); Requires research and planning; High risk level
```

---

## Creating Tasks

### Task Templates

Three templates are available based on difficulty:

1. **task_low.md**: For low-difficulty tasks
2. **task_medium.md**: For medium-difficulty tasks
3. **task_high.md**: For high-difficulty tasks

### Manual Task Creation

1. Copy appropriate template from `.trae/tasks/templates/`
2. Rename to `TASK_XXX_DESCRIPTION.md`
3. Fill out all required fields
4. Save to `.trae/tasks/active/`

**Required Fields:**
- Task ID (auto-generated)
- Title
- Difficulty
- Priority
- Status
- Created date
- Assigned To
- Estimated Hours
- Description
- Acceptance Criteria

### Using Task Manager Tool

Create a task with the CLI tool:

```bash
python scripts/task_manager.py create-task \
  --title "Implement user authentication" \
  --difficulty high \
  --priority high \
  --description "Add JWT-based authentication with refresh tokens" \
  --assigned-to "John Doe" \
  --estimated-hours 24
```

**Output:**
```
Task created: .trae/tasks/active/TASK_001_implement_user_authentication.md
```

### Task File Naming Convention

Use format: `TASK_ID_DESCRIPTION.md`

Examples:
- `TASK_001_add_user_authentication.md`
- `TASK_002_optimize_database_queries.md`
- `TASK_003_fix_memory_leak_in_chat_service.md`

---

## Managing Tasks

### Task Lifecycle

```
pending → in_progress → review → completed → archived
    ↓
  blocked
```

### Task Status Values

- **pending**: Task created but not started
- **in_progress**: Task is currently being worked on
- **blocked**: Task is blocked by dependencies
- **review**: Task is under review
- **completed**: Task is completed
- **archived**: Task is archived

### Updating Task Status

1. Open task file in `.trae/tasks/active/`
2. Update status field
3. Update progress log with changes
4. Save file

### Moving Tasks

Move tasks between directories as they progress:

**To Active:**
```bash
python scripts/task_manager.py move-task --task-id TASK_001 --target-status active
```

**To Completed:**
```bash
python scripts/task_manager.py move-task --task-id TASK_001 --target-status completed
```

### Listing Tasks

List all tasks:
```bash
python scripts/task_manager.py list-tasks --status all
```

List only active tasks:
```bash
python scripts/task_manager.py list-tasks --status active
```

List only completed tasks:
```bash
python scripts/task_manager.py list-tasks --status completed
```

**Output:**
```
Tasks (active):
--------------------------------------------------------------------------------
ID: TASK_001
Title: Implement user authentication
Difficulty: High
Priority: High
Status: in_progress
File: .trae/tasks/active/TASK_001_implement_user_authentication.md
--------------------------------------------------------------------------------
```

### Completing a Task

Before marking a task as completed:

1. **Verify Acceptance Criteria**
   - All acceptance criteria met
   - All tests pass
   - Code reviewed and approved

2. **Update Task File**
   - Set status to `completed`
   - Update actual hours
   - Add final progress log entry

3. **Move to Completed Directory**
   ```bash
   python scripts/task_manager.py move-task --task-id TASK_001 --target-status completed
   ```

4. **For High-Difficulty Tasks Only:**
   - Create knowledge base entry (see Knowledge Base section)
   - Document the issue using [ISSUE_TEMPLATE.md](../docs/ISSUE_TEMPLATE.md)
   - Update knowledge base index

### Archiving Old Tasks

Archive tasks older than 6 months:

1. Move from `.trae/tasks/completed/` to `.trae/tasks/archived/`
2. Update task status to `archived`
3. Keep for historical reference

---

## Knowledge Base

### Purpose

The knowledge base serves as a centralized repository for:

- High-difficulty issues and their solutions
- Technical insights and lessons learned
- Prevention measures for future occurrences
- Alternative approaches considered

### When to Document

**MUST document in knowledge base:**
- All high-difficulty tasks
- Critical bugs
- Complex architectural decisions
- Performance optimizations
- Security vulnerabilities

**OPTIONAL to document:**
- Medium-difficulty tasks (for reference)
- Interesting low-difficulty issues (for learning)

### Knowledge Base Structure

```
knowledge-base/
├── by-module/          # Organized by system component
│   ├── emotion-recognition/
│   ├── assessment/
│   ├── chat/
│   ├── suggestion/
│   └── alert/
├── by-difficulty/      # Organized by difficulty level
│   ├── low/
│   ├── medium/
│   └── high/
├── by-category/        # Organized by issue type
│   ├── bugs/
│   ├── features/
│   ├── refactoring/
│   └── optimization/
├── examples/           # Example entries
└── index.json         # Searchable index
```

### Creating Knowledge Base Entry

#### Step 1: Create Documentation

1. Copy template from [docs/ISSUE_TEMPLATE.md](../docs/ISSUE_TEMPLATE.md)
2. Fill out all required sections
3. Save to appropriate module directory

**Required Sections:**
1. Problem Description
2. Reproduction Steps
3. Technical Analysis
4. Implemented Solution
5. Alternative Approaches Considered
6. Prevention Measures
7. Rollback Plan
8. References
9. Timeline
10. Review and Approval

#### Step 2: Update Index

Add entry to `knowledge-base/index.json`:

```json
{
  "id": "ISSUE_001",
  "title": "Issue Title",
  "module": "emotion-recognition",
  "difficulty": "high",
  "category": "bugs",
  "severity": "critical",
  "status": "resolved",
  "created": "2026-02-06",
  "updated": "2026-02-06",
  "tags": ["emotion", "ml", "performance"],
  "keywords": ["emotion detection", "accuracy", "bert"],
  "file_path": "by-module/emotion-recognition/ISSUE_001_title.md"
}
```

#### Step 3: Using Task Manager Tool

Add entry with CLI tool:

```bash
python scripts/task_manager.py add-kb-entry \
  --issue-id ISSUE_001 \
  --title "Real-time emotion detection with ML model" \
  --module emotion-recognition \
  --difficulty high \
  --category bugs \
  --severity critical \
  --file-path "by-module/emotion-recognition/ISSUE_001_emotion_detection.md" \
  --tags emotion ml performance \
  --keywords "emotion detection accuracy bert"
```

### Searching Knowledge Base

Search by query:
```bash
python scripts/task_manager.py search-kb --query "emotion detection"
```

Search by specific field:
```bash
python scripts/task_manager.py search-kb --query "chat" --field module
```

**Output:**
```
Search Results (2 found):
--------------------------------------------------------------------------------
ID: ISSUE_001
Title: Real-time emotion detection with ML model
Module: emotion-recognition
Difficulty: High
Category: bugs
Severity: Critical
File: by-module/emotion-recognition/ISSUE_001_emotion_detection.md
--------------------------------------------------------------------------------
```

### Listing Knowledge Base Entries

List all entries:
```bash
python scripts/task_manager.py list-kb
```

Filter by module:
```bash
python scripts/task_manager.py list-kb --module emotion-recognition
```

Filter by difficulty:
```bash
python scripts/task_manager.py list-kb --difficulty high
```

Filter by category:
```bash
python scripts/task_manager.py list-kb --category bugs
```

### Knowledge Best Practices

1. **Be Thorough**: Document all aspects of the issue and solution
2. **Include Code Examples**: Show before/after code changes
3. **Provide Context**: Explain why decisions were made
4. **Document Alternatives**: List approaches considered and why they weren't chosen
5. **Focus on Prevention**: Document how to prevent similar issues
6. **Keep Updated**: Update entries as solutions evolve
7. **Use Tags**: Add relevant tags for easy searching
8. **Include References**: Link to related issues, code, and documentation

---

## Task Management Tool

### Overview

The `task_manager.py` script provides CLI utilities for:

- Creating tasks
- Assessing task difficulty
- Listing and moving tasks
- Managing knowledge base entries
- Searching knowledge base

### Available Commands

#### create-task

Create a new task file.

```bash
python scripts/task_manager.py create-task [OPTIONS]
```

**Options:**
- `--title` (required): Task title
- `--difficulty` (required): Difficulty level (low/medium/high)
- `--priority`: Task priority (high/medium/low, default: medium)
- `--description`: Task description
- `--assigned-to`: Developer assigned to task
- `--estimated-hours`: Estimated hours to complete

**Example:**
```bash
python scripts/task_manager.py create-task \
  --title "Add user authentication" \
  --difficulty high \
  --priority high \
  --description "Implement JWT-based authentication" \
  --assigned-to "John Doe" \
  --estimated-hours 24
```

#### assess

Assess task difficulty based on criteria.

```bash
python scripts/task_manager.py assess [OPTIONS]
```

**Options:**
- `--modules` (required): Number of modules affected
- `--dependencies` (required): Number of external dependencies
- `--hours` (required): Estimated hours to complete
- `--research-needed`: Whether research is needed
- `--risk`: Risk level (low/medium/high, default: low)

**Example:**
```bash
python scripts/task_manager.py assess \
  --modules 4 \
  --dependencies 7 \
  --hours 20 \
  --research-needed \
  --risk high
```

#### list-tasks

List tasks with optional status filter.

```bash
python scripts/task_manager.py list-tasks [OPTIONS]
```

**Options:**
- `--status`: Filter by status (all/active/completed, default: all)

**Example:**
```bash
python scripts/task_manager.py list-tasks --status active
```

#### move-task

Move task to different status directory.

```bash
python scripts/task_manager.py move-task [OPTIONS]
```

**Options:**
- `--task-id` (required): Task ID to move
- `--target-status` (required): Target status (active/completed)

**Example:**
```bash
python scripts/task_manager.py move-task \
  --task-id TASK_001 \
  --target-status completed
```

#### add-kb-entry

Add entry to knowledge base index.

```bash
python scripts/task_manager.py add-kb-entry [OPTIONS]
```

**Options:**
- `--issue-id` (required): Unique issue identifier
- `--title` (required): Issue title
- `--module` (required): System module affected
- `--difficulty` (required): Difficulty level (low/medium/high)
- `--category` (required): Issue category (bugs/features/refactoring/optimization)
- `--severity` (required): Severity level (critical/high/medium/low)
- `--file-path` (required): Path to issue documentation
- `--tags`: List of tags
- `--keywords`: List of keywords

**Example:**
```bash
python scripts/task_manager.py add-kb-entry \
  --issue-id ISSUE_001 \
  --title "Memory leak in chat service" \
  --module chat \
  --difficulty high \
  --category bugs \
  --severity critical \
  --file-path "by-module/chat/ISSUE_001_memory_leak.md" \
  --tags memory performance chat \
  --keywords "memory leak websocket"
```

#### search-kb

Search knowledge base entries.

```bash
python scripts/task_manager.py search-kb [OPTIONS]
```

**Options:**
- `--query` (required): Search query
- `--field`: Specific field to search (title/module/tags/keywords)

**Example:**
```bash
python scripts/task_manager.py search-kb --query "emotion detection"
```

#### list-kb

List knowledge base entries with optional filters.

```bash
python scripts/task_manager.py list-kb [OPTIONS]
```

**Options:**
- `--module`: Filter by module
- `--difficulty`: Filter by difficulty (low/medium/high)
- `--category`: Filter by category (bugs/features/refactoring/optimization)

**Example:**
```bash
python scripts/task_manager.py list-kb --module emotion-recognition --difficulty high
```

### Getting Help

View help for all commands:
```bash
python scripts/task_manager.py --help
```

View help for specific command:
```bash
python scripts/task_manager.py create-task --help
```

---

## Best Practices

### Task Creation

1. **Be Specific**: Use clear, descriptive titles
   - ✅ Good: "Implement JWT-based authentication with refresh tokens"
   - ❌ Bad: "Add auth"

2. **Define Acceptance Criteria**: List specific, measurable criteria
   - ✅ Good: "User can login with valid credentials"
   - ❌ Bad: "Login works"

3. **Estimate Realistically**: Consider complexity and dependencies
   - Use historical data from similar tasks
   - Add buffer for unknown factors

4. **Assign Appropriately**: Match task difficulty to developer experience
   - Consider developer's expertise
   - Balance workload across team

### Task Management

1. **Update Regularly**: Keep progress log current
   - Add daily updates
   - Note blockers and dependencies
   - Record decisions made

2. **Communicate**: Share status with team
   - Update task status promptly
   - Notify team of blockers
   - Request help when needed

3. **Review Before Completion**: Ensure quality
   - All acceptance criteria met
   - All tests pass
   - Code reviewed and approved

### Knowledge Base

1. **Document Early**: Start documentation as soon as issue is identified
   - Capture initial symptoms
   - Record reproduction steps
   - Note any workarounds

2. **Be Comprehensive**: Include all relevant information
   - Problem description and analysis
   - Solution implementation details
   - Alternative approaches considered
   - Prevention measures

3. **Use Examples**: Provide concrete examples
   - Code snippets
   - Configuration examples
   - Test cases

4. **Keep Current**: Update as solution evolves
   - Add new findings
   - Update prevention measures
   - Note any side effects

### Team Collaboration

1. **Share Knowledge**: Make knowledge base accessible
   - Regular knowledge sharing sessions
   - Link to knowledge base in code reviews
   - Reference in documentation

2. **Learn from Others**: Review existing knowledge base entries
   - Search before starting similar work
   - Learn from past solutions
   - Contribute improvements

3. **Continuous Improvement**: Refine processes
   - Collect feedback on task management
   - Update templates based on experience
   - Improve tooling and automation

---

## Troubleshooting

### Common Issues

#### Task Not Found

**Problem:** `Task TASK_XXX not found`

**Solutions:**
1. Check task ID is correct
2. Verify task is in active or completed directory
3. Use `list-tasks` to see all tasks

#### Invalid Difficulty

**Problem:** `Invalid difficulty: X`

**Solutions:**
1. Use valid difficulty levels: low, medium, high
2. Check spelling
3. Refer to [TASK_DIFFICULTY_GUIDELINES.md](TASK_DIFFICULTY_GUIDELINES.md)

#### Knowledge Base Entry Not Found

**Problem:** `No results found for query: X`

**Solutions:**
1. Try broader search terms
2. Search without field filter
3. Check spelling
4. Browse by module or category

#### Index File Corrupted

**Problem:** `Error parsing index.json`

**Solutions:**
1. Restore from git history
2. Rebuild index from existing entries
3. Contact team lead for backup

### Getting Help

If you encounter issues:

1. **Check Documentation**: Review this guide and related docs
2. **Search Knowledge Base**: Look for similar issues
3. **Ask Team**: Reach out to team members
4. **Create Issue**: Document the problem for future reference

### Contact Information

- **Team Lead**: [Contact information]
- **Documentation**: [Link to documentation]
- **Issue Tracker**: [Link to issue tracker]

---

## Appendix

### Quick Reference

**Task Difficulty Matrix:**
```
┌──────────┬──────────┬──────────┬──────────┬─────────────────┐
│ Level    │ Modules  │ Deps     │ Time     │ Risk            │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ Low      │ 1        │ 0-2      │ 1-4h     │ Low             │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ Medium   │ 2-3      │ 3-5      │ 4-16h    │ Medium          │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ High     │ 4+       │ 6+       │ 16h+     │ High            │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

**Task Status Flow:**
```
pending → in_progress → review → completed → archived
    ↓
  blocked
```

**Knowledge Base Categories:**
- by-module: Organized by system component
- by-difficulty: Organized by difficulty level
- by-category: Organized by issue type

---

**Last Updated**: 2026-02-06  
**Maintained By**: Development Team  
**Version**: 1.0