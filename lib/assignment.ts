import User from '@/models/User'
import Issue from '@/models/Issue'

const PRIORITY_WEIGHTS: Record<string, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
}

const MAX_ACTIVE_ISSUES = 3 // Threshold for "busy" status

interface StaffEfficiency {
    userId: string
    name: string
    efficiency: number
    activeIssues: number
}

// Helper to get priority weight
function getWeight(priority: string): number {
    return PRIORITY_WEIGHTS[priority] || 1
}

/**
 * Calculates the efficiency of a staff member for a specific category.
 * Efficiency (%) = (Sum of priority-weighted resolved issues / Sum of priority-weighted assigned issues) * 100
 */
export async function calculateEfficiency(userId: string, category: string, tenantId: string): Promise<number> {
    // Fetch all issues assigned to this user in this category
    // We need to fetch fields: priority, status
    const issues = await Issue.find({
        assignedTo: userId,
        category: category,
        tenantId: tenantId
    }).select('priority status')

    if (!issues || issues.length === 0) {
        return 100 // Default to 100% efficiency if no history (innocent until proven guilty / fresh start)
        // Alternatively, could be 0, but that disadvantages new staff. 
        // Let's stick with a neutral high or 0? 
        // If they have 0 assigned, they are technically infinitely efficient or undefined. 
        // Let's give them a "New Joiner" boost -> 100
    }

    let totalAssignedWeight = 0
    let totalResolvedWeight = 0

    for (const issue of issues) {
        const weight = getWeight(issue.priority)
        totalAssignedWeight += weight

        if (['Resolved', 'Closed'].includes(issue.status)) {
            totalResolvedWeight += weight
        }
    }

    if (totalAssignedWeight === 0) return 100

    return (totalResolvedWeight / totalAssignedWeight) * 100
}

/**
 * Gets the number of active issues (Open, In Progress) for a user
 */
export async function getActiveIssueCount(userId: string, tenantId: string): Promise<number> {
    const count = await Issue.countDocuments({
        assignedTo: userId,
        status: { $in: ['Open', 'In Progress'] },
        tenantId: tenantId
    })
    return count
}

/**
 * Finds the best staff member to assign an issue to based on category.
 * 1. Filter staff by category.
 * 2. Rank by efficiency.
 * 3. Pick highest efficiency that is not busy.
 * 4. Fallback: least busy.
 */
export async function findBestStaffForIssue(category: string, tenantId: string, priority?: string): Promise<string | null> {
    // 1. Identify all technical staff belonging to that category and the same tenant
    // Note: 'team' role is assumed to be technical staff
    const staffMembers = await User.find({
        role: 'team',
        isActive: true,
        tenantId: tenantId,
        $or: [
            { department: category },
            { categories: category }
        ]
    }).select('_id name')

    if (!staffMembers || staffMembers.length === 0) {
        return null
    }

    // 2. Calculate efficiency and load for each
    const candidates: StaffEfficiency[] = []

    for (const staff of staffMembers) {
        const efficiency = await calculateEfficiency(staff._id.toString(), category, tenantId)
        const activeIssues = await getActiveIssueCount(staff._id.toString(), tenantId)

        candidates.push({
            userId: staff._id.toString(),
            name: staff.name,
            efficiency,
            activeIssues
        })
    }

    // 3. Rank by efficiency score (highest first)
    candidates.sort((a, b) => b.efficiency - a.efficiency)

    console.log(`Assignment Candidates for ${category}:`, candidates)

    // 4. Assign to most efficient available staff
    for (const candidate of candidates) {
        // Critical issues bypass the "busy" threshold entirely
        if (priority === 'Critical') {
            return candidate.userId
        }

        // High priority issues allow a slightly higher threshold
        const threshold = priority === 'High' ? MAX_ACTIVE_ISSUES + 1 : MAX_ACTIVE_ISSUES

        if (candidate.activeIssues < threshold) {
            return candidate.userId
        }
    }

    // 5. If all are busy, assign to the one with the LEAST active issues.
    // Sort by activeIssues ascending
    candidates.sort((a, b) => a.activeIssues - b.activeIssues)

    return candidates[0].userId
}
