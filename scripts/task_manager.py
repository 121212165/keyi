#!/usr/bin/env python3
"""
Task Management Utilities

This script provides utilities for managing tasks, assessing difficulty,
and maintaining the knowledge base.
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class TaskManager:
    """Manages task creation and tracking."""
    
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.tasks_dir = base_dir / ".trae" / "tasks"
        self.templates_dir = self.tasks_dir / "templates"
        self.active_dir = self.tasks_dir / "active"
        self.completed_dir = self.tasks_dir / "completed"
        self.knowledge_base_dir = base_dir / "knowledge-base"
        self.index_file = self.knowledge_base_dir / "index.json"
        
        # Ensure directories exist
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Create necessary directories if they don't exist."""
        self.tasks_dir.mkdir(parents=True, exist_ok=True)
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        self.active_dir.mkdir(parents=True, exist_ok=True)
        self.completed_dir.mkdir(parents=True, exist_ok=True)
        self.knowledge_base_dir.mkdir(parents=True, exist_ok=True)
    
    def create_task(
        self,
        title: str,
        difficulty: str,
        priority: str = "medium",
        description: str = "",
        assigned_to: str = "",
        estimated_hours: int = 0,
    ) -> Path:
        """
        Create a new task file based on difficulty level.
        
        Args:
            title: Task title
            difficulty: Task difficulty (low/medium/high)
            priority: Task priority (high/medium/low)
            description: Task description
            assigned_to: Developer assigned to task
            estimated_hours: Estimated hours to complete
        
        Returns:
            Path to created task file
        """
        # Validate difficulty
        difficulty = difficulty.lower()
        if difficulty not in ["low", "medium", "high"]:
            raise ValueError(f"Invalid difficulty: {difficulty}. Must be low, medium, or high.")
        
        # Validate priority
        priority = priority.lower()
        if priority not in ["high", "medium", "low"]:
            raise ValueError(f"Invalid priority: {priority}. Must be high, medium, or low.")
        
        # Generate task ID
        task_id = self._generate_task_id()
        
        # Select appropriate template
        template_file = self.templates_dir / f"task_{difficulty}.md"
        if not template_file.exists():
            template_file = self.templates_dir / "task_template.md"
        
        # Read template
        with open(template_file, 'r', encoding='utf-8') as f:
            template_content = f.read()
        
        # Fill template
        task_content = template_content.replace("[Task Title]", title)
        task_content = task_content.replace("TASK_XXX", task_id)
        task_content = task_content.replace("[Difficulty]", difficulty.capitalize())
        task_content = task_content.replace("[Priority]", priority.capitalize())
        task_content = task_content.replace("YYYY-MM-DD", datetime.now().strftime("%Y-%m-%d"))
        task_content = task_content.replace("[Developer Name]", assigned_to)
        task_content = task_content.replace("[Number]", str(estimated_hours))
        
        if description:
            task_content = task_content.replace(
                "[Provide a clear, concise description of what needs to be accomplished]",
                description
            )
        
        # Create task file
        task_filename = f"{task_id}_{title.replace(' ', '_').lower()}.md"
        task_path = self.active_dir / task_filename
        
        with open(task_path, 'w', encoding='utf-8') as f:
            f.write(task_content)
        
        print(f"Task created: {task_path}")
        return task_path
    
    def _generate_task_id(self) -> str:
        """Generate a unique task ID."""
        existing_tasks = list(self.active_dir.glob("TASK_*.md")) + \
                       list(self.completed_dir.glob("TASK_*.md"))
        
        max_id = 0
        for task_file in existing_tasks:
            try:
                task_id = int(task_file.stem.split("_")[1])
                max_id = max(max_id, task_id)
            except (ValueError, IndexError):
                continue
        
        return f"TASK_{max_id + 1:03d}"
    
    def list_tasks(self, status: str = "all") -> List[Dict]:
        """
        List tasks with optional status filter.
        
        Args:
            status: Filter by status (active/completed/all)
        
        Returns:
            List of task dictionaries
        """
        tasks = []
        
        if status in ["all", "active"]:
            for task_file in self.active_dir.glob("TASK_*.md"):
                task_info = self._parse_task_file(task_file, "active")
                if task_info:
                    tasks.append(task_info)
        
        if status in ["all", "completed"]:
            for task_file in self.completed_dir.glob("TASK_*.md"):
                task_info = self._parse_task_file(task_file, "completed")
                if task_info:
                    tasks.append(task_info)
        
        return tasks
    
    def _parse_task_file(self, task_file: Path, status: str) -> Optional[Dict]:
        """Parse task file and extract key information."""
        try:
            with open(task_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            task_info = {
                "file": str(task_file),
                "status": status,
            }
            
            # Extract task ID
            for line in content.split('\n')[:20]:
                if line.startswith("**Task ID**"):
                    task_info["id"] = line.split(":")[1].strip()
                elif line.startswith("**Title**"):
                    task_info["title"] = line.split(":")[1].strip()
                elif line.startswith("**Difficulty**"):
                    task_info["difficulty"] = line.split(":")[1].strip()
                elif line.startswith("**Priority**"):
                    task_info["priority"] = line.split(":")[1].strip()
                elif line.startswith("**Status**"):
                    task_info["task_status"] = line.split(":")[1].strip()
            
            return task_info
        
        except Exception as e:
            print(f"Error parsing task file {task_file}: {e}")
            return None
    
    def move_task(self, task_id: str, target_status: str):
        """
        Move task to different status directory.
        
        Args:
            task_id: Task ID to move
            target_status: Target status (active/completed)
        """
        if target_status not in ["active", "completed"]:
            raise ValueError(f"Invalid target status: {target_status}")
        
        # Find task file
        task_file = None
        for search_dir in [self.active_dir, self.completed_dir]:
            for file in search_dir.glob(f"{task_id}_*.md"):
                task_file = file
                break
        
        if not task_file:
            print(f"Task {task_id} not found")
            return
        
        # Move task
        target_dir = self.active_dir if target_status == "active" else self.completed_dir
        new_path = target_dir / task_file.name
        task_file.rename(new_path)
        
        print(f"Task moved to {target_status}: {new_path}")


class DifficultyAssessor:
    """Assesses task difficulty based on criteria."""
    
    def __init__(self):
        self.criteria = {
            "modules": {
                "low": 1,
                "medium": 3,
                "high": 4,
            },
            "dependencies": {
                "low": 2,
                "medium": 5,
                "high": 6,
            },
            "hours": {
                "low": 4,
                "medium": 16,
                "high": 16,
            },
        }
    
    def assess(
        self,
        modules: int,
        dependencies: int,
        hours: int,
        research_needed: bool = False,
        risk_level: str = "low",
    ) -> Tuple[str, str]:
        """
        Assess task difficulty based on provided criteria.
        
        Args:
            modules: Number of modules affected
            dependencies: Number of external dependencies
            hours: Estimated hours to complete
            research_needed: Whether research is needed
            risk_level: Risk level (low/medium/high)
        
        Returns:
            Tuple of (difficulty, reasoning)
        """
        scores = {
            "low": 0,
            "medium": 0,
            "high": 0,
        }
        
        # Assess based on modules
        if modules <= self.criteria["modules"]["low"]:
            scores["low"] += 1
        elif modules <= self.criteria["modules"]["medium"]:
            scores["medium"] += 1
        else:
            scores["high"] += 1
        
        # Assess based on dependencies
        if dependencies <= self.criteria["dependencies"]["low"]:
            scores["low"] += 1
        elif dependencies <= self.criteria["dependencies"]["medium"]:
            scores["medium"] += 1
        else:
            scores["high"] += 1
        
        # Assess based on hours
        if hours <= self.criteria["hours"]["low"]:
            scores["low"] += 1
        elif hours <= self.criteria["hours"]["medium"]:
            scores["medium"] += 1
        else:
            scores["high"] += 1
        
        # Assess based on research
        if research_needed:
            scores["high"] += 1
        else:
            scores["low"] += 1
        
        # Assess based on risk
        if risk_level == "low":
            scores["low"] += 1
        elif risk_level == "medium":
            scores["medium"] += 1
        else:
            scores["high"] += 1
        
        # Determine difficulty
        difficulty = max(scores, key=scores.get)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            modules, dependencies, hours, research_needed, risk_level
        )
        
        return difficulty, reasoning
    
    def _generate_reasoning(
        self,
        modules: int,
        dependencies: int,
        hours: int,
        research_needed: bool,
        risk_level: str,
    ) -> str:
        """Generate reasoning for difficulty assessment."""
        reasons = []
        
        if modules > 3:
            reasons.append(f"Affects {modules} modules (high complexity)")
        elif modules > 1:
            reasons.append(f"Affects {modules} modules (moderate complexity)")
        
        if dependencies > 5:
            reasons.append(f"Has {dependencies} dependencies (high)")
        elif dependencies > 2:
            reasons.append(f"Has {dependencies} dependencies (moderate)")
        
        if hours > 16:
            reasons.append(f"Estimated {hours}+ hours (long duration)")
        elif hours > 4:
            reasons.append(f"Estimated {hours} hours (moderate duration)")
        
        if research_needed:
            reasons.append("Requires research and planning")
        
        if risk_level == "high":
            reasons.append("High risk level")
        elif risk_level == "medium":
            reasons.append("Medium risk level")
        
        return "; ".join(reasons) if reasons else "Simple, well-defined task"


