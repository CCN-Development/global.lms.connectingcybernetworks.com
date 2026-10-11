"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { MdContentCopy, MdOutlineWorkspacePremium, MdSearch } from "react-icons/md";
import { useExam, type AdminExamTree, type CertificateStatus, type ExamCertificateRecord } from "@/contexts/ExamContext";
import { EmptyState, GlassCard, LoadingState, notify } from "@/components/course-admin/ui";
import { ExamChip, formatDateTime, formatPct, useReasonPrompt } from "./exam-ui";

export default function CertificatesTab({ exam }: { exam: AdminExamTree }) {
    const { examCertificates, loadingCertificates, getExamCertificates, revokeCertificate, reinstateCertificate, saving } = useExam();
    const { ask, dialog } = useReasonPrompt();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"" | CertificateStatus>("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        const timer = setTimeout(() => {
            getExamCertificates({ examId: exam.examId, status: status || undefined, search: search.trim() || undefined, page: page + 1, pageSize });
        }, 250);
        return () => clearTimeout(timer);
    }, [exam.examId, status, search, page, pageSize, getExamCertificates]);

    const rows = examCertificates?.items.filter((c) => c.examId === exam.examId) ?? [];

    const toggle = async (cert: ExamCertificateRecord) => {
        const revoke = cert.certificateStatus === "issued";
        const reason = await ask({
            title: revoke ? `Revoke ${cert.certificateNo}?` : `Reinstate ${cert.certificateNo}?`,
            description: revoke
                ? `${cert.candidateName}'s certificate will verify as revoked. Their exam results are unchanged.`
                : `${cert.candidateName}'s certificate will verify as valid again.`,
            confirmLabel: revoke ? "Revoke" : "Reinstate",
            danger: revoke,
        });
        if (reason) notify(revoke ? await revokeCertificate(cert.certificateId, reason) : await reinstateCertificate(cert.certificateId, reason));
    };

    const copyId = async (certificateNo: string) => {
        try {
            await navigator.clipboard.writeText(certificateNo);
            toast.success("Certificate ID copied");
        } catch {
            toast.error("Couldn't copy");
        }
    };

    return (
        <Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search certificate ID or name"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                    sx={{ flex: 1, maxWidth: { sm: 380 } }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><MdSearch /></InputAdornment> } }}
                />
                <TextField
                    select
                    size="small"
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value as "" | CertificateStatus);
                        setPage(0);
                    }}
                    sx={{ minWidth: 180 }}
                    slotProps={{ select: { displayEmpty: true } }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="issued">Issued</MenuItem>
                    <MenuItem value="revoked">Revoked</MenuItem>
                </TextField>
            </Stack>

            {loadingCertificates && !examCertificates ? (
                <LoadingState label="Loading certificates…" />
            ) : !rows.length ? (
                <EmptyState
                    icon={<MdOutlineWorkspacePremium />}
                    title="No certificates"
                    description="Certificates are issued automatically the moment a student clears every required round."
                />
            ) : (
                <GlassCard>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Certificate ID</TableCell>
                                    <TableCell>Candidate</TableCell>
                                    <TableCell>Round scores</TableCell>
                                    <TableCell>Issued</TableCell>
                                    <TableCell>Valid until</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right" />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((cert) => (
                                    <TableRow key={cert.certificateId} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>
                                                    {cert.certificateNo}
                                                </Typography>
                                                <Tooltip title="Copy ID">
                                                    <IconButton size="small" onClick={() => copyId(cert.certificateNo)}>
                                                        <MdContentCopy size={14} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{cert.candidateName}</TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {(cert.roundScores ?? []).map((r) => `${r.title} ${formatPct(r.scorePct)}`).join(" · ") || "—"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{formatDateTime(cert.issuedAt)}</TableCell>
                                        <TableCell>{cert.validUntil ? formatDateTime(cert.validUntil) : "Lifetime"}</TableCell>
                                        <TableCell>
                                            <Tooltip title={cert.revokedReason ?? ""}>
                                                <span>
                                                    <ExamChip status={cert.certificateStatus} />
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button size="small" color={cert.certificateStatus === "issued" ? "error" : "primary"} disabled={saving} onClick={() => toggle(cert)}>
                                                {cert.certificateStatus === "issued" ? "Revoke" : "Reinstate"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={examCertificates?.total ?? 0}
                        page={page}
                        rowsPerPage={pageSize}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        onPageChange={(_, p) => setPage(p)}
                        onRowsPerPageChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                        }}
                    />
                </GlassCard>
            )}
            {dialog}
        </Box>
    );
}
