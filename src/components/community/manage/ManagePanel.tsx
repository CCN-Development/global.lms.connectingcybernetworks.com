"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { CC, MANAGE_MENU, ManageView } from "../community-data";
import { darkScroll, EmptyCard, PanelHeader } from "../community-ui";
import { useCommunity } from "../CommunityContext";
import { CommunityStatus, ManageViewMenu } from "../CommunityFeed";
import AnalyticsPanel from "./AnalyticsPanel";
import MembersPanel from "./MembersPanel";
import ModerationLogPanel from "./ModerationLogPanel";
import QueuePanel from "./QueuePanel";
import ReportsPanel from "./ReportsPanel";
import SpacesPanel from "./SpacesPanel";
import TaxonomyPanel from "./TaxonomyPanel";

interface PanelShellProps {
    view: ManageView;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    /** Filter chips / search row above the list. */
    toolbar?: React.ReactNode;
    children: React.ReactNode;
    /** Infinite scroll: called near the bottom of the list. */
    onEndReached?: () => void;
    loadingMore?: boolean;
}

/** Shared frame of every management view: section switcher (mobile), header, toolbar, scrolling body. */
export function PanelShell({ view, title, subtitle, actions, toolbar, children, onEndReached, loadingMore }: PanelShellProps) {
    const onScroll = onEndReached
        ? (e: React.UIEvent<HTMLDivElement>) => {
              const el = e.currentTarget;
              if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) onEndReached();
          }
        : undefined;
    return (
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "20px", minHeight: 0 }}>
            <ManageViewMenu active={view} />
            <PanelHeader title={title} subtitle={subtitle} actions={actions} />
            {toolbar && <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>{toolbar}</Box>}
            <Box onScroll={onScroll} sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", pr: "4px", pb: "8px", ...darkScroll }}>
                {children}
                {loadingMore && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: "8px", flexShrink: 0 }}>
                        <CircularProgress size={24} sx={{ color: CC.primary200 }} />
                    </Box>
                )}
            </Box>
        </Box>
    );
}

/** Centered spinner for a panel's first load. */
export function PanelLoading() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", py: "48px", flexShrink: 0 }}>
            <CircularProgress size={28} sx={{ color: CC.primary200 }} />
        </Box>
    );
}

const PANELS: Record<ManageView, React.ComponentType> = {
    queue: QueuePanel,
    reports: ReportsPanel,
    members: MembersPanel,
    spaces: SpacesPanel,
    taxonomy: TaxonomyPanel,
    analytics: AnalyticsPanel,
    log: ModerationLogPanel,
};

export default function ManagePanel({ view }: { view: ManageView }) {
    const { ready, bootError, retryBootstrap, can } = useCommunity();
    const item = MANAGE_MENU.find((m) => m.id === view);

    if (!ready || bootError) {
        return (
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
                <CommunityStatus error={bootError} onRetry={retryBootstrap} />
            </Box>
        );
    }
    if (item?.capability && !can(item.capability)) {
        return (
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
                <ManageViewMenu active={view} />
                <EmptyCard title="Not available for your role" message={`${item.label} is managed by admins. Ask an admin if you need access.`} />
            </Box>
        );
    }
    const Panel = PANELS[view];
    return <Panel key={view} />;
}
