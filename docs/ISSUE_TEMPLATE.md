# High-Difficulty Issue Documentation Template

**Issue ID**: ISSUE_XXX  
**Title**: [Issue Title]  
**Related Task**: TASK_XXX  
**Severity**: [Critical/High/Medium/Low]  
**Status**: [Open/In Progress/Resolved/Closed]  
**Created**: YYYY-MM-DD  
**Updated**: YYYY-MM-DD  
**Reported By**: [Developer Name]  
**Assigned To**: [Developer Name]

---

## 1. Problem Description

### Summary
[Brief summary of the issue]

### Detailed Description
[Detailed description of the problem, including symptoms and impact]

### Affected Components
- [Component 1]
- [Component 2]
- [Component 3]

### Impact Assessment
- **User Impact**: [Describe impact on users]
- **System Impact**: [Describe impact on system]
- **Business Impact**: [Describe impact on business objectives]

---

## 2. Reproduction Steps

### Prerequisites
- [Prerequisite 1]
- [Prerequisite 2]
- [Prerequisite 3]

### Step-by-Step Reproduction
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]
5. [Step 5]

### Expected Behavior
[Describe what should happen]

### Actual Behavior
[Describe what actually happens]

### Reproduction Rate
- [ ] Always reproducible
- [ ] Intermittent (X% of the time)
- [ ] Rarely reproducible

### Environment
- **OS**: [Operating System]
- **Python Version**: [Version]
- **Node Version**: [Version]
- **Database Version**: [Version]
- **Browser**: [Browser and Version] (if applicable)

---

## 3. Technical Analysis

### Root Cause Analysis

#### Primary Root Cause
[Identify and describe the primary root cause]

#### Contributing Factors
1. [Contributing factor 1]
2. [Contributing factor 2]
3. [Contributing factor 3]

### Technical Deep Dive

#### Code Analysis
[Analyze the relevant code, identify problematic areas]

```python
# Example: Problematic code snippet
def problematic_function():
    # Issue description
    pass
```

#### Data Flow Analysis
[Describe how data flows through the system and where the issue occurs]

#### Dependency Analysis
[Analyze dependencies that may be contributing to the issue]

#### Performance Analysis (if applicable)
- [Metric 1]: [Value]
- [Metric 2]: [Value]
- [Metric 3]: [Value]

### Logs and Error Messages

#### Error Logs
```
[Paste relevant error logs]
```

#### Stack Trace
```
[Paste stack trace]
```

#### Debug Information
[Any additional debug information]

---

## 4. Implemented Solution

### Solution Overview
[High-level description of the solution approach]

### Solution Architecture

#### Architecture Diagram
[Insert architecture diagram or ASCII art]

#### Design Decisions
1. [Design decision 1 with rationale]
2. [Design decision 2 with rationale]
3. [Design decision 3 with rationale]

### Implementation Details

#### Code Changes

##### File: [path/to/file1.py]
```python
# Describe changes
# Before:
# def old_function():
#     pass

# After:
def new_function():
    pass
```

##### File: [path/to/file2.py]
```python
# Describe changes
```

##### File: [path/to/file3.py]
```python
# Describe changes
```

#### Database Changes (if applicable)
```sql
-- Describe schema changes
ALTER TABLE table_name ADD COLUMN new_column TYPE;
```

#### Configuration Changes (if applicable)
```yaml
# Describe configuration changes
key: value
```

### Testing

#### Test Cases
- [ ] [Test case 1] - [Result]
- [ ] [Test case 2] - [Result]
- [ ] [Test case 3] - [Result]
- [ ] [Test case 4] - [Result]
- [ ] [Test case 5] - [Result]

#### Test Results
```
[Paste test results]
```

#### Performance Impact (if applicable)
- [Metric 1 Before]: [Value] → [Metric 1 After]: [Value] ([+/- X%])
- [Metric 2 Before]: [Value] → [Metric 2 After]: [Value] ([+/- X%])
- [Metric 3 Before]: [Value] → [Metric 3 After]: [Value] ([+/- X%])

---

## 5. Alternative Approaches Considered

### Approach 1: [Approach Name]

#### Description
[Describe the alternative approach]

#### Pros
- [Pro 1]
- [Pro 2]

#### Cons
- [Con 1]
- [Con 2]

#### Why Not Chosen
[Explain why this approach was not selected]

### Approach 2: [Approach Name]

#### Description
[Describe the alternative approach]

#### Pros
- [Pro 1]
- [Pro 2]

#### Cons
- [Con 1]
- [Con 2]

#### Why Not Chosen
[Explain why this approach was not selected]

### Approach 3: [Approach Name]

#### Description
[Describe the alternative approach]

#### Pros
- [Pro 1]
- [Pro 2]

#### Cons
- [Con 1]
- [Con 2]

#### Why Not Chosen
[Explain why this approach was not selected]

---

## 6. Prevention Measures

### Immediate Prevention

#### Code Changes
- [ ] [Prevention measure 1]
- [ ] [Prevention measure 2]
- [ ] [Prevention measure 3]

#### Process Changes
- [ ] [Prevention measure 1]
- [ ] [Prevention measure 2]
- [ ] [Prevention measure 3]

### Long-term Prevention

#### Architecture Improvements
1. [Improvement 1]
2. [Improvement 2]
3. [Improvement 3]

#### Monitoring and Alerting
- [ ] [Monitoring measure 1]
- [ ] [Monitoring measure 2]
- [ ] [Monitoring measure 3]

#### Testing Improvements
- [ ] [Test improvement 1]
- [ ] [Test improvement 2]
- [ ] [Test improvement 3]

#### Documentation Updates
- [ ] [Documentation update 1]
- [ ] [Documentation update 2]
- [ ] [Documentation update 3]

### Lessons Learned

#### What Went Well
- [Positive outcome 1]
- [Positive outcome 2]

#### What Could Be Improved
- [Improvement area 1]
- [Improvement area 2]

#### Recommendations for Future
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

---

## 7. Rollback Plan

### Rollback Strategy
[Describe how to rollback the changes if needed]

### Rollback Steps
1. [Rollback step 1]
2. [Rollback step 2]
3. [Rollback step 3]

### Rollback Verification
- [ ] [Verification step 1]
- [ ] [Verification step 2]
- [ ] [Verification step 3]

---

## 8. References

### Related Issues
- [ISSUE_XXX] - [Issue Title]
- [ISSUE_XXX] - [Issue Title]

### Related Tasks
- [TASK_XXX] - [Task Title]
- [TASK_XXX] - [Task Title]

### Code References
- [File path](file:///absolute/path/to/file) - [Description]
- [File path](file:///absolute/path/to/file) - [Description]

### External Resources
- [Resource 1](URL)
- [Resource 2](URL)

### Documentation
- [Documentation link 1]
- [Documentation link 2]

---

## 9. Timeline

### Issue Discovery
- **Date**: YYYY-MM-DD
- **Discovered By**: [Name]

### Investigation
- **Start Date**: YYYY-MM-DD
- **End Date**: YYYY-MM-DD
- **Duration**: [X days/hours]

### Solution Development
- **Start Date**: YYYY-MM-DD
- **End Date**: YYYY-MM-DD
- **Duration**: [X days/hours]

### Testing and Validation
- **Start Date**: YYYY-MM-DD
- **End Date**: YYYY-MM-DD
- **Duration**: [X days/hours]

### Deployment
- **Date**: YYYY-MM-DD
- **Deployed By**: [Name]

---

## 10. Review and Approval

### Reviewers
- [ ] [Reviewer 1] - [Date] - [Approved/Rejected]
- [ ] [Reviewer 2] - [Date] - [Approved/Rejected]
- [ ] [Reviewer 3] - [Date] - [Approved/Rejected]

### Approval Status
- [ ] Technical Review: [Approved/Rejected]
- [ ] Security Review: [Approved/Rejected] (if applicable)
- [ ] Performance Review: [Approved/Rejected] (if applicable)
- [ ] Final Approval: [Approved/Rejected]

---

## 11. Appendices

### Appendix A: Additional Logs
[Any additional logs or debugging information]

### Appendix B: Performance Metrics
[Detailed performance metrics and benchmarks]

### Appendix C: Test Results
[Detailed test results and coverage reports]

### Appendix D: Communication Records
[Records of team discussions and decisions]

---

**Last Updated**: YYYY-MM-DD  
**Document Version**: 1.0