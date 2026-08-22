"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Static build info — update these before deploy */
const APP_VERSION = "v1.0.0";
const LAST_UPDATED = "2026-08-22";

const MONO =
    "ui-monospace, 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace";

const CCN_BANNER = ` ██████╗ ██████╗███╗   ██╗   ██╗     ███╗   ███╗███████╗
██╔════╝██╔════╝████╗  ██║   ██║     ████╗ ████║██╔════╝
██║     ██║     ██╔██╗ ██║   ██║     ██╔████╔██║███████╗
██║     ██║     ██║╚██╗██║   ██║     ██║╚██╔╝██║╚════██║
╚██████╗╚██████╗██║ ╚████║   ███████╗██║ ╚═╝ ██║███████║
 ╚═════╝ ╚═════╝╚═╝  ╚═══╝   ╚══════╝╚═╝     ╚═╝╚══════╝`;

/* ------------------------------------------------------------------ */
/* Solid color palette (no opacity based colors)                       */
/* ------------------------------------------------------------------ */
const C = {
    bg: "#000000",
    bgAlt: "#080b16",
    panel: "#0b1220",
    panelAlt: "#0e1934",
    border: "#1b2740",
    borderStrong: "#2c3d63",
    blue: "#2563eb",
    blueDeep: "#00098b",
    purple: "#7c3aed",
    purpleBright: "#8c24ff",
    green: "#16a34a",
    greenBright: "#22c55e",
    amber: "#d97706",
    red: "#dc2626",
    text: "#e8eef8",
    textSoft: "#aab6cf",
    textDim: "#6d7c9c",
    white: "#ffffff",
    black: "#000000",
    cyan: "#38bdf8",
    termBg: "#0a0e17",
} as const;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type PermState = "granted" | "prompt" | "denied" | "unsupported";
type Phase = "booting" | "permissions" | "preview" | "ready";
type StepStatus = "pending" | "active" | "done";

interface SystemInfo {
    deviceType: string;
    os: string;
    osVersion: string;
    browser: string;
    browserVersion: string;
    isMobile: boolean;
    cpuCores: number | null;
    memoryGb: number | null;
    language: string;
    timezone: string;
    screen: string;
    pixelRatio: number;
    touchPoints: number;
    vendor: string;
}

interface NetworkInfo {
    online: boolean;
    effectiveType: string;
    downlinkMbps: number | null;
    rttMs: number | null;
}

interface Coords {
    latitude: number;
    longitude: number;
    accuracy: number;
}

interface CyberSecurityContextValue {
    ipAddress: string | null;
    city: string | null;
    country: string | null;
    org: string | null;
    system: SystemInfo | null;
    network: NetworkInfo | null;
    coords: Coords | null;
    notificationsGranted: boolean;
    locationGranted: boolean;
}

const CyberSecurityContext = createContext<CyberSecurityContextValue>({
    ipAddress: null,
    city: null,
    country: null,
    org: null,
    system: null,
    network: null,
    coords: null,
    notificationsGranted: false,
    locationGranted: false,
});

export function useCyberSecurity() {
    return useContext(CyberSecurityContext);
}

/* ------------------------------------------------------------------ */
/* Detection helpers                                                   */
/* ------------------------------------------------------------------ */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function match(re: RegExp, ua: string): string {
    const m = ua.match(re);
    return m && m[1] ? m[1] : "";
}

function detectSystem(): SystemInfo {
    const nav = navigator as unknown as {
        userAgent: string;
        language: string;
        hardwareConcurrency?: number;
        deviceMemory?: number;
        maxTouchPoints?: number;
        vendor?: string;
        userAgentData?: { mobile?: boolean; platform?: string };
    };
    const ua = nav.userAgent || "";
    const uaData = nav.userAgentData;

    let os = "Unknown";
    let deviceType = "Web Browser";
    let osVersion = "";

    if (/android/i.test(ua)) {
        os = "Android";
        deviceType = "Android Device";
        osVersion = match(/android\s([\d.]+)/i, ua);
    } else if (/iphone|ipod/i.test(ua)) {
        os = "iOS";
        deviceType = "iPhone";
        osVersion = match(/os\s([\d_]+)/i, ua).replace(/_/g, ".");
    } else if (/ipad/i.test(ua)) {
        os = "iPadOS";
        deviceType = "iPad";
        osVersion = match(/os\s([\d_]+)/i, ua).replace(/_/g, ".");
    } else if (/windows nt/i.test(ua)) {
        os = "Windows";
        deviceType = "Windows PC";
        const winMap: Record<string, string> = {
            "10.0": "10 / 11",
            "6.3": "8.1",
            "6.2": "8",
            "6.1": "7",
        };
        osVersion = winMap[match(/windows nt\s([\d.]+)/i, ua)] || "";
    } else if (/mac os x/i.test(ua)) {
        os = "macOS";
        deviceType = "Mac";
        osVersion = match(/mac os x\s([\d_]+)/i, ua).replace(/_/g, ".");
    } else if (/linux/i.test(ua)) {
        os = "Linux";
        deviceType = "Linux PC";
    }

    // iPadOS 13+ masquerades as macOS
    if (os === "macOS" && (nav.maxTouchPoints ?? 0) > 1) {
        os = "iPadOS";
        deviceType = "iPad";
    }

    let browser = "Unknown";
    let browserVersion = "";
    if (/edg\//i.test(ua)) {
        browser = "Microsoft Edge";
        browserVersion = match(/edg\/([\d.]+)/i, ua);
    } else if (/opr\/|opera/i.test(ua)) {
        browser = "Opera";
        browserVersion = match(/(?:opr|opera)\/([\d.]+)/i, ua);
    } else if (/chrome|crios/i.test(ua)) {
        browser = "Google Chrome";
        browserVersion = match(/(?:chrome|crios)\/([\d.]+)/i, ua);
    } else if (/firefox|fxios/i.test(ua)) {
        browser = "Mozilla Firefox";
        browserVersion = match(/(?:firefox|fxios)\/([\d.]+)/i, ua);
    } else if (/safari/i.test(ua)) {
        browser = "Safari";
        browserVersion = match(/version\/([\d.]+)/i, ua);
    }

    const isMobile = uaData?.mobile ?? /mobi|android|iphone|ipad|ipod/i.test(ua);

    return {
        deviceType,
        os,
        osVersion,
        browser,
        browserVersion,
        isMobile,
        cpuCores: nav.hardwareConcurrency ?? null,
        memoryGb: nav.deviceMemory ?? null,
        language: nav.language || "unknown",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
        screen: `${window.screen.width} x ${window.screen.height}`,
        pixelRatio: window.devicePixelRatio || 1,
        touchPoints: nav.maxTouchPoints ?? 0,
        vendor: nav.vendor || "unknown",
    };
}

function detectNetwork(): NetworkInfo {
    const conn = (navigator as unknown as {
        connection?: { effectiveType?: string; downlink?: number; rtt?: number };
    }).connection;
    return {
        online: navigator.onLine,
        effectiveType: conn?.effectiveType?.toUpperCase() || "UNKNOWN",
        downlinkMbps: conn?.downlink ?? null,
        rttMs: conn?.rtt ?? null,
    };
}

interface IpInfo {
    ip: string;
    city?: string;
    country?: string;
    org?: string;
}

async function fetchIpInfo(): Promise<IpInfo> {
    try {
        const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
        if (res.ok) {
            const d = await res.json();
            if (d && d.ip) {
                return {
                    ip: d.ip,
                    city: d.city,
                    country: d.country_name,
                    org: d.org,
                };
            }
        }
    } catch {
        /* fall through */
    }
    try {
        const res = await fetch("https://api.ipify.org?format=json", {
            cache: "no-store",
        });
        if (res.ok) {
            const d = await res.json();
            if (d && d.ip) return { ip: d.ip };
        }
    } catch {
        /* ignore */
    }
    return { ip: "" };
}

async function readNotificationState(): Promise<PermState> {
    if (typeof window === "undefined" || !("Notification" in window))
        return "unsupported";
    const p = Notification.permission;
    return p === "default" ? "prompt" : (p as PermState);
}

async function readGeolocationState(fallback: PermState): Promise<PermState> {
    if (typeof navigator === "undefined" || !navigator.geolocation)
        return "unsupported";
    const perms = (navigator as unknown as {
        permissions?: {
            query?: (d: { name: PermissionName }) => Promise<PermissionStatus>;
        };
    }).permissions;
    if (perms?.query) {
        try {
            const status = await perms.query({
                name: "geolocation" as PermissionName,
            });
            return status.state as PermState;
        } catch {
            /* ignore */
        }
    }
    return fallback;
}

/* ------------------------------------------------------------------ */
/* Presentational pieces                                               */
/* ------------------------------------------------------------------ */
function useTypewriter(text: string, speed: number, start: boolean) {
    const [out, setOut] = useState("");
    const [done, setDone] = useState(false);
    useEffect(() => {
        if (!start) return;
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setOut(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(id);
                setDone(true);
            }
        }, speed);
        return () => clearInterval(id);
    }, [text, speed, start]);
    return { out, done };
}

function Scanlines() {
    return (
        <div
            aria-hidden
            style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `linear-gradient(${C.bgAlt} 1px, transparent 1px), linear-gradient(90deg, ${C.bgAlt} 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
                maskImage:
                    "radial-gradient(circle at 50% 40%, #000 0%, transparent 75%)",
                WebkitMaskImage:
                    "radial-gradient(circle at 50% 40%, #000 0%, transparent 75%)",
            }}
        />
    );
}

function Cursor() {
    return (
        <motion.span
            style={{
                display: "inline-block",
                width: 8,
                height: 14,
                background: C.greenBright,
                marginLeft: 3,
                verticalAlign: "text-bottom",
            }}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{
                duration: 1,
                repeat: Infinity,
                times: [0, 0.5, 0.5, 1],
                ease: "linear",
            }}
        />
    );
}

function Prompt() {
    return (
        <span style={{ whiteSpace: "nowrap" }}>
            <span style={{ color: C.greenBright }}>ccn@secure</span>
            <span style={{ color: C.textDim }}>:</span>
            <span style={{ color: C.cyan }}>~/lms</span>
            <span style={{ color: C.textDim }}>$ </span>
        </span>
    );
}

function AsciiBanner() {
    const { out, done } = useTypewriter(CCN_BANNER, 4, true);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, minHeight: 88 }}>
            <pre
                style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 13,
                    lineHeight: 1.15,
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${C.cyan}, ${C.purpleBright})`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    whiteSpace: "pre",
                    overflowX: "auto",
                }}
            >
                {out}
            </pre>
            {!done && <Cursor />}
        </div>
    );
}

function TermButton({
    children,
    onClick,
    disabled,
    tone = "brand",
    full,
}: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    tone?: "brand" | "red" | "green";
    full?: boolean;
}) {
    const bg =
        disabled || tone === "green"
            ? C.green
            : tone === "red"
            ? C.red
            : `linear-gradient(90deg, ${C.blueDeep}, ${C.purple})`;
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                fontFamily: MONO,
                width: full ? "100%" : "auto",
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                color: C.white,
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: 0.3,
                cursor: disabled ? "default" : "pointer",
                background: bg,
            }}
        >
            {children}
        </button>
    );
}

function StatusSeg({
    bg,
    text,
    color = C.white,
}: {
    bg: string;
    text: string;
    color?: string;
}) {
    if (!text) return null;
    return (
        <span
            style={{
                background: bg,
                color,
                padding: "5px 11px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
            }}
        >
            {text}
        </span>
    );
}

interface Step {
    id: string;
    cmd: string;
    status: StepStatus;
    detail: string;
}

function StepLine({ step }: { step: Step }) {
    const done = step.status === "done";
    const active = step.status === "active";
    return (
        <div style={{ marginBottom: 7, fontSize: 13, lineHeight: 1.55 }}>
            {/* <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                <Prompt />
                <span style={{ color: C.text }}>{step.cmd}</span>
                {active && <Cursor />}
            </div> */}
            {(done || active) && (
                <div style={{ color: C.textSoft, paddingLeft: 2 }}>
                    <span
                        style={{
                            color: done ? C.greenBright : C.amber,
                            fontWeight: 700,
                        }}
                    >
                        {done ? "[ ok ]" : "[ .. ]"}
                    </span>{" "}
                    {step.detail || "working"}
                </div>
            )}
        </div>
    );
}

function InfoLine({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div style={{ display: "flex", fontSize: 12.5, lineHeight: 1.75 }}>
            <span style={{ color: C.textDim, width: 120, flexShrink: 0 }}>{label}</span>
            <span style={{ color: C.textDim }}>:&nbsp;</span>
            <span style={{ color, fontWeight: 600, wordBreak: "break-all" }}>{value}</span>
        </div>
    );
}

function PermRow({
    cmd,
    description,
    state,
    onGrant,
}: {
    cmd: string;
    description: string;
    state: PermState;
    onGrant: () => void;
}) {
    const granted = state === "granted";
    const denied = state === "denied";
    const unsupported = state === "unsupported";
    const tag = granted
        ? "GRANTED"
        : denied
        ? "BLOCKED"
        : unsupported
        ? "N/A"
        : "REQUIRED";
    const tagColor = granted ? C.greenBright : denied ? C.red : C.amber;
    return (
        <div
            style={{
                border: `1px solid ${granted ? C.green : denied ? C.red : C.border}`,
                borderRadius: 8,
                padding: 12,
                background: C.panel,
                display: "flex",
                flexDirection: "column",
                gap: 9,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    fontSize: 13,
                }}
            >
                <span style={{ color: C.text }}>{cmd}</span>
                <span style={{ color: tagColor, fontWeight: 700 }}>[ {tag} ]</span>
            </div>
            <div style={{ color: C.textDim, fontSize: 12, lineHeight: 1.5 }}>
                # {denied
                    ? "blocked — enable it in browser site settings, then retry"
                    : description}
            </div>
            <TermButton
                onClick={onGrant}
                disabled={granted}
                tone={granted ? "green" : denied ? "red" : "brand"}
                full
            >
                {granted ? "access-granted" : denied ? "> retry-access" : "> execute"}
            </TermButton>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */
export function CyberSecurityProvider({ children }: { children: ReactNode }) {
    const [phase, setPhase] = useState<Phase>("booting");

    const [ipInfo, setIpInfo] = useState<IpInfo>({ ip: "" });
    const [system, setSystem] = useState<SystemInfo | null>(null);
    const [network, setNetwork] = useState<NetworkInfo | null>(null);
    const [coords, setCoords] = useState<Coords | null>(null);

    const [notifState, setNotifState] = useState<PermState>("prompt");
    const [geoState, setGeoState] = useState<PermState>("prompt");
    const geoStateRef = useRef<PermState>("prompt");

    const [steps, setSteps] = useState<Step[]>([
        { id: "init", cmd: "./init --secure-runtime", status: "pending", detail: "" },
        { id: "ip", cmd: "curl -s https://api.ccn/whoami", status: "pending", detail: "" },
        { id: "device", cmd: "uname -a && systeminfo", status: "pending", detail: "" },
        { id: "network", cmd: "ping -c 1 gateway", status: "pending", detail: "" },
        { id: "system", cmd: "cat /proc/cpuinfo | summary", status: "pending", detail: "" },
    ]);

    const setStep = useCallback(
        (id: string, patch: Partial<Step>) => {
            setSteps((prev) =>
                prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
            );
        },
        []
    );

    /* -------- boot sequence -------- */
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setStep("init", { status: "active" });
            await delay(650);
            if (cancelled) return;
            setStep("init", { status: "done", detail: "Runtime secured" });

            setStep("ip", { status: "active" });
            const info = await fetchIpInfo();
            if (cancelled) return;
            setIpInfo(info);
            if (info.ip) {
                try {
                    localStorage.setItem("ccn_client_ip", info.ip);
                    localStorage.setItem(
                        "ccn_client_ip_meta",
                        JSON.stringify({
                            ip: info.ip,
                            city: info.city ?? null,
                            country: info.country ?? null,
                            org: info.org ?? null,
                            at: new Date().toISOString(),
                        })
                    );
                } catch {
                    /* storage may be blocked */
                }
            }
            setStep("ip", {
                status: "done",
                detail: info.ip ? `Secured · ${info.ip}` : "IP unavailable",
            });
            await delay(350);

            setStep("device", { status: "active" });
            const sys = detectSystem();
            if (cancelled) return;
            setSystem(sys);
            setStep("device", {
                status: "done",
                detail: `${sys.deviceType} · ${sys.os}${sys.osVersion ? " " + sys.osVersion : ""}`,
            });
            await delay(400);

            setStep("network", { status: "active" });
            const net = detectNetwork();
            if (cancelled) return;
            setNetwork(net);
            setStep("network", {
                status: "done",
                detail: net.online
                    ? `Online · ${net.effectiveType}`
                    : "No connection",
            });
            await delay(400);

            setStep("system", { status: "active" });
            await delay(500);
            if (cancelled) return;
            setStep("system", {
                status: "done",
                detail: `${sys.cpuCores ?? "?"} cores · ${sys.browser}`,
            });
            await delay(450);

            // hold the completed scan on screen so it is readable
            await delay(1000);

            const n = await readNotificationState();
            const g = await readGeolocationState(geoStateRef.current);
            if (cancelled) return;
            setNotifState(n);
            setGeoState(g);
            geoStateRef.current = g;

            if (n === "granted" && g === "granted") {
                setPhase("preview");
            } else {
                setPhase("permissions");
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, []);

    /* -------- live network status -------- */
    useEffect(() => {
        const update = () =>
            setNetwork((prev) => (prev ? { ...prev, ...detectNetwork() } : detectNetwork()));
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
        };
    }, []);

    /* -------- permission requests -------- */
    const requestNotifications = useCallback(async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            setNotifState("unsupported");
            return;
        }
        try {
            const res = await Notification.requestPermission();
            setNotifState(res === "default" ? "prompt" : (res as PermState));
        } catch {
            setNotifState("denied");
        }
    }, []);

    const requestLocation = useCallback(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setGeoState("unsupported");
            geoStateRef.current = "unsupported";
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
                setGeoState("granted");
                geoStateRef.current = "granted";
            },
            (err) => {
                const next: PermState =
                    err.code === err.PERMISSION_DENIED ? "denied" : "prompt";
                setGeoState(next);
                geoStateRef.current = next;
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    }, []);

    /* -------- ensure coordinates for preview -------- */
    const ensureCoords = useCallback(
        () =>
            new Promise<void>((resolve) => {
                if (
                    coords ||
                    typeof navigator === "undefined" ||
                    !navigator.geolocation
                ) {
                    resolve();
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setCoords({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                        });
                        geoStateRef.current = "granted";
                        resolve();
                    },
                    () => resolve(),
                    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
                );
            }),
        [coords]
    );

    /* -------- continuous permission enforcement -------- */
    const bothGranted = notifState === "granted" && geoState === "granted";

    useEffect(() => {
        if (phase === "booting") return;

        let stopped = false;

        const evaluate = async () => {
            const n = await readNotificationState();
            const g = await readGeolocationState(geoStateRef.current);
            if (stopped) return;
            setNotifState(n);
            setGeoState(g);
            geoStateRef.current = g;
            if (n === "granted" && g === "granted") {
                setPhase((p) => (p === "ready" ? "ready" : "preview"));
            } else {
                setPhase("permissions");
            }
        };

        evaluate();
        const interval = setInterval(evaluate, 4000);

        // react to browser-level permission changes
        const listeners: PermissionStatus[] = [];
        const perms = (navigator as unknown as {
            permissions?: {
                query?: (d: { name: PermissionName }) => Promise<PermissionStatus>;
            };
        }).permissions;
        if (perms?.query) {
            ["notifications", "geolocation"].forEach((name) => {
                perms
                    .query!({ name: name as PermissionName })
                    .then((status) => {
                        status.onchange = evaluate;
                        listeners.push(status);
                    })
                    .catch(() => {});
            });
        }

        return () => {
            stopped = true;
            clearInterval(interval);
            listeners.forEach((l) => (l.onchange = null));
        };
    }, [phase]);

    /* -------- location preview before entering workspace -------- */
    useEffect(() => {
        if (phase !== "preview") return;
        let cancelled = false;
        (async () => {
            await ensureCoords();
            if (cancelled) return;
            await delay(2000);
            if (cancelled) return;
            // setPhase("ready");
        })();
        return () => {
            cancelled = true;
        };
    }, [phase, ensureCoords]);

    const contextValue = useMemo<CyberSecurityContextValue>(
        () => ({
            ipAddress: ipInfo.ip || null,
            city: ipInfo.city ?? null,
            country: ipInfo.country ?? null,
            org: ipInfo.org ?? null,
            system,
            network,
            coords,
            notificationsGranted: notifState === "granted",
            locationGranted: geoState === "granted",
        }),
        [ipInfo, system, network, coords, notifState, geoState]
    );

    const progress = Math.round(
        (steps.filter((s) => s.status === "done").length / steps.length) * 100
    );

    const filled = Math.round((progress / 100) * 14);
    const bar = "█".repeat(filled) + "░".repeat(14 - filled);
    const visibleSteps = steps.filter((s) => s.status !== "pending");

    return (
        <CyberSecurityContext.Provider value={contextValue}>
            {phase === "ready" ? (
                children
            ) : (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: C.bg,
                        color: C.text,
                        fontFamily: MONO,
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                    }}
                >
                    <Scanlines />

                    <div
                        style={{
                            position: "relative",
                            flex: 1,
                            minHeight: 0,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            background:"#000000",
                            overflow: "hidden",
                        }}
                    >
                        {/* title bar */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 14px",
                                background: C.panelAlt,
                                borderBottom: `1px solid ${C.border}`,
                            }}
                        >
                            <span style={{ display: "flex", gap: 7 }}>
                                <span style={{ width: 12, height: 12, borderRadius: "50%", background: C.red }} />
                                <span style={{ width: 12, height: 12, borderRadius: "50%", background: C.amber }} />
                                <span style={{ width: 12, height: 12, borderRadius: "50%", background: C.greenBright }} />
                            </span>
                            <span style={{ marginLeft: 4, color: C.textSoft, fontSize: 12.5 }}>
                                ccn@secure: ~/lms — secure-session
                            </span>
                            <span style={{ marginLeft: "auto", color: C.textDim, fontSize: 11.5 }}>
                                {APP_VERSION}
                            </span>
                        </div>

                        {/* body */}
                        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 20px 14px" }}>
                            <div style={{ width: "100%", marginLeft: "auto", marginRight: "auto" }}>
                            <AsciiBanner />

                            <div style={{ marginTop: 4, marginBottom: 16, fontSize: 12.5, lineHeight: 1.7 }}>
                                <div>
                                    <span style={{ color: C.greenBright, fontWeight: 700 }}>
                                        Connecting Cyber Networks
                                    </span>
                                    <span style={{ color: C.textDim }}> · Secure Access Verification</span>
                                </div>
                                <div style={{ color: C.textDim }}>
                                    LMS Version <span style={{ color: C.cyan }}>{APP_VERSION}</span>
                                    {"  ·  "} last updated <span style={{ color: C.cyan }}>{LAST_UPDATED}</span>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {phase === "booting" ? (
                                    <motion.div
                                        key="booting"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {visibleSteps.map((s) => (
                                            <StepLine key={s.id} step={s} />
                                        ))}

                                        <div style={{ marginTop: 8, fontSize: 13 }}>
                                            <span style={{ color: C.textDim }}>scan </span>
                                            <span style={{ color: C.greenBright }}>[{bar}]</span>
                                            <span style={{ color: C.text }}> {progress}%</span>
                                        </div>

                                        {system && (
                                            <div
                                                style={{
                                                    marginTop: 16,
                                                    padding: 14,
                                                    borderRadius: 8,
                                                    background: C.panel,
                                                    border: `1px solid ${C.border}`,
                                                }}
                                            >
                                                <div style={{ color: C.textDim, fontSize: 12, marginBottom: 8 }}>
                                                    # system fingerprint
                                                </div>
                                                <InfoLine
                                                    label="ip.address"
                                                    value={ipInfo.ip || "unavailable"}
                                                    color={C.greenBright}
                                                />
                                                <InfoLine
                                                    label="location"
                                                    value={
                                                        ipInfo.city && ipInfo.country
                                                            ? `${ipInfo.city}, ${ipInfo.country}`
                                                            : ipInfo.country || "resolving..."
                                                    }
                                                    color={C.text}
                                                />
                                                <InfoLine
                                                    label="device"
                                                    value={`${system.deviceType} · ${system.os}${system.osVersion ? " " + system.osVersion : ""}`}
                                                    color={C.cyan}
                                                />
                                                <InfoLine
                                                    label="browser"
                                                    value={`${system.browser}${system.browserVersion ? " " + system.browserVersion : ""}`}
                                                    color={C.purpleBright}
                                                />
                                                <InfoLine
                                                    label="network"
                                                    value={
                                                        network?.online
                                                            ? `online · ${network.effectiveType}${network.downlinkMbps ? " · " + network.downlinkMbps + "Mbps" : ""}`
                                                            : "offline"
                                                    }
                                                    color={network?.online ? C.greenBright : C.red}
                                                />
                                                <InfoLine
                                                    label="processor"
                                                    value={`${system.cpuCores ?? "?"} logical cores`}
                                                    color={C.text}
                                                />
                                                <InfoLine
                                                    label="memory"
                                                    value={system.memoryGb ? `${system.memoryGb} GB` : "not reported"}
                                                    color={C.text}
                                                />
                                                <InfoLine
                                                    label="display"
                                                    value={`${system.screen} @ ${system.pixelRatio}x`}
                                                    color={C.text}
                                                />
                                                <InfoLine label="timezone" value={system.timezone} color={C.text} />
                                                <InfoLine label="language" value={system.language} color={C.text} />
                                            </div>
                                        )}
                                    </motion.div>
                                ) : phase === "preview" ? (
                                    <motion.div
                                        key="preview"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {/* <div style={{ fontSize: 13, marginBottom: 4 }}>
                                            <Prompt />
                                            <span style={{ color: C.text }}>./locate --preview</span>
                                        </div> */}
                                        <div style={{ color: C.greenBright, fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>
                                            [ ok ] position acquired · rendering preview
                                        </div>

                                        <div style={{ marginBottom: 12 }}>
                                            <InfoLine
                                                label="latitude"
                                                value={coords ? coords.latitude.toFixed(6) : "resolving..."}
                                                color={C.cyan}
                                            />
                                            <InfoLine
                                                label="longitude"
                                                value={coords ? coords.longitude.toFixed(6) : "resolving..."}
                                                color={C.cyan}
                                            />
                                            <InfoLine
                                                label="accuracy"
                                                value={coords ? `±${Math.round(coords.accuracy)} m` : "—"}
                                                color={C.text}
                                            />
                                            <InfoLine
                                                label="region"
                                                value={
                                                    ipInfo.city && ipInfo.country
                                                        ? `${ipInfo.city}, ${ipInfo.country}`
                                                        : ipInfo.country || "unknown"
                                                }
                                                color={C.text}
                                            />
                                        </div>

                                        {coords && (
                                            <div
                                                style={{
                                                    border: `1px solid ${C.borderStrong}`,
                                                    borderRadius: 8,
                                                    overflow: "hidden",
                                                    background: C.panel,
                                                }}
                                            >
                                                <iframe
                                                    title="location-preview"
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.02}%2C${coords.latitude - 0.02}%2C${coords.longitude + 0.02}%2C${coords.latitude + 0.02}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
                                                    style={{
                                                        width: "100%",
                                                        height: 500,
                                                        border: "none",
                                                        display: "block",
                                                        filter: "invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9)",
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div style={{ marginTop: 12, color: C.textDim, fontSize: 12.5 }}>
                                            <span style={{ color: C.greenBright }}>&gt;</span> finalizing secure session...
                                            <Cursor />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="permissions"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {/* <div style={{ fontSize: 13, marginBottom: 4 }}>
                                            <Prompt />
                                            <span style={{ color: C.text }}>./verify-access --required</span>
                                        </div> */}
                                        <div style={{ color: C.amber, fontSize: 12.5, marginBottom: 14, lineHeight: 1.6 }}>
                                            <span style={{ fontWeight: 700 }}>[ warn ]</span> notification and
                                            location access are mandatory. workspace stays locked and is
                                            re-verified continuously until both pass.
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <PermRow
                                                cmd="grant --notifications"
                                                description="class alerts, security notices & realtime updates"
                                                state={notifState}
                                                onGrant={requestNotifications}
                                            />
                                            <PermRow
                                                cmd="grant --location"
                                                description="verify access region to block unauthorized sign-ins"
                                                state={geoState}
                                                onGrant={requestLocation}
                                            />
                                        </div>

                                        <div
                                            style={{
                                                marginTop: 14,
                                                padding: "11px 14px",
                                                borderRadius: 8,
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                                textAlign: "center",
                                                color: bothGranted ? C.white : C.textDim,
                                                background: bothGranted ? C.green : C.panel,
                                                border: `1px solid ${bothGranted ? C.green : C.border}`,
                                            }}
                                        >
                                            {bothGranted
                                                ? "[ ok ] verified · unlocking workspace"
                                                : "> awaiting all permissions..."}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            </div>
                        </div>

                        {/* status bar */}
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "stretch",
                                borderTop: `1px solid ${C.border}`,
                            }}
                        >
                            <StatusSeg bg={C.blueDeep} text={APP_VERSION} />
                            <StatusSeg
                                bg={network?.online ? C.green : C.red}
                                text={network?.online ? "ONLINE" : "OFFLINE"}
                            />
                            <StatusSeg
                                bg={C.panelAlt}
                                text={ipInfo.ip ? ipInfo.ip : "ip —"}
                                color={C.textSoft}
                            />
                            <StatusSeg
                                bg={C.panelAlt}
                                text={system ? system.deviceType : "device —"}
                                color={C.textSoft}
                            />
                            <StatusSeg bg={C.purple} text={system ? system.browser : ""} />
                            <span
                                style={{
                                    marginLeft: "auto",
                                    background: C.panelAlt,
                                    color: C.textDim,
                                    padding: "5px 11px",
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            >
                                UTF-8
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </CyberSecurityContext.Provider>
    );
}

export default CyberSecurityProvider;
