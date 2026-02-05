# Task Difficulty Classification Guidelines

**Version**: 1.0  
**Created**: 2026-02-06  
**Purpose**: Provide standardized criteria for classifying development tasks by difficulty level

---

## Overview

This document defines the criteria for categorizing development tasks into three difficulty levels: **Low**, **Medium**, and **High**. The classification is based on technical requirements, dependencies, and estimated implementation time.

---

## Difficulty Levels

### Low Difficulty

**Definition**: Tasks that are straightforward, well-understood, and can be completed with minimal complexity.

#### Criteria

| Aspect | Requirements |
|--------|-------------|
| **Technical Complexity** | Simple logic, single module, well-defined requirements |
| **Dependencies** | Minimal (0-2 external dependencies) |
| **Implementation Time** | 1-4 hours |
| **Risk Level** | Low - unlikely to affect other components |
| **Testing Requirements** | Basic unit tests (3-5 test cases) |
| **Documentation** | Minimal (inline comments only) |

#### Examples

- Adding a new field to an existing data model
- Implementing a simple API endpoint with CRUD operations
- Adding basic validation to existing forms
- Updating UI text or styling
- Writing unit tests for existing functionality

#### Characteristics

- Clear acceptance criteria
- No architectural changes required
- Reuses existing patterns
- Minimal code review complexity
- Can be completed independently

---

### Medium Difficulty

**Definition**: Tasks that involve moderate complexity, multiple components, or require some research and planning.

#### Criteria

| Aspect | Requirements |
|--------|-------------|
| **Technical Complexity** | Moderate complexity, 2-3 modules, some integration work |
| **Dependencies** | Moderate (3-5 external dependencies) |
| **Implementation Time** | 4-16 hours (1-2 days) |
| **Risk Level** | Medium - may affect related components |
| **Testing Requirements** | Unit + integration tests (10-20 test cases) |
| **Documentation** | Code comments + basic documentation updates |

#### Examples

- Implementing a new feature with multiple components
- Integrating third-party API or service
- Refactoring existing code for better performance
- Adding authentication/authorization to existing endpoints
- Implementing caching strategy
- Creating reusable UI components

#### Characteristics

- Requires some design consideration
- May involve database schema changes
- Requires coordination with team members
- Needs code review from at least one senior developer
- May require performance optimization

---

### High Difficulty

**Definition**: Tasks that are complex, involve significant architectural changes, require extensive research, or have high risk.

#### Criteria

| Aspect | Requirements |
|--------|-------------|
| **Technical Complexity** | High complexity, 4+ modules, significant integration work |
| **Dependencies** | High (6+ external dependencies) |
| **Implementation Time** | 16+ hours (3+ days) |
| **Risk Level** | High - may affect core system functionality |
| **Testing Requirements** | Comprehensive testing (20+ test cases, including edge cases) |
| **Documentation** | Full documentation including architecture diagrams, API docs, and user guides |

#### Examples

- Implementing real-time communication (WebSockets, etc.)
- Major database migration or schema redesign
- Implementing machine learning models
- Building complex distributed systems
- Performance optimization of critical paths
- Security vulnerability fixes
- Implementing complex business logic with multiple edge cases

#### Characteristics

- Requires significant planning and research
- May require proof-of-concept (PoC)
- Involves architectural decisions
- Requires team-wide communication
- Needs thorough code review from multiple developers
- May require rollback strategy
- **MUST be documented in knowledge base**

---

## Classification Process

### Step 1: Initial Assessment

When a new task is identified, answer these questions:

1. **What modules/components will be affected?**
   - 1 module → Likely Low
   - 2-3 modules → Likely Medium
   - 4+ modules → Likely High

2. **What external dependencies are required?**
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

### Step 2: Time Estimation

Use the following guidelines:

| Difficulty | Time Range | Notes |
|------------|-----------|-------|
| Low | 1-4 hours | Can be completed in one session |
| Medium | 4-16 hours | May span 1-2 days |
| High | 16+ hours | Requires multiple days or weeks |

### Step 3: Final Classification

Combine the assessment from Steps 1-2 to determine the final difficulty level. If criteria conflict, use the **highest** level identified.

---

## Special Cases

### Task Downgrade

A task may be downgraded if:
- Similar work has been done before (patterns exist)
- Clear documentation and examples are available
- Dependencies are well-tested and stable

### Task Upgrade

A task may be upgraded if:
- Unknown technical challenges emerge
- Dependencies are unstable or poorly documented
- Requirements change mid-development
- Performance or security concerns arise

### Splitting High-Difficulty Tasks

High-difficulty tasks should be split into smaller, manageable subtasks when possible:

1. Identify independent components
2. Create subtasks with clear dependencies
3. Assign appropriate difficulty to each subtask
4. Maintain traceability to parent task

---

## Documentation Requirements

### Low Difficulty Tasks

- Task description with acceptance criteria
- Basic implementation notes
- Test cases

### Medium Difficulty Tasks

- Detailed task description
- Design approach or pseudocode
- Implementation plan with milestones
- Test strategy
- Known risks and mitigation

### High Difficulty Tasks

- Comprehensive task specification
- Architecture diagrams
- Detailed implementation plan
- Risk assessment and mitigation strategies
- Rollback plan
- Testing strategy (unit, integration, E2E)
- Performance benchmarks (if applicable)
- **Full issue documentation in knowledge base**

---

## Review Process

### Low Difficulty Tasks

- Self-review
- Optional peer review
- Automated tests must pass

### Medium Difficulty Tasks

- Self-review
- Peer review from at least one developer
- Code review approval required
- All tests must pass

### High Difficulty Tasks

- Self-review
- Peer review from multiple developers
- Architectural review (if applicable)
- Security review (if applicable)
- Performance review (if applicable)
- All tests must pass
- Documentation must be complete
- Knowledge base entry must be created

---

## Metrics and Tracking

Track the following metrics for continuous improvement:

1. **Task Completion Time**: Actual vs. estimated time by difficulty level
2. **Bug Rate**: Number of bugs found post-deployment by difficulty level
3. **Rework Rate**: Percentage of tasks requiring significant changes
4. **Documentation Quality**: Peer review scores for high-difficulty task documentation

---

## Appendix: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    TASK DIFFICULTY MATRIX                    │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Level    │ Modules  │ Deps     │ Time     │ Risk            │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ Low      │ 1        │ 0-2      │ 1-4h     │ Low             │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ Medium   │ 2-3      │ 3-5      │ 4-16h    │ Medium          │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ High     │ 4+       │ 6+       │ 16h+     │ High            │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

---

**Last Updated**: 2026-02-06  
**Maintained By**: Development Team  
**Review Frequency**: Quarterly