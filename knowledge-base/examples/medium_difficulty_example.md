# Medium Difficulty Example: Slow Assessment Scoring

**Issue ID**: ISSUE_EXAMPLE_MED_001  
**Title**: Assessment scoring algorithm causes timeout for large datasets  
**Related Task**: TASK_EXAMPLE_MED_001  
**Severity**: High  
**Status**: Resolved  
**Created**: 2026-02-06  
**Updated**: 2026-02-06  
**Reported By**: Jane Smith  
**Assigned To**: Jane Smith

---

## 1. Problem Description

### Summary
Assessment scoring algorithm takes >30 seconds for datasets with 1000+ responses, causing API timeouts.

### Detailed Description
When users submit large assessment datasets (1000+ responses), the scoring algorithm in `assessment_service.py` processes responses sequentially, leading to excessive processing time. The API timeout is set to 30 seconds, causing requests to fail for large datasets.

### Affected Components
- Backend: Assessment service
- Backend: Scoring algorithm
- Database: Assessment queries

### Impact Assessment
- **User Impact**: Users with large datasets cannot complete assessments
- **System Impact**: API timeouts, increased server load
- **Business Impact**: High - blocks enterprise customers with large user bases

---

## 2. Reproduction Steps

### Prerequisites
- Assessment with 1000+ responses
- User with admin privileges

### Step-by-Step Reproduction
1. Create assessment with 1000+ responses
2. Submit assessment for scoring
3. Wait for response
4. Observe timeout error after 30 seconds

### Expected Behavior
Assessment should be scored within 5 seconds regardless of dataset size.

### Actual Behavior
API times out after 30 seconds with "Request timeout" error.

### Reproduction Rate
- [X] Always reproducible with 1000+ responses

### Environment
- **OS**: Ubuntu 22.04
- **Python Version**: 3.11
- **Database Version**: PostgreSQL 14

---

## 3. Technical Analysis

### Root Cause Analysis

#### Primary Root Cause
Sequential processing of assessment responses in scoring algorithm without optimization.

#### Contributing Factors
1. No database query optimization
2. No caching of repeated calculations
3. No parallel processing
4. Inefficient data structures (O(n²) complexity)

### Technical Deep Dive

#### Code Analysis

**Problematic code in assessment_service.py:**
```python
def score_assessment(assessment_id: int) -> dict:
    responses = db.get_responses(assessment_id)  # Returns list of 1000+ items
    
    scores = {}
    for response in responses:
        for question in assessment.questions:
            # Nested loop causes O(n*m) complexity
            score = calculate_score(response, question)
            scores[response.id] = score
    
    return scores
```

#### Data Flow Analysis
1. API receives scoring request
2. Database query fetches all responses (1-2 seconds)
3. Sequential scoring loop (25+ seconds for 1000 responses)
4. Timeout occurs before completion

#### Performance Analysis
- **Small dataset (10 responses)**: 0.5 seconds
- **Medium dataset (100 responses)**: 3 seconds
- **Large dataset (1000 responses)**: 30+ seconds (timeout)

### Logs and Error Messages

#### Error Logs
```
2026-02-06 10:15:23 ERROR [assessment_service] Request timeout for assessment_id=123
2026-02-06 10:15:23 ERROR [api] 504 Gateway Timeout
```

---

## 4. Implemented Solution

### Solution Overview
Implement parallel processing with batch operations and caching to reduce scoring time to <5 seconds for 1000+ responses.

### Solution Architecture

#### Architecture Diagram
```
┌─────────────┐
│   API       │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Assessment Service  │
│ - Batch Processing │
│ - Parallel Tasks    │
│ - Caching Layer    │
└──────┬─────────────┘
       │
       ▼
┌─────────────────────┐
│   Database         │
│ - Optimized Queries│
│ - Indexes         │
└───────────────────┘
```

#### Design Decisions
1. Use asyncio for parallel processing
2. Implement batch database operations
3. Add Redis caching for repeated calculations
4. Optimize database queries with indexes
5. Use efficient data structures (O(n) complexity)

### Implementation Details

#### Code Changes

##### File: backend/app/services/assessment_service.py
```python
import asyncio
from typing import List
from app.cache import cache_manager

async def score_assessment(assessment_id: int) -> dict:
    responses = await db.get_responses_async(assessment_id)
    
    # Check cache
    cache_key = f"assessment_score_{assessment_id}"
    cached_result = await cache_manager.get(cache_key)
    if cached_result:
        return cached_result
    
    # Process in batches
    batch_size = 100
    batches = [responses[i:i+batch_size] for i in range(0, len(responses), batch_size)]
    
    # Parallel processing
    tasks = [process_batch(batch) for batch in batches]
    results = await asyncio.gather(*tasks)
    
    # Merge results
    scores = {}
    for batch_result in results:
        scores.update(batch_result)
    
    # Cache result
    await cache_manager.set(cache_key, scores, ttl=3600)
    
    return scores

async def process_batch(responses: List[dict]) -> dict:
    scores = {}
    for response in responses:
        score = calculate_score_optimized(response)
        scores[response.id] = score
    return scores

def calculate_score_optimized(response: dict) -> int:
    # Optimized calculation with O(1) complexity
    question_scores = {
        q.id: q.weight for q in assessment.questions
    }
    return sum(question_scores.get(r.question_id, 0) for r in response.answers)
```

##### File: backend/app/database.py
```python
async def get_responses_async(assessment_id: int) -> List[dict]:
    query = """
        SELECT r.id, r.user_id, r.answers
        FROM responses r
        WHERE r.assessment_id = $1
        ORDER BY r.id
    """
    return await db.fetch_all(query, assessment_id)
```

