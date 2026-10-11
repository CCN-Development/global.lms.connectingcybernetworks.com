import type { LeaderboardEntry, LeaderboardResult, LeaderboardScope } from "@/contexts/CourseContext";

export type { LeaderboardEntry, LeaderboardScope };

export const LEADERBOARD_SCOPES: { key: LeaderboardScope; label: string }[] = [
    { key: "batch", label: "My Batch" },
    { key: "global", label: "Global" },
];

export const AVATAR_PLACEHOLDER = "/my-courses/leaderboard/avatar-placeholder.png";

export function displayName(entry: LeaderboardEntry, currentLearnerId: string): string {
    return entry.learnerId === currentLearnerId ? `${entry.name} (You)` : entry.name;
}

/** Splits a board into the podium (top 3), the scrolling rows and the learner's own pinned row. */
export function splitLeaderboard(board: LeaderboardResult) {
    const sorted = [...board.entries].sort((a, b) => a.rank - b.rank);
    const podium = sorted.slice(0, 3);
    const onPodium = podium.some((e) => e.learnerId === board.currentLearnerId);
    // The learner's own row comes back as `me` even when they are outside the returned top entries.
    const pinned = onPodium ? null : (sorted.find((e) => e.learnerId === board.currentLearnerId) ?? board.me ?? null);
    const rows = sorted.slice(3).filter((e) => e.learnerId !== pinned?.learnerId);
    return { podium, rows, pinned };
}
