"use client";

import React, { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdContentCopy,
    MdDeleteOutline,
    MdEdit,
    MdMoreVert,
    MdOpenInNew,
    MdOutlineArchive,
    MdOutlineLayers,
    MdPublish,
    MdUnpublished,
} from "react-icons/md";
import { useExam, type AdminExamTree, type AdminExamTreeRound, type ExamRoundInput, type ExamSetRecord } from "@/contexts/ExamContext";
import { EmptyState, GlassCard, MoveButtons, moveId, notify, useConfirm } from "@/components/course-admin/ui";
import {
    DELIVERY_LABELS,
    EVALUATION_LABELS,
    ExamChip,
    REVEAL_LABELS,
    ROUND_META,
    RoundIcon,
    formatCooldown,
    formatDateTime,
    formatMarks,
    formatMinutes,
} from "./exam-ui";
import RoundDialog from "./RoundDialog";
import SetEditorDrawer, { SetMetaDialog } from "./SetEditorDrawer";

const roundHasAttempts = (round: AdminExamTreeRound) => round.sets.some((s) => s.servedCount > 0);

export default function RoundsTab({ exam }: { exam: AdminExamTree }) {
    const { createRound, updateRound, deleteRound, reorderRounds, createSet, unpublishSet, retireSet, cloneSet, deleteSet, updateSet, getAdminSet, saving } = useExam();
    const { confirm, dialog } = useConfirm();
    const [roundDialog, setRoundDialog] = useState<{ round: AdminExamTreeRound | null } | null>(null);
    const [openSet, setOpenSet] = useState<{ setId: string; roundId: string } | null>(null);
    const [setMenu, setSetMenu] = useState<{ anchor: HTMLElement; set: ExamSetRecord; round: AdminExamTreeRound } | null>(null);
    const [renaming, setRenaming] = useState<ExamSetRecord | null>(null);

    const rounds = exam.rounds;
    const openRound = openSet ? (rounds.find((r) => r.roundId === openSet.roundId) ?? null) : null;

    const moveRound = async (index: number, dir: -1 | 1) => notify(await reorderRounds(exam.examId, moveId(rounds.map((r) => r.roundId), index, dir)), "Round order updated");

    const removeRound = async (round: AdminExamTreeRound) => {
        const ok = await confirm({
            title: `Delete "${round.title}"?`,
            description: `Its ${round.sets.length} set${round.sets.length === 1 ? "" : "s"} and all questions are removed permanently.`,
            confirmLabel: "Delete round",
            danger: true,
        });
        if (ok) notify(await deleteRound(round.roundId));
    };

    const newSet = async (round: AdminExamTreeRound) => {
        const res = await createSet(round.roundId);
        if (notify(res) && res.data) setOpenSet({ setId: res.data.setId, roundId: round.roundId });
    };

    const setAction = async (action: "open" | "rename" | "publish" | "unpublish" | "retire" | "clone" | "delete") => {
        if (!setMenu) return;
        const { set, round } = setMenu;
        setSetMenu(null);
        switch (action) {
            case "open":
                return setOpenSet({ setId: set.setId, roundId: round.roundId });
            case "rename":
                return setRenaming(set);
            case "publish": {
                // Publishing needs the questions — open the editor, which validates them first.
                setOpenSet({ setId: set.setId, roundId: round.roundId });
                return;
            }
            case "unpublish":
                return notify(await unpublishSet(set.setId));
            case "retire": {
                const others = round.sets.filter((s) => s.setStatus === "published" && s.setId !== set.setId).length;
                const ok = await confirm({
                    title: `Retire ${set.code}?`,
                    description: `It won't be served again${others ? "" : " — and it's the last published set of this round, so nobody could start or retake it until you publish another"}. Attempts in progress can finish.`,
                    confirmLabel: "Retire",
                    danger: !others,
                });
                if (ok) notify(await retireSet(set.setId));
                return;
            }
            case "clone": {
                const res = await cloneSet(set.setId);
                if (notify(res) && res.data) setOpenSet({ setId: res.data.setId, roundId: round.roundId });
                return;
            }
            case "delete": {
                const ok = await confirm({ title: `Delete ${set.code}?`, description: "The set and its questions are removed permanently.", confirmLabel: "Delete", danger: true });
                if (ok) notify(await deleteSet(set.setId));
                return;
            }
        }
    };

    return (
        <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">Rounds</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {exam.roundProgression === "sequential" ? "Students clear them top to bottom." : "Students may take them in any order."} Each round needs published sets; students get a random set they&apos;ve
                        never seen.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<MdAdd />} onClick={() => setRoundDialog({ round: null })}>
                    Add round
                </Button>
            </Stack>

            {!rounds.length ? (
                <EmptyState
                    icon={<MdOutlineLayers />}
                    title="No rounds yet"
                    description="Add a Technical Viva, MCQ exam, Practical Lab or HR round."
                    action={
                        <Button variant="contained" startIcon={<MdAdd />} onClick={() => setRoundDialog({ round: null })}>
                            Add round
                        </Button>
                    }
                />
            ) : (
                rounds.map((round, index) => {
                    const meta = ROUND_META[round.roundType];
                    const locked = roundHasAttempts(round);
                    const published = round.sets.filter((s) => s.setStatus === "published").length;
                    return (
                        <GlassCard key={round.roundId} sx={{ p: { xs: 2, md: 2.5 }, borderColor: `${meta.color}33` }}>
                            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ alignItems: { md: "flex-start" } }}>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                                    <RoundIcon type={round.roundType} size={22} />
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }} useFlexGap>
                                            <Typography variant="caption" color="text.secondary">
                                                Round {index + 1}
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>
                                                {round.title}
                                            </Typography>
                                            <Chip size="small" label={meta.short} sx={{ height: 20, color: meta.color, borderColor: `${meta.color}66` }} variant="outlined" />
                                            {round.isMandatory ? <ExamChip status="passed" label="Required" /> : <ExamChip status="locked" label="Optional" />}
                                            {!round.selfStart && <ExamChip status="under_review" label="Evaluator starts it" />}
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {formatMinutes(round.durationSec)} · {round.maxAttempts ?? "Unlimited"} attempt{round.maxAttempts === 1 ? "" : "s"} · {formatCooldown(round.retakeCooldownMin)} cooldown · pass{" "}
                                            {round.passingPct}% · {formatMarks(round.defaultMarks)} mark{round.defaultMarks === 1 ? "" : "s"}/question
                                            {round.roundType === "mcq" && round.defaultNegativeMarks ? ` (−${formatMarks(round.defaultNegativeMarks)})` : ""} · {DELIVERY_LABELS[round.deliveryMode]}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" component="div">
                                            {EVALUATION_LABELS[round.evaluationMode].label} · {REVEAL_LABELS[round.revealMode].label}
                                            {round.proctoringMode !== "none" ? ` · proctoring ${round.proctoringMode}${round.maxViolations ? ` (auto-submit after ${round.maxViolations})` : ""}` : ""}
                                            {round.allowResume ? "" : " · no resume"}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                    <MoveButtons onUp={() => moveRound(index, -1)} onDown={() => moveRound(index, 1)} disableUp={index === 0 || saving} disableDown={index === rounds.length - 1 || saving} />
                                    <Tooltip title="Edit round rules">
                                        <IconButton onClick={() => setRoundDialog({ round })}>
                                            <MdEdit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={locked ? "Students attempted this round — it can't be deleted" : "Delete round"}>
                                        <span>
                                            <IconButton color="error" disabled={locked || saving} onClick={() => removeRound(round)}>
                                                <MdDeleteOutline />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Stack>
                            </Stack>

                            {round.isMandatory && !published && (
                                <Alert severity="error" sx={{ mt: 1.5 }}>
                                    Required round without a published set — the exam can&apos;t be published and students can&apos;t start it.
                                </Alert>
                            )}
                            {round.stats.studentsAwaitingNewSet > 0 && (
                                <Alert severity="warning" sx={{ mt: 1.5 }}>
                                    {round.stats.studentsAwaitingNewSet} student{round.stats.studentsAwaitingNewSet > 1 ? "s have" : " has"} seen every published set and can&apos;t retake — publish a new set.
                                </Alert>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
                                    {round.roundType === "lab" ? "Lab sets" : round.roundType === "mcq" ? "Question papers" : "Question sets"} ({round.sets.length})
                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                        {published} published · {round.stats.inProgress} in progress · {round.stats.pendingReview} to review
                                    </Typography>
                                </Typography>
                                <Button size="small" variant="outlined" startIcon={<MdAdd />} disabled={saving} onClick={() => newSet(round)}>
                                    New set
                                </Button>
                            </Stack>

                            {!round.sets.length ? (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                    No sets yet. Create several so retakes always get a fresh paper.
                                </Typography>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Set</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell align="right">{round.roundType === "lab" ? "Tasks" : "Questions"}</TableCell>
                                                <TableCell align="right">Marks</TableCell>
                                                <TableCell align="right">Served</TableCell>
                                                <TableCell>Published</TableCell>
                                                <TableCell align="right" />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {round.sets.map((set) => (
                                                <TableRow key={set.setId} hover sx={{ cursor: "pointer" }} onClick={() => setOpenSet({ setId: set.setId, roundId: round.roundId })}>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                            {set.code}
                                                        </Typography>
                                                        {set.title && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {set.title}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <ExamChip status={set.setStatus} />
                                                    </TableCell>
                                                    <TableCell align="right">{set.questionCount}</TableCell>
                                                    <TableCell align="right">{formatMarks(set.totalMarks)}</TableCell>
                                                    <TableCell align="right">{set.servedCount}</TableCell>
                                                    <TableCell>{formatDateTime(set.publishedAt)}</TableCell>
                                                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                        <IconButton size="small" aria-label="Set actions" onClick={(e) => setSetMenu({ anchor: e.currentTarget, set, round })}>
                                                            <MdMoreVert />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </GlassCard>
                    );
                })
            )}

            <Menu anchorEl={setMenu?.anchor} open={Boolean(setMenu)} onClose={() => setSetMenu(null)}>
                <MenuItem onClick={() => setAction("open")}>
                    <ListItemIcon>
                        <MdOpenInNew />
                    </ListItemIcon>
                    {setMenu?.set.setStatus === "draft" ? "Edit questions" : "View questions"}
                </MenuItem>
                <MenuItem onClick={() => setAction("rename")}>
                    <ListItemIcon>
                        <MdEdit />
                    </ListItemIcon>
                    Rename
                </MenuItem>
                {setMenu?.set.setStatus === "draft" && (
                    <MenuItem onClick={() => setAction("publish")}>
                        <ListItemIcon>
                            <MdPublish />
                        </ListItemIcon>
                        Review & publish
                    </MenuItem>
                )}
                {setMenu?.set.setStatus === "published" && (
                    <MenuItem disabled={setMenu.set.servedCount > 0} onClick={() => setAction("unpublish")}>
                        <ListItemIcon>
                            <MdUnpublished />
                        </ListItemIcon>
                        {setMenu.set.servedCount > 0 ? "Unpublish (already served)" : "Unpublish"}
                    </MenuItem>
                )}
                {setMenu?.set.setStatus === "published" && (
                    <MenuItem onClick={() => setAction("retire")}>
                        <ListItemIcon>
                            <MdOutlineArchive />
                        </ListItemIcon>
                        Retire
                    </MenuItem>
                )}
                <MenuItem onClick={() => setAction("clone")}>
                    <ListItemIcon>
                        <MdContentCopy />
                    </ListItemIcon>
                    Clone as new draft
                </MenuItem>
                <Divider />
                <MenuItem disabled={setMenu?.set.setStatus !== "draft" || (setMenu?.set.servedCount ?? 0) > 0} onClick={() => setAction("delete")} sx={{ color: "error.main" }}>
                    <ListItemIcon sx={{ color: "error.main" }}>
                        <MdDeleteOutline />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>

            {roundDialog && (
                <RoundDialog
                    key={roundDialog.round?.roundId ?? "new"}
                    open
                    round={roundDialog.round}
                    hasAttempts={roundDialog.round ? roundHasAttempts(roundDialog.round) : false}
                    onClose={() => setRoundDialog(null)}
                    onSubmit={async (input: ExamRoundInput) => {
                        if (!roundDialog.round) return notify(await createRound(exam.examId, input));
                        const { roundType, ...rest } = input;
                        return roundType === roundDialog.round.roundType ? notify(await updateRound(roundDialog.round.roundId, rest)) : false;
                    }}
                />
            )}
            {renaming && (
                <SetMetaDialog
                    open
                    title={`Rename ${renaming.code}`}
                    initial={{ code: renaming.code, title: renaming.title }}
                    onClose={() => setRenaming(null)}
                    onSubmit={async (input) => notify(await updateSet(renaming.setId, input))}
                />
            )}
            <SetEditorDrawer
                setId={openSet?.setId ?? null}
                round={openRound}
                onClose={() => setOpenSet(null)}
                onOpenSet={(setId) => {
                    if (openSet) setOpenSet({ setId, roundId: openSet.roundId });
                    getAdminSet(setId);
                }}
            />
            {dialog}
        </Stack>
    );
}