##### Database Migration
```sql
-- Add index for faster queries
CREATE INDEX idx_responses_assessment_id ON responses(assessment_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
```

### Testing

#### Test Cases
- [X] Small dataset (10 responses) scores in <1 second
- [X] Medium dataset (100 responses) scores in <2 seconds
- [X] Large dataset (1000 responses) scores in <5 seconds
- [X] Very large dataset (10000 responses) scores in <30 seconds
- [X] Cache returns correct results
- [X] Parallel processing handles errors gracefully

#### Test Results
```
test_score_assessment_small_dataset PASSED (0.3s)
test_score_assessment_medium_dataset PASSED (1.2s)
test_score_assessment_large_dataset PASSED (4.1s)
test_score_assessment_cache_hit PASSED (0.05s)
test_score_assessment_parallel_error_handling PASSED (0.8s)
```

#### Performance Impact
- **Small dataset Before**: 0.5s → **After**: 0.3s (-40%)
- **Medium dataset Before**: 3s → **After**: 1.2s (-60%)
- **Large dataset Before**: 30s+ (timeout) → **After**: 4.1s (-86%)

---

## 5. Alternative Approaches Considered

### Approach 1: Database-Level Aggregation

#### Description
Move scoring logic to database using SQL aggregation functions.

#### Pros
- Leverages database optimization
- Reduces data transfer
- Single query execution

#### Cons
- Complex SQL queries
- Harder to maintain
- Less flexible for business logic changes

#### Why Not Chosen
Business logic is complex and would be difficult to express in SQL. Python implementation is more maintainable.

### Approach 2: Background Job Processing

#### Description
Use Celery to process scoring in background and return results via WebSocket.

#### Pros
- No API timeout issues
- Can handle very large datasets
- User can continue working

#### Cons
- Increased complexity
- Requires additional infrastructure
- Poor user experience (wait for notification)

#### Why Not Chosen
Optimization to <5 seconds makes background processing unnecessary. Simpler synchronous approach preferred.

### Approach 3: Pre-computed Scores

#### Description
Calculate scores incrementally as responses are submitted.

#### Pros
- Instant retrieval
- No computation at query time
- Best performance

#### Cons
- Requires data migration
- Complex to maintain consistency
- Cannot recalculate historical data easily

#### Why Not Chosen
Would require significant refactoring and data migration. Not justified for this use case.

---

## 6. Prevention Measures

### Immediate Prevention

#### Code Changes
- [X] Add performance benchmarks for all scoring functions
- [X] Implement timeout handling in API layer
- [X] Add monitoring for slow queries

#### Process Changes
- [X] Require performance testing for all new features
- [X] Set up alerts for API timeouts
- [X] Document performance requirements

### Long-term Prevention

#### Architecture Improvements
1. Implement query optimization review process
2. Add performance regression tests to CI/CD
3. Establish performance budget for API endpoints

#### Monitoring and Alerting
- [X] Add APM monitoring (Application Performance Monitoring)
- [X] Set up alerts for response time >5 seconds
- [X] Monitor database query performance

#### Testing Improvements
- [X] Add load testing for all endpoints
- [X] Include performance tests in test suite
- [X] Test with production-like data volumes

#### Documentation Updates
- [X] Document performance requirements in API specs
- [X] Add performance guidelines to coding standards
- [X] Create troubleshooting guide for performance issues

### Lessons Learned

#### What Went Well
- Parallel processing significantly improved performance
- Caching layer reduced repeated calculations
- Batch operations reduced database load

#### What Could Be Improved
- Should have identified performance issue earlier
- Need better performance monitoring
- Should have load tested before deployment

#### Recommendations for Future
1. Always test with production-like data volumes
2. Implement performance monitoring from the start
3. Consider scalability in initial design

---

## 7. Rollback Plan

### Rollback Strategy
Revert to previous version of assessment_service.py and remove database indexes.

### Rollback Steps
1. Git revert commit
2. Remove database indexes
3. Clear Redis cache
4. Redeploy previous version
5. Verify basic functionality

### Rollback Verification
- [X] Small datasets work correctly
- [X] API responds without errors
- [X] Database queries execute successfully

---

## 8. References

### Related Issues
- ISSUE_EXAMPLE_MED_002 - Related performance issue in chat service

### Related Tasks
- TASK_EXAMPLE_MED_001 - Optimize assessment scoring
- TASK_EXAMPLE_MED_002 - Add performance monitoring

### Code References
- [assessment_service.py](../../backend/app/services/assessment_service.py)
- [database.py](../../backend/app/database.py)

### External Resources
- [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html)
- [PostgreSQL performance tuning](https://www.postgresql.org/docs/current/performance-tips.html)

---

## 9. Timeline

### Issue Discovery
- **Date**: 2026-02-06
- **Discovered By**: Jane Smith

### Investigation
- **Start Date**: 2026-02-06
- **End Date**: 2026-02-06
- **Duration**: 4 hours

### Solution Development
- **Start Date**: 2026-02-06
- **End Date**: 2026-02-06
- **Duration**: 8 hours

### Testing and Validation
- **Start Date**: 2026-02-06
- **End Date**: 2026-02-06
- **Duration**: 4 hours

### Deployment
- **Date**: 2026-02-06
- **Deployed By**: Jane Smith

---

## 10. Review and Approval

### Reviewers
- [X] Jane Smith - 2026-02-06 - Approved
- [X] John Doe - 2026-02-06 - Approved

### Approval Status
- [X] Technical Review: Approved
- [X] Performance Review: Approved

---

**Last Updated**: 2026-02-06  
**Document Version**: 1.0