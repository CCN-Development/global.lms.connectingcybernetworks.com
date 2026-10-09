// Mock data source — swap for the leaderboard API once it exists.

export type LeaderboardScope = "batch" | "global";

export interface LeaderboardEntry {
    learnerId: string;
    rank: number;
    name: string;
    batchName: string;
    /** Profile photo URL; falls back to the placeholder portrait when null. */
    avatar: string | null;
    level: number;
    /** XP shown on the podium. */
    xp: number;
    /** "Points Earned" column. */
    points: number;
    badges: number;
}

export interface Leaderboard {
    scope: LeaderboardScope;
    /** Marks this learner as "(You)" and pins their row when they are off the podium. */
    currentLearnerId: string;
    /** Sorted by rank; the first three entries form the podium. */
    entries: LeaderboardEntry[];
}

export const LEADERBOARD_SCOPES: { key: LeaderboardScope; label: string }[] = [
    { key: "batch", label: "My Batch" },
    { key: "global", label: "Global" },
];

export const AVATAR_PLACEHOLDER = "/my-courses/leaderboard/avatar-placeholder.png";

const BATCH = "CCNA Batch 2023 -2024";
const CURRENT_LEARNER_ID = "stu-aanchal";

const entry = (
    learnerId: string,
    rank: number,
    name: string,
    level: number,
    points: number,
    badges: number,
    xp = 0,
): LeaderboardEntry => ({ learnerId, rank, name, batchName: BATCH, avatar: null, level, xp, points, badges });

export const LEADERBOARDS: Record<LeaderboardScope, Leaderboard> = {
    batch: {
        scope: "batch",
        currentLearnerId: CURRENT_LEARNER_ID,
        entries: [
            entry(CURRENT_LEARNER_ID, 1, "Aanchal Gupta", 24, 100, 12, 1080),
            entry("stu-harisha-1", 2, "Harisha Sharma", 24, 100, 10, 532),
            entry("stu-harisha-2", 3, "Harisha Sharma", 24, 100, 9, 450),
            entry("stu-rachel", 4, "Rachel Green", 24, 100, 12),
            entry("stu-aarav", 5, "Aarav Mehta", 12, 100, 3),
            entry("stu-riya", 6, "Riya Sharma", 8, 100, 3),
            entry("stu-karan", 6, "Karan Patel", 5, 100, 2),
            entry("stu-ananya", 6, "Ananya Singh", 4, 100, 0),
        ],
    },
    global: {
        scope: "global",
        currentLearnerId: CURRENT_LEARNER_ID,
        entries: [
            entry("stu-rachel", 1, "Rachel Green", 24, 100, 12, 1080),
            entry("stu-harisha-1", 2, "Harisha Sharma", 24, 100, 10, 532),
            entry("stu-harisha-2", 3, "Harisha Sharma", 24, 100, 9, 450),
            entry("stu-aarav", 4, "Aarav Mehta", 12, 100, 3),
            entry("stu-aarav-2", 5, "Aarav Mehta", 12, 100, 3),
            entry("stu-riya", 6, "Riya Sharma", 8, 100, 3),
            entry("stu-karan", 7, "Karan Patel", 5, 100, 2),
            entry("stu-karan-2", 8, "Karan Patel", 5, 100, 2),
            entry(CURRENT_LEARNER_ID, 18, "Aanchal Gupta", 24, 100, 12, 320),
        ],
    },
};

export function displayName(entry: LeaderboardEntry, currentLearnerId: string): string {
    return entry.learnerId === currentLearnerId ? `${entry.name} (You)` : entry.name;
}

/** Splits a board into the podium (top 3), the scrolling rows and the learner's own pinned row. */
export function splitLeaderboard(board: Leaderboard) {
    const sorted = [...board.entries].sort((a, b) => a.rank - b.rank);
    const podium = sorted.slice(0, 3);
    const onPodium = podium.some((e) => e.learnerId === board.currentLearnerId);
    const pinned = onPodium ? null : (sorted.find((e) => e.learnerId === board.currentLearnerId) ?? null);
    const rows = sorted.slice(3).filter((e) => e !== pinned);
    return { podium, rows, pinned };
}