class KnowledgeBaseManager:
    """Manages knowledge base entries and indexing."""
    
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.kb_dir = base_dir / "knowledge-base"
        self.index_file = self.kb_dir / "index.json"
        
        # Ensure directory exists
        self.kb_dir.mkdir(parents=True, exist_ok=True)
        
        # Load or create index
        self._load_index()
    
    def _load_index(self):
        """Load knowledge base index."""
        if self.index_file.exists():
            with open(self.index_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.entries = data.get("entries", [])
                self.metadata = data.get("metadata", {})
        else:
            self.entries = []
            self.metadata = {
                "total_entries": 0,
                "last_updated": datetime.now().strftime("%Y-%m-%d"),
                "version": "1.0",
            }
    
    def _save_index(self):
        """Save knowledge base index."""
        with open(self.index_file, 'w', encoding='utf-8') as f:
            json.dump({
                "entries": self.entries,
                "metadata": {
                    **self.metadata,
                    "total_entries": len(self.entries),
                    "last_updated": datetime.now().strftime("%Y-%m-%d"),
                }
            }, f, indent=2, ensure_ascii=False)
    
    def add_entry(
        self,
        issue_id: str,
        title: str,
        module: str,
        difficulty: str,
        category: str,
        severity: str,
        file_path: str,
        tags: List[str] = None,
        keywords: List[str] = None,
    ):
        """
        Add entry to knowledge base index.
        
        Args:
            issue_id: Unique issue identifier
            title: Issue title
            module: System module affected
            difficulty: Difficulty level
            category: Issue category
            severity: Severity level
            file_path: Path to issue documentation
            tags: List of tags for search
            keywords: List of keywords for search
        """
        entry = {
            "id": issue_id,
            "title": title,
            "module": module,
            "difficulty": difficulty,
            "category": category,
            "severity": severity,
            "status": "open",
            "created": datetime.now().strftime("%Y-%m-%d"),
            "updated": datetime.now().strftime("%Y-%m-%d"),
            "tags": tags or [],
            "keywords": keywords or [],
            "file_path": file_path,
        }
        
        self.entries.append(entry)
        self._save_index()
        
        print(f"Knowledge base entry added: {issue_id}")
    
    def search(self, query: str, field: str = None) -> List[Dict]:
        """
        Search knowledge base entries.
        
        Args:
            query: Search query
            field: Specific field to search (title/module/tags/keywords)
        
        Returns:
            List of matching entries
        """
        query = query.lower()
        results = []
        
        for entry in self.entries:
            if field:
                # Search specific field
                if field in entry and query in str(entry[field]).lower():
                    results.append(entry)
            else:
                # Search all fields
                searchable_text = " ".join([
                    entry.get("title", ""),
                    entry.get("module", ""),
                    " ".join(entry.get("tags", [])),
                    " ".join(entry.get("keywords", [])),
                ]).lower()
                
                if query in searchable_text:
                    results.append(entry)
        
        return results
    
    def list_entries(
        self,
        module: str = None,
        difficulty: str = None,
        category: str = None,
    ) -> List[Dict]:
        """
        List knowledge base entries with optional filters.
        
        Args:
            module: Filter by module
            difficulty: Filter by difficulty
            category: Filter by category
        
        Returns:
            List of matching entries
        """
        results = self.entries
        
        if module:
            results = [e for e in results if e.get("module") == module]
        
        if difficulty:
            results = [e for e in results if e.get("difficulty") == difficulty]
        
        if category:
            results = [e for e in results if e.get("category") == category]
        
        return results


def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description="Task Management Utilities",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create a new task
  python task_manager.py create-task --title "Add user authentication" --difficulty high --priority high
  
  # Assess task difficulty
  python task_manager.py assess --modules 4 --dependencies 7 --hours 20 --research-needed --risk high
  
  # List all tasks
  python task_manager.py list-tasks --status all
  
  # Add knowledge base entry
  python task_manager.py add-kb-entry --issue-id ISSUE_001 --title "Memory leak in chat service" --module chat --difficulty high --category bugs --severity critical
  
  # Search knowledge base
  python task_manager.py search-kb --query "emotion detection"
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Create task command
    create_task_parser = subparsers.add_parser("create-task", help="Create a new task")
    create_task_parser.add_argument("--title", required=True, help="Task title")
    create_task_parser.add_argument("--difficulty", required=True, choices=["low", "medium", "high"], help="Task difficulty")
    create_task_parser.add_argument("--priority", default="medium", choices=["high", "medium", "low"], help="Task priority")
    create_task_parser.add_argument("--description", default="", help="Task description")
    create_task_parser.add_argument("--assigned-to", default="", help="Developer assigned to task")
    create_task_parser.add_argument("--estimated-hours", type=int, default=0, help="Estimated hours to complete")
    
    # Assess difficulty command
    assess_parser = subparsers.add_parser("assess", help="Assess task difficulty")
    assess_parser.add_argument("--modules", type=int, required=True, help="Number of modules affected")
    assess_parser.add_argument("--dependencies", type=int, required=True, help="Number of external dependencies")
    assess_parser.add_argument("--hours", type=int, required=True, help="Estimated hours to complete")
    assess_parser.add_argument("--research-needed", action="store_true", help="Whether research is needed")
    assess_parser.add_argument("--risk", default="low", choices=["low", "medium", "high"], help="Risk level")
    
    # List tasks command
    list_tasks_parser = subparsers.add_parser("list-tasks", help="List tasks")
    list_tasks_parser.add_argument("--status", default="all", choices=["all", "active", "completed"], help="Filter by status")
    
    # Move task command
    move_task_parser = subparsers.add_parser("move-task", help="Move task to different status")
    move_task_parser.add_argument("--task-id", required=True, help="Task ID to move")
    move_task_parser.add_argument("--target-status", required=True, choices=["active", "completed"], help="Target status")
    
    # Add KB entry command
    add_kb_parser = subparsers.add_parser("add-kb-entry", help="Add knowledge base entry")
    add_kb_parser.add_argument("--issue-id", required=True, help="Unique issue identifier")
    add_kb_parser.add_argument("--title", required=True, help="Issue title")
    add_kb_parser.add_argument("--module", required=True, help="System module affected")
    add_kb_parser.add_argument("--difficulty", required=True, choices=["low", "medium", "high"], help="Difficulty level")
    add_kb_parser.add_argument("--category", required=True, choices=["bugs", "features", "refactoring", "optimization"], help="Issue category")
    add_kb_parser.add_argument("--severity", required=True, choices=["critical", "high", "medium", "low"], help="Severity level")
    add_kb_parser.add_argument("--file-path", required=True, help="Path to issue documentation")
    add_kb_parser.add_argument("--tags", nargs="*", default=[], help="List of tags")
    add_kb_parser.add_argument("--keywords", nargs="*", default=[], help="List of keywords")
    
    # Search KB command
    search_kb_parser = subparsers.add_parser("search-kb", help="Search knowledge base")
    search_kb_parser.add_argument("--query", required=True, help="Search query")
    search_kb_parser.add_argument("--field", choices=["title", "module", "tags", "keywords"], help="Specific field to search")
    
    # List KB entries command
    list_kb_parser = subparsers.add_parser("list-kb", help="List knowledge base entries")
    list_kb_parser.add_argument("--module", help="Filter by module")
    list_kb_parser.add_argument("--difficulty", choices=["low", "medium", "high"], help="Filter by difficulty")
    list_kb_parser.add_argument("--category", choices=["bugs", "features", "refactoring", "optimization"], help="Filter by category")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Get base directory
    base_dir = Path(__file__).parent.parent
    
    if args.command == "create-task":
        manager = TaskManager(base_dir)
        manager.create_task(
            title=args.title,
            difficulty=args.difficulty,
            priority=args.priority,
            description=args.description,
            assigned_to=args.assigned_to,
            estimated_hours=args.estimated_hours,
        )
    
    elif args.command == "assess":
        assessor = DifficultyAssessor()
        difficulty, reasoning = assessor.assess(
            modules=args.modules,
            dependencies=args.dependencies,
            hours=args.hours,
            research_needed=args.research_needed,
            risk_level=args.risk,
        )
        print(f"\nAssessed Difficulty: {difficulty.upper()}")
        print(f"Reasoning: {reasoning}")
    
    elif args.command == "list-tasks":
        manager = TaskManager(base_dir)
        tasks = manager.list_tasks(status=args.status)
        
        if not tasks:
            print(f"No tasks found with status: {args.status}")
        else:
            print(f"\nTasks ({args.status}):")
            print("-" * 80)
            for task in tasks:
                print(f"ID: {task.get('id', 'N/A')}")
                print(f"Title: {task.get('title', 'N/A')}")
                print(f"Difficulty: {task.get('difficulty', 'N/A')}")
                print(f"Priority: {task.get('priority', 'N/A')}")
                print(f"Status: {task.get('task_status', 'N/A')}")
                print(f"File: {task.get('file', 'N/A')}")
                print("-" * 80)
    
    elif args.command == "move-task":
        manager = TaskManager(base_dir)
        manager.move_task(args.task_id, args.target_status)
    
    elif args.command == "add-kb-entry":
        kb_manager = KnowledgeBaseManager(base_dir)
        kb_manager.add_entry(
            issue_id=args.issue_id,
            title=args.title,
            module=args.module,
            difficulty=args.difficulty,
            category=args.category,
            severity=args.severity,
            file_path=args.file_path,
            tags=args.tags,
            keywords=args.keywords,
        )
    
    elif args.command == "search-kb":
        kb_manager = KnowledgeBaseManager(base_dir)
        results = kb_manager.search(args.query, args.field)
        
        if not results:
            print(f"No results found for query: {args.query}")
        else:
            print(f"\nSearch Results ({len(results)} found):")
            print("-" * 80)
            for entry in results:
                print(f"ID: {entry.get('id', 'N/A')}")
                print(f"Title: {entry.get('title', 'N/A')}")
                print(f"Module: {entry.get('module', 'N/A')}")
                print(f"Difficulty: {entry.get('difficulty', 'N/A')}")
                print(f"Category: {entry.get('category', 'N/A')}")
                print(f"Severity: {entry.get('severity', 'N/A')}")
                print(f"File: {entry.get('file_path', 'N/A')}")
                print("-" * 80)
    
    elif args.command == "list-kb":
        kb_manager = KnowledgeBaseManager(base_dir)
        entries = kb_manager.list_entries(
            module=args.module,
            difficulty=args.difficulty,
            category=args.category,
        )
        
        if not entries:
            print("No entries found")
        else:
            print(f"\nKnowledge Base Entries ({len(entries)} found):")
            print("-" * 80)
            for entry in entries:
                print(f"ID: {entry.get('id', 'N/A')}")
                print(f"Title: {entry.get('title', 'N/A')}")
                print(f"Module: {entry.get('module', 'N/A')}")
                print(f"Difficulty: {entry.get('difficulty', 'N/A')}")
                print(f"Category: {entry.get('category', 'N/A')}")
                print(f"Severity: {entry.get('severity', 'N/A')}")
                print(f"Status: {entry.get('status', 'N/A')}")
                print(f"File: {entry.get('file_path', 'N/A')}")
                print("-" * 80)


if __name__ == "__main__":
    main()