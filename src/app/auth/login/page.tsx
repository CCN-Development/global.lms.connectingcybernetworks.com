"use client";

import {
    ChangeEvent,
    ClipboardEvent,
    FormEvent,
    KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
    LuArrowLeft,
    LuArrowRight,
    LuChevronDown,
    LuEye,
    LuEyeOff,
    LuKeyRound,
    LuLoader,
    LuLock,
    LuMail,
    LuPhone,
    LuSearch,
    LuShieldCheck,
} from "react-icons/lu";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "otp" | "password";
type Step = "identifier" | "otp";
type Channel = "phone" | "email";
type UserRole = "Owner" | "Admin" | "RM" | "Trainer" | "Student" | "Accountant";

const ROLE_PATH_MAP: Record<UserRole, string> = {
    Owner: "/dashboard/owner/overview",
    Admin: "/dashboard/admin/overview",
    RM: "/dashboard/rm/overview",
    Trainer: "/dashboard/trainer/overview",
    Student: "/dashboard/student/overview",
    Accountant: "/dashboard/accountants/overview",
};

interface Country {
    name: string;
    iso: string;
    dial: string;
}

const COUNTRIES: Country[] = [
    { name: "India", iso: "IN", dial: "+91" },
    { name: "United States", iso: "US", dial: "+1" },
    { name: "United Kingdom", iso: "GB", dial: "+44" },
    { name: "United Arab Emirates", iso: "AE", dial: "+971" },
    { name: "Canada", iso: "CA", dial: "+1" },
    { name: "Australia", iso: "AU", dial: "+61" },
    { name: "Singapore", iso: "SG", dial: "+65" },
    { name: "Germany", iso: "DE", dial: "+49" },
    { name: "France", iso: "FR", dial: "+33" },
    { name: "Netherlands", iso: "NL", dial: "+31" },
    { name: "Saudi Arabia", iso: "SA", dial: "+966" },
    { name: "Qatar", iso: "QA", dial: "+974" },
    { name: "Kuwait", iso: "KW", dial: "+965" },
    { name: "Oman", iso: "OM", dial: "+968" },
    { name: "Bahrain", iso: "BH", dial: "+973" },
    { name: "Malaysia", iso: "MY", dial: "+60" },
    { name: "Indonesia", iso: "ID", dial: "+62" },
    { name: "Philippines", iso: "PH", dial: "+63" },
    { name: "Thailand", iso: "TH", dial: "+66" },
    { name: "Vietnam", iso: "VN", dial: "+84" },
    { name: "Bangladesh", iso: "BD", dial: "+880" },
    { name: "Pakistan", iso: "PK", dial: "+92" },
    { name: "Sri Lanka", iso: "LK", dial: "+94" },
    { name: "Nepal", iso: "NP", dial: "+977" },
    { name: "Japan", iso: "JP", dial: "+81" },
    { name: "South Korea", iso: "KR", dial: "+82" },
    { name: "China", iso: "CN", dial: "+86" },
    { name: "Brazil", iso: "BR", dial: "+55" },
    { name: "South Africa", iso: "ZA", dial: "+27" },
    { name: "Nigeria", iso: "NG", dial: "+234" },
];

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.iso === "IN") ?? COUNTRIES[0];
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function detectChannel(raw: string): Channel {
    const s = raw.trim();
    if (!s) return "phone";
    if (s.includes("@")) return "email";
    if (/^\d+$/.test(s.replace(/[\s\-()+]/g, ""))) return "phone";
    return "email";
}

function extractDial(raw: string): { country: Country; local: string } | null {
    const s = raw.trim().replace(/[\s\-()]/g, "");
    if (!s.startsWith("+")) return null;
    const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    for (const c of sorted) {
        if (s.startsWith(c.dial)) return { country: c, local: s.slice(c.dial.length) };
    }
    return null;
}

/* ------------------------------------------------------------------ */
/* ISO badge (light-themed)                                           */
/* ------------------------------------------------------------------ */

function IsoBadge({ iso }: { iso: string }) {
    return (
        <span className="inline-flex items-center justify-center min-w-7.5 h-5.5 px-1.5 rounded-md bg-gray-100 border border-gray-200 text-[11px] font-bold tracking-widest text-gray-600">
            {iso}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Country picker (light-themed)                                       */
/* ------------------------------------------------------------------ */

function CountryPicker({ value, onChange }: { value: Country; onChange: (c: Country) => void }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q
            ? COUNTRIES.filter(
                  (c) =>
                      c.name.toLowerCase().includes(q) ||
                      c.dial.includes(q) ||
                      c.iso.toLowerCase().includes(q)
              )
            : COUNTRIES;
    }, [query]);

    return (
        <div ref={rootRef} className="relative h-full">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="h-full flex items-center gap-2 pl-3.5 pr-3 border-r border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <IsoBadge iso={value.iso} />
                <span className="text-sm font-semibold tabular-nums text-gray-800">
                    {value.dial}
                </span>
                <LuChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.14 }}
                        className="absolute left-0 top-[calc(100%+6px)] z-50 w-80 rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/60 overflow-hidden"
                    >
                        <div className="p-2.5 border-b border-gray-100">
                            <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
                                <LuSearch className="w-4 h-4 text-gray-400 shrink-0" />
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search country or code"
                                    className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 w-full"
                                />
                            </div>
                        </div>
                        <div className="max-h-72 overflow-y-auto py-1.5">
                            {filtered.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-gray-400 text-center">
                                    No matches
                                </p>
                            ) : (
                                filtered.map((c) => {
                                    const active = c.iso === value.iso && c.dial === value.dial;
                                    return (
                                        <button
                                            key={`${c.iso}-${c.dial}`}
                                            type="button"
                                            onClick={() => {
                                                onChange(c);
                                                setOpen(false);
                                                setQuery("");
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                                active ? "bg-violet-50" : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <IsoBadge iso={c.iso} />
                                            <span
                                                className={`text-sm flex-1 truncate ${
                                                    active ? "font-semibold text-violet-700" : "text-gray-800"
                                                }`}
                                            >
                                                {c.name}
                                            </span>
                                            <span
                                                className={`text-xs font-medium tabular-nums ${
                                                    active ? "text-violet-500" : "text-gray-400"
                                                }`}
                                            >
                                                {c.dial}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* OTP inputs (light-themed)                                           */
/* ------------------------------------------------------------------ */

function OtpInputs({
    value,
    onChange,
    onComplete,
    disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    onComplete?: (v: string) => void;
    disabled?: boolean;
}) {
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    const digits = useMemo(() => {
        const arr = value.split("").slice(0, OTP_LENGTH);
        while (arr.length < OTP_LENGTH) arr.push("");
        return arr;
    }, [value]);

    const setDigit = (i: number, d: string) => {
        const next = digits.slice();
        next[i] = d;
        const merged = next.join("");
        onChange(merged);
        if (merged.replace(/\s/g, "").length === OTP_LENGTH) onComplete?.(merged);
    };

    const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        if (!raw) { setDigit(i, ""); return; }
        if (raw.length > 1) {
            const chars = raw.slice(0, OTP_LENGTH - i).split("");
            const next = digits.slice();
            chars.forEach((c, k) => (next[i + k] = c));
            const merged = next.join("");
            onChange(merged);
            const fi = Math.min(i + chars.length, OTP_LENGTH - 1);
            refs.current[fi]?.focus();
            if (merged.length === OTP_LENGTH) onComplete?.(merged);
            return;
        }
        setDigit(i, raw);
        if (i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[i]) { setDigit(i, ""); }
            else if (i > 0) { refs.current[i - 1]?.focus(); setDigit(i - 1, ""); }
        } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
        else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const raw = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!raw) return;
        e.preventDefault();
        const next = raw.slice(0, OTP_LENGTH).padEnd(OTP_LENGTH, "").split("");
        const merged = next.join("");
        onChange(merged);
        refs.current[Math.min(raw.length, OTP_LENGTH - 1)]?.focus();
        if (raw.length >= OTP_LENGTH) onComplete?.(merged.slice(0, OTP_LENGTH));
    };

    return (
        <div className="flex items-center justify-between gap-2 sm:gap-3">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    disabled={disabled}
                    value={d}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-full aspect-square max-w-13 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all disabled:opacity-50 ${
                        d
                            ? "border-violet-500 bg-violet-50 text-gray-900 shadow-[0_0_0_4px_rgba(124,58,237,0.10)]"
                            : "border-gray-200 bg-gray-50 text-gray-900"
                    } focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]`}
                />
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Primary button                                                      */
/* ------------------------------------------------------------------ */

function PrimaryButton({
    children,
    loading,
    className = "",
}: {
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
}) {
    return (
        <button
            type="submit"
            disabled={loading}
            className={`relative w-full h-12 rounded-xl text-white text-sm font-semibold tracking-wide overflow-hidden group disabled:cursor-not-allowed disabled:opacity-75 ${className}`}
        >
            <span aria-hidden className="absolute inset-0 bg-linear-to-r from-[#00098B] via-[#5900AC] to-[#8c24ff]" />
            <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-r from-[#8c24ff] via-[#5900AC] to-[#00098B]" />
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        <LuLoader className="w-4 h-4 animate-spin" />
                        Please wait…
                    </>
                ) : (
                    <>
                        {children}
                        <LuArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                )}
            </span>
        </button>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
    const router = useRouter();
    const auth = useAuth();

    const [mode, setMode] = useState<Mode>("otp");
    const [step, setStep] = useState<Step>("identifier");
    const [identifier, setIdentifier] = useState("");
    const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resendIn, setResendIn] = useState(0);

    const channel: Channel = useMemo(() => detectChannel(identifier), [identifier]);

    useEffect(() => {
        if (channel !== "phone") return;
        const extracted = extractDial(identifier);
        if (extracted) {
            setCountry(extracted.country);
            setIdentifier(extracted.local);
        }
    }, [identifier, channel]);

    useEffect(() => {
        if (resendIn <= 0) return;
        const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [resendIn]);

    const redirectByRole = useCallback(
        (role: UserRole) => { router.push(ROLE_PATH_MAP[role] ?? "/"); router.refresh(); },
        [router]
    );

    const validateIdentifier = useCallback((): boolean => {
        const s = identifier.trim();
        if (!s) { toast.error("Enter your email or phone number"); return false; }
        if (channel === "email") {
            if (!EMAIL_REGEX.test(s)) { toast.error("Enter a valid email address"); return false; }
            return true;
        }
        if (s.replace(/\D/g, "").length < 6) { toast.error("Enter a valid phone number"); return false; }
        return true;
    }, [identifier, channel]);

    const sendOtp = useCallback(async () => {
        if (!validateIdentifier()) return;
        setSubmitting(true);
        try {
            const res =
                channel === "email"
                    ? await auth.sendEmailOtp({ email: identifier.trim() })
                    : await auth.sendPhoneOtp({ callingCode: country.dial, phoneNumber: identifier.replace(/\D/g, "") });
            if (!res.success) { toast.error(res.message ?? "Failed to send code"); return; }
            toast.success(channel === "email" ? "Code sent to your email" : `Code sent to ${country.dial} ${identifier}`);
            setOtp(""); setStep("otp"); setResendIn(RESEND_SECONDS);
        } finally { setSubmitting(false); }
    }, [auth, channel, country.dial, identifier, validateIdentifier]);

    const verifyOtp = useCallback(async (code?: string) => {
        const val = (code ?? otp).replace(/\D/g, "");
        if (val.length !== OTP_LENGTH) { toast.error(`Enter the ${OTP_LENGTH}-digit code`); return; }
        setSubmitting(true);
        try {
            const res =
                channel === "email"
                    ? await auth.loginWithEmailOtp({ email: identifier.trim(), otp: val })
                    : await auth.loginWithPhoneOtp({ callingCode: country.dial, phoneNumber: identifier.replace(/\D/g, ""), otp: val });
            if (!res.success || !res.data) { toast.error(res.message ?? "Invalid or expired code"); return; }
            toast.success("Signed in"); redirectByRole(res.data.role);
        } finally { setSubmitting(false); }
    }, [auth, channel, country.dial, identifier, otp, redirectByRole]);

    const passwordLogin = useCallback(async () => {
        if (!validateIdentifier()) return;
        if (!password) { toast.error("Enter your password"); return; }
        setSubmitting(true);
        try {
            const payload =
                channel === "email"
                    ? { email: identifier.trim(), password }
                    : { callingCode: country.dial, phoneNumber: identifier.replace(/\D/g, ""), password };
            const res = await auth.passwordLogin(payload);
            if (!res.success || !res.data) { toast.error(res.message ?? "Login failed"); return; }
            toast.success("Signed in"); redirectByRole(res.data.role);
        } finally { setSubmitting(false); }
    }, [auth, channel, country.dial, identifier, password, redirectByRole, validateIdentifier]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        if (mode === "password") return passwordLogin();
        if (step === "identifier") return sendOtp();
        return verifyOtp();
    };

    const switchMode = (next: Mode) => { setMode(next); setStep("identifier"); setOtp(""); setPassword(""); };
    const backToIdentifier = () => { setStep("identifier"); setOtp(""); };

    const ctaLabel =
        mode === "otp" ? (step === "identifier" ? "Send verification code" : "Verify & sign in") : "Sign in";

    /* Concentric arc ring sizes for the left panel decoration */
    const RINGS = [200, 320, 440, 560, 680];

    return (
        <div className="min-h-screen flex bg-white overflow-hidden">
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#ffffff",
                        color: "#111827",
                        border: "1px solid #e5e7eb",
                        fontSize: 13,
                        borderRadius: 12,
                        boxShadow: "0 8px 30px -6px rgba(0,0,0,0.12)",
                    },
                    success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
                    error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
                }}
            />

            {/* ================================================= */}
            {/* LEFT — dark brand panel                            */}
            {/* ================================================= */}
            <aside className="hidden lg:flex lg:w-[46%] xl:w-[48%] shrink-0 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-linear-to-br from-[#00098B] via-[#2600a8] to-[#5900AC]">
                {/* Concentric arc rings */}
                <div
                    aria-hidden
                    className="absolute pointer-events-none"
                    style={{ right: 0, top: "50%", width: 0, height: 0 }}
                >
                    {RINGS.map((d) => (
                        <div
                            key={d}
                            style={{
                                position: "absolute",
                                width: d,
                                height: d,
                                top: -d / 2,
                                right: -d / 2,
                                borderRadius: "50%",
                                border: "1px solid rgba(255,255,255,0.09)",
                            }}
                        />
                    ))}
                </div>

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl  flex items-center justify-center">
                        <Image src="/ccn-icon-dark.png" alt="CCN" width={28} height={28} priority />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white leading-tight">
                            Connecting Cyber Networks
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-0.5">
                            LMS Platform
                        </p>
                    </div>
                </div>

                {/* Hero text */}
                <div className="relative max-w-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-5">
                        The cyber learning platform
                    </p>
                    <h1 className="text-5xl xl:text-[60px] font-black text-white leading-[1.05] tracking-tight">
                        Learn.<br />
                        <span className="text-violet-300">Defend.</span><br />
                        Deliver.
                    </h1>
                    <p className="mt-6 text-[15px] leading-relaxed text-white/60 max-w-65">
                        One secure workspace for students, trainers and admins — with live batches and role-based dashboards.
                    </p>
                </div>

                {/* Footer */}
                <p className="relative text-[11px] text-white/35">
                    © {new Date().getFullYear()} CCN LMS. All rights reserved.
                </p>
            </aside>

            {/* ================================================= */}
            {/* RIGHT — white form panel                           */}
            {/* ================================================= */}
            <section className="flex-1 flex flex-col min-h-screen overflow-y-auto">
                {/* Desktop top-bar */}
              

                {/* Form */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12">
                    <div className="w-full max-w-95">
                        {/* Mobile logo */}
                        <div className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00098B] to-[#5900AC] flex items-center justify-center shadow">
                                <Image src="/ccn-icon-dark.png" alt="CCN" width={26} height={26} priority />
                            </div>
                            <span className="text-sm font-bold text-gray-900">CCN LMS</span>
                        </div>

                        {/* Heading */}
                        <div className="mb-8">
                            <h2 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">
                                {mode === "otp" && step === "otp" ? "Verify it's you" : "Welcome back!"}
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                {mode === "otp" && step === "otp"
                                    ? `Enter the ${OTP_LENGTH}-digit code we just sent`
                                    : mode === "otp"
                                      ? "Sign in with a one-time code sent to your inbox or phone."
                                      : "Sign in with your email or phone number and password."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {mode === "otp" && step === "otp" ? (
                                    /* ---- OTP step ---- */
                                    <motion.div
                                        key="otp-step"
                                        initial={{ opacity: 0, x: 18 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -18 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5 mb-5">
                                            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[#00098B] to-[#5900AC] flex items-center justify-center shrink-0">
                                                <LuShieldCheck className="w-4.5 h-4.5 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] text-gray-400 font-medium">Code sent to</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {channel === "email" ? identifier : `${country.dial} ${identifier}`}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={backToIdentifier}
                                                className="ml-auto shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                            >
                                                <LuArrowLeft className="w-3 h-3" />
                                                Change
                                            </button>
                                        </div>

                                        <OtpInputs
                                            value={otp}
                                            onChange={setOtp}
                                            onComplete={(v) => verifyOtp(v)}
                                            disabled={submitting}
                                        />

                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Didn&apos;t receive it?</span>
                                            <button
                                                type="button"
                                                disabled={resendIn > 0 || submitting}
                                                onClick={sendOtp}
                                                className="text-xs font-bold text-violet-600 hover:text-violet-800 disabled:text-gray-300 transition-colors"
                                            >
                                                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                                            </button>
                                        </div>

                                        <PrimaryButton loading={submitting} className="mt-7">
                                            {ctaLabel}
                                        </PrimaryButton>
                                    </motion.div>
                                ) : (
                                    /* ---- Identifier / password step ---- */
                                    <motion.div
                                        key={`${mode}-identifier`}
                                        initial={{ opacity: 0, x: -18 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 18 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Identifier */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                    Email or phone
                                                </label>
                                                <span className="text-[10px] text-gray-400">
                                                    {channel === "phone"
                                                        ? "Phone detected"
                                                        : identifier
                                                          ? "Email detected"
                                                          : "Auto detect"}
                                                </span>
                                            </div>
                                            <div className="flex items-stretch h-13 rounded-xl bg-gray-50 border-2 border-gray-200 focus-within:border-violet-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(124,58,237,0.08)] transition-all">
                                                <AnimatePresence initial={false} mode="popLayout">
                                                    {channel === "phone" ? (
                                                        <motion.div
                                                            key="cc"
                                                            initial={{ width: 0, opacity: 0 }}
                                                            animate={{ width: "auto", opacity: 1 }}
                                                            exit={{ width: 0, opacity: 0 }}
                                                            transition={{ duration: 0.18 }}
                                                            className="overflow-visible"
                                                        >
                                                            <CountryPicker value={country} onChange={setCountry} />
                                                        </motion.div>
                                                    ) : (
                                                        <div key="mail" className="pl-4 flex items-center text-gray-400">
                                                            <LuMail className="w-4.5 h-4.5" />
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                                <input
                                                    value={identifier}
                                                    onChange={(e) => setIdentifier(e.target.value)}
                                                    placeholder={channel === "phone" ? "9876543210" : "you@company.com"}
                                                    inputMode={channel === "phone" ? "tel" : "email"}
                                                    autoComplete={channel === "phone" ? "tel" : "email"}
                                                    className="flex-1 min-w-0 bg-transparent px-3.5 outline-none text-[15px] text-gray-900 placeholder:text-gray-400"
                                                />
                                                {channel === "phone" && (
                                                    <div className="pr-4 flex items-center text-gray-300">
                                                        <LuPhone className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-1.5 text-[11px] text-gray-400">
                                                Type an email or phone number — we&apos;ll detect it.
                                            </p>
                                        </div>

                                        {/* Password (conditional) */}
                                        <AnimatePresence initial={false}>
                                            {mode === "password" && (
                                                <motion.div
                                                    key="pwd"
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                            Password
                                                        </label>
                                                        <button
                                                            type="button"
                                                            className="text-[11px] font-bold text-violet-600 hover:text-violet-800 transition-colors"
                                                            tabIndex={-1}
                                                        >
                                                            Forgot password?
                                                        </button>
                                                    </div>
                                                    <div className="flex items-stretch h-13 rounded-xl bg-gray-50 border-2 border-gray-200 focus-within:border-violet-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(124,58,237,0.08)] transition-all">
                                                        <div className="pl-4 flex items-center text-gray-400">
                                                            <LuLock className="w-4.5 h-4.5" />
                                                        </div>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="Enter your password"
                                                            autoComplete="current-password"
                                                            className="flex-1 min-w-0 bg-transparent px-3.5 outline-none text-[15px] text-gray-900 placeholder:text-gray-400"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword((s) => !s)}
                                                            className="pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                                                            tabIndex={-1}
                                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                                        >
                                                            {showPassword ? (
                                                                <LuEyeOff className="w-4.5 h-4.5" />
                                                            ) : (
                                                                <LuEye className="w-4.5 h-4.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <PrimaryButton loading={submitting} className="mt-7">
                                            {ctaLabel}
                                        </PrimaryButton>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-gray-200" />
                            <span className="text-[11px] text-gray-400 uppercase tracking-widest">or</span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        {/* Mode switch */}
                        <button
                            type="button"
                            onClick={() => switchMode(mode === "otp" ? "password" : "otp")}
                            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all font-medium"
                        >
                            {mode === "otp" ? (
                                <>
                                    <LuKeyRound className="w-4 h-4" />
                                    Sign in with{" "}
                                    <span className="font-bold text-gray-900">password</span>
                                </>
                            ) : (
                                <>
                                    <LuShieldCheck className="w-4 h-4" />
                                    Sign in with{" "}
                                    <span className="font-bold text-gray-900">one-time code</span>
                                </>
                            )}
                        </button>

                        <p className="mt-8 text-center text-[11px] text-gray-400 leading-relaxed">
                            By continuing you agree to CCN&apos;s{" "}
                            <span className="text-gray-600 underline underline-offset-2 cursor-pointer">
                                Terms of Service
                            </span>{" "}
                            and{" "}
                            <span className="text-gray-600 underline underline-offset-2 cursor-pointer">
                                Privacy Policy
                            </span>
                            .
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
