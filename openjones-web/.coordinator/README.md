# OpenJones Coordinator System

**Version:** 0.1.0 (Minimal Viable Framework)
**Created:** 2025-11-07
**Status:** Experimental → Production-Ready

---

## 🎯 Vision

Create a **self-improving, hierarchical AI coordination system** that:
- Manages parallel development across multiple AI workers
- Learns from each session to improve future sessions
- Scales from single rounds to multi-round coordinator sessions
- Maintains high code quality through structured verification
- Uses simple file-based commands for easy operation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  COORDINATOR SESSION (1 session)            │
│  ├─ Round 1: Assign N tasks → N workers    │
│  │   ├─ Generate worker instructions       │
│  │   ├─ Workers execute in parallel        │
│  │   ├─ Merge worker branches              │
│  │   └─ Verify integration                 │
│  ├─ Round 2: [Optional, as needed]         │
│  └─ Final: Quality check + session report  │
│      └─ Update instructions for next coord │
└─────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
.coordinator/
├── README.md                          # This file
├── VISION.md                          # Long-term vision and roadmap
├── coordinator-instructions.md        # How to run a coordinator session
├── worker-template.md                 # Template for worker instructions
├── common-mistakes.md                 # Lessons learned (updated each session)
├── session-report.md                  # Latest session report
├── tasks/
│   ├── available/                     # Tasks ready to assign (task-*.md)
│   ├── assigned/                      # Active tasks (task-*.locked)
│   └── completed/                     # Finished tasks (task-*.md)
├── rounds/
│   ├── round-01/                      # Round 1 data
│   │   ├── worker-1.md               # Generated worker instructions
│   │   └── report-worker-1.md        # Worker completion report
│   └── round-02/                      # Round 2 data (if needed)
└── bin/
    └── coordinator.sh                 # Simple commands (future)
```

---

## 🚀 How to Use (Current Version)

### Starting a New Coordinator Session

```bash
cd /home/user/openjones/openjones-web

# Read the coordinator instructions
cat .coordinator/coordinator-instructions.md

# Follow the steps in coordinator-instructions.md
# (In future versions, this will be: coordinator start)
```

### For Workers

Workers receive a single markdown file (e.g., `worker-1.md`) via copy-paste.
In future versions: `worker start 1` will read the file automatically.

---

## 📈 Evolution Roadmap

### Phase 1: Manual Template System ✅ (Current)
- File structure created
- Manual worker instruction generation
- Copy-paste worker instructions
- Manual merge and verification

### Phase 2: Semi-Automated (Next 1-2 Sessions)
- Refined templates based on lessons learned
- Task locking mechanism to prevent duplicates
- Standardized worker report format
- Better verification checklists

### Phase 3: Command System (Sessions 3-4)
- `coordinator start` - Initialize coordinator session
- `coordinator round N` - Prepare round N
- `coordinator merge N` - Merge round N results
- `worker start N` - Read worker-N.md instructions

### Phase 4: Self-Improvement Loop (Sessions 5+)
- Automatic mistake detection and instruction updates
- Quality analysis tools (code-check, design-review)
- Performance metrics and optimization
- Master plan dynamic updates

### Phase 5: Advanced Features (Future)
- AI-driven task assignment optimization
- Automated conflict resolution
- Predictive quality analysis
- Multi-session learning aggregation

---

## 📊 Current Status

**Session:** 1 (2025-11-07)
**Phase:** 1 (Manual Template System)
**Workers Completed:** 5
**Tasks Completed:** 5 (B5, B11, C3, A8, C6)
**Success Rate:** 100%
**Total Tests:** 366+
**Code Quality:** Excellent

---

## 🎓 Key Principles

1. **Start Small:** Prove each concept before adding complexity
2. **File-Based:** Use simple files over complex APIs
3. **Self-Improving:** Each session teaches the next
4. **Clear Boundaries:** Unmistakable start and end points
5. **Quality First:** Never sacrifice quality for speed
6. **Worker Autonomy:** Workers should be self-sufficient
7. **Coordinator Focus:** Coordinator assigns and verifies, doesn't implement

---

## 📝 Next Session Goals

1. Use this framework for the first time
2. Assign 4 tasks in a single round
3. Test worker template effectiveness
4. Collect feedback for Phase 2 improvements
5. Document lessons learned

---

## 🤝 Contributing

This system is designed to improve itself. After each session:
1. Update `common-mistakes.md` with new lessons
2. Update `worker-template.md` based on worker feedback
3. Update `coordinator-instructions.md` with process improvements
4. Add new tasks to `tasks/available/`

The goal is continuous improvement toward full automation.

---

**Last Updated:** 2025-11-07
**Next Review:** After next coordinator session
