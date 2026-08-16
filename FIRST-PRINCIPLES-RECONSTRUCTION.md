# First-Principles Reconstruction: keyi

> Applied Elon Musk's first-principles thinking: break to fundamental truths, rebuild from zero.

## Core Problem

A person in emotional distress needs a safe, immediate, private space to talk and feel heard.

## First Principles Breakdown

1. The prompt IS the product — empathy/safety from system prompt quality, not infrastructure
2. Therapy modes are prompt variations, not software modules
3. Authentication adds friction to crisis moments
4. Two backends is one too many (FastAPI + Next.js)
5. The conversation is the data model: messages, timestamps, user ID

## Essential Features

| P0 | One text box with streaming AI response |
| P0 | Carefully crafted system prompt |
| P0 | Crisis keyword detection with safety resources |
| P1 | Conversation persistence |
| P1 | Multiple therapy modes (prompt switching) |
| P2 | Mood tracking across sessions |

## Current Complexity Audit

- Dual backends (FastAPI + Next.js) — pick one
- 251-line therapy service abstraction over a 10-line prompt switch
- 3 duplicate prompt definitions
- Dead SQLAlchemy models
- Non-functional Supabase Edge Function
- 4 conflicting database schemas
- 1,075-line fantasy reference doc in source
- 623 lines of localStorage-only UI with no backend integration
- 8+ dead code files

## Reconstruction Blueprint

3 core files. Single-stack Next.js. ~800-1,000 lines (down from 3,000+).

## Musk's Razor

10 cuts totaling 5,500+ lines. Irreducible: one chat interface, one API endpoint, one database table, one great prompt.
