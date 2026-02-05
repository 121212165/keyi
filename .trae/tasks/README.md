# Task Tracking Structure

This directory contains task templates and tracking files for the AI Psychologist project.

## Directory Structure

```
.trae/tasks/
├── README.md                    # This file
├── templates/                   # Task templates
│   ├── task_template.md         # Generic task template
│   ├── task_low.md             # Low difficulty task template
│   ├── task_medium.md          # Medium difficulty task template
│   └── task_high.md            # High difficulty task template
├── active/                     # Currently active tasks
├── completed/                  # Completed tasks
└── archived/                   # Archived tasks
```

## Task Templates

Use the appropriate template based on task difficulty:

- **task_low.md**: For low-difficulty tasks (1-4 hours, 1 module, 0-2 dependencies)
- **task_medium.md**: For medium-difficulty tasks (4-16 hours, 2-3 modules, 3-5 dependencies)
- **task_high.md**: For high-difficulty tasks (16+ hours, 4+ modules, 6+ dependencies)

See [TASK_DIFFICULTY_GUIDELINES.md](../../docs/TASK_DIFFICULTY_GUIDELINES.md) for detailed classification criteria.

## Task Lifecycle

1. **Create**: Copy appropriate template to `active/` directory
2. **Fill**: Complete all required fields
3. **Track**: Update status as work progresses
4. **Complete**: Move to `completed/` directory
5. **Archive**: Move old completed tasks to `archived/` directory

## Task File Naming Convention

Use the following format: `TASK_ID_DESCRIPTION.md`

Example: `TASK_001_add_user_authentication.md`

## Task Status Values

- `pending`: Task created but not started
- `in_progress`: Task is currently being worked on
- `blocked`: Task is blocked by dependencies
- `review`: Task is under review
- `completed`: Task is completed
- `archived`: Task is archived

## Priority Levels

- `high`: Critical tasks that block other work
- `medium`: Important tasks that should be done soon
- `low`: Nice-to-have tasks

## Related Documentation

- [Task Difficulty Guidelines](../../docs/TASK_DIFFICULTY_GUIDELINES.md)
- [Task Management Guide](../../docs/TASK_MANAGEMENT_GUIDE.md)
- [Knowledge Base](../../knowledge-base/)