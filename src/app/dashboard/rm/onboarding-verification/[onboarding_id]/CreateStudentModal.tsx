"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControlLabel, IconButton, Switch, Typography,
} from "@mui/material";
import { CreditCard, GraduationCap, IdCard, MapPin, User, UserPlus, Users, X } from "lucide-react";
import { fileUploaderToS3 } from "@/services/s3";
import { useContent } from "@/contexts/ContentContext";
import { useRM, type CreateStudentInput, type OnboardingDetail } from "@/contexts/RMContext";
import {
    AppDateField, AppMultiSelect, AppNumberField, AppSelect, AppTextField,
    BRAND, FileField, PhoneField, Surface,
} from "../../student-profiles/[student_id]/ui";
import { asText } from "./ui";

const EDUCATION_DOCUMENT_NAME = "Submitted education document";

const GENDER_OPTIONS = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
];

const RELATION_OPTIONS = [
    { label: "Father", value: "Father" },
    { label: "Mother", value: "Mother" },
    { label: "Guardian", value: "Guardian" },
    { label: "Sibling", value: "Sibling" },
    { label: "Spouse", value: "Spouse" },
    { label: "Other", value: "Other" },
];

type AddressForm = {
    addressLine: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    mapUrl: string;
};

type AdhaarJson = {
    name?: string;
    gender?: string;
    date_of_birth?: string;
    full_address?: string;
};

function toDateInput(value: string | null | undefined): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

function parseAdhaarJson(raw: string | null | undefined): AdhaarJson | null {
    if (!raw) return null;
    try {
        const parsed: unknown = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? (parsed as AdhaarJson) : null;
    } catch {
        return null;
    }
}

function emptyAddress(): AddressForm {
    return { addressLine: "", city: "", state: "", country: "India", postalCode: "", mapUrl: "" };
}

function hasAddressData(address: AddressForm) {
    return Object.values(address).some((v) => v.trim() !== "" && v.trim() !== "India");
}

/** Onboarding stores LMS ids; keep only the ones that still exist in the content catalogue. */
function pickExistingIds(selected: unknown, options: { id: string }[]) {
    if (!Array.isArray(selected)) return [];
    const available = new Set(options.map((o) => o.id));
    return selected.filter((id): id is string => typeof id === "string" && available.has(id));
}

export default function CreateStudentModal({
    open, onClose, onboarding, onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onboarding: OnboardingDetail;
    onCreated: (studentId: string) => void;
}) {
    const { createStudent } = useRM();
    const { packages, courses, getPackages, getCourses } = useContent();

    const adhaarJson = useMemo(() => parseAdhaarJson(onboarding.adhaarJsonData), [onboarding.adhaarJsonData]);
    const collected = useMemo(
        () => (onboarding.onboardingCollectionsDatas ?? []).reduce((sum, c) => sum + (c.paidAmount ?? 0), 0),
        [onboarding.onboardingCollectionsDatas],
    );

    /* ---------------------------- form state ---------------------------- */

    const [studentName, setStudentName] = useState("");
    const [callingCode, setCallingCode] = useState("91");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [alternatePhone, setAlternatePhone] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [machineCode, setMachineCode] = useState("");
    const [password, setPassword] = useState("");
    const [studentPhoto, setStudentPhoto] = useState("");
    const [highestEducation, setHighestEducation] = useState("");
    const [highestEducationInstitute, setHighestEducationInstitute] = useState("");

    const [currentAddress, setCurrentAddress] = useState<AddressForm>(emptyAddress);
    const [permanentAddress, setPermanentAddress] = useState<AddressForm>(emptyAddress);
    const [sameAsCurrent, setSameAsCurrent] = useState(false);

    const [parentName, setParentName] = useState("");
    const [parentRelation, setParentRelation] = useState("");
    const [parentCallingCode, setParentCallingCode] = useState("91");
    const [parentPhoneNumber, setParentPhoneNumber] = useState("");
    const [parentEmail, setParentEmail] = useState("");

    const [educationDocumentUrl, setEducationDocumentUrl] = useState("");

    const [adhaarNumber, setAdhaarNumber] = useState("");
    const [adhaarName, setAdhaarName] = useState("");
    const [adhaarGender, setAdhaarGender] = useState("");
    const [adhaarDob, setAdhaarDob] = useState("");
    const [adhaarAddress, setAdhaarAddress] = useState("");
    const [adhaarFrontImageUrl, setAdhaarFrontImageUrl] = useState("");
    const [adhaarBackImageUrl, setAdhaarBackImageUrl] = useState("");

    const [purchasedAt, setPurchasedAt] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [paidAmount, setPaidAmount] = useState<number | "">("");
    const [emiEnabled, setEmiEnabled] = useState(false);
    const [installments, setInstallments] = useState<number | "">(1);
    const [packageIds, setPackageIds] = useState<string[]>([]);
    const [courseIds, setCourseIds] = useState<string[]>([]);

    const [uploadingKey, setUploadingKey] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const selectionPrefilled = useRef(false);

    /* ------------------------ prefill from onboarding ------------------- */

    useEffect(() => {
        if (!open) return;
        selectionPrefilled.current = false;

        setStudentName(onboarding.fullName ?? "");
        setCallingCode(onboarding.countryCode?.replace("+", "") || "91");
        setPhoneNumber(onboarding.phoneNumber ?? "");
        setAlternatePhone(onboarding.alternateContactNumber ?? "");
        setEmail(onboarding.email ?? "");
        setGender(onboarding.gender ? onboarding.gender.replace(/^./, (c) => c.toUpperCase()) : "");
        setDateOfBirth(toDateInput(onboarding.dateOfBirth));
        setRegistrationNumber(onboarding.formNumber ?? "");
        setMachineCode("");
        setPassword("");
        setStudentPhoto(onboarding.photoURL ?? "");
        setHighestEducation(onboarding.highestEducationLevel ?? "");
        setHighestEducationInstitute(onboarding.institutionName ?? "");

        setCurrentAddress({
            addressLine: [onboarding.currentStreetAddress, onboarding.currentAptSuite].filter(Boolean).join(", "),
            city: onboarding.currentCity ?? "",
            state: onboarding.currentState ?? "",
            country: "India",
            postalCode: onboarding.currentZipCode ?? "",
            mapUrl: asText(onboarding.currentGoogleMapRef),
        });
        setPermanentAddress({
            addressLine: [onboarding.permanentStreetAddress, onboarding.permanentAptSuite].filter(Boolean).join(", "),
            city: onboarding.permanentCity ?? "",
            state: onboarding.permanentState ?? "",
            country: "India",
            postalCode: onboarding.permanentZipCode ?? "",
            mapUrl: asText(onboarding.permanentGoogleMapRef),
        });
        setSameAsCurrent(false);

        setParentName(onboarding.parentName ?? "");
        setParentRelation(onboarding.relationWithParent ? onboarding.relationWithParent.replace(/^./, (c) => c.toUpperCase()) : "");
        setParentCallingCode(onboarding.parentCountryCode?.replace("+", "") || "91");
        setParentPhoneNumber(onboarding.parentContactNumber ?? "");
        setParentEmail(onboarding.parentEmail ?? "");

        setEducationDocumentUrl(onboarding.submittedDocument ?? "");

        setAdhaarNumber(onboarding.adhaarNumber ?? "");
        setAdhaarName(adhaarJson?.name ?? onboarding.fullName ?? "");
        setAdhaarGender(adhaarJson?.gender ?? "");
        setAdhaarDob(toDateInput(adhaarJson?.date_of_birth ?? onboarding.dateOfBirth));
        setAdhaarAddress(adhaarJson?.full_address ?? "");
        setAdhaarFrontImageUrl(onboarding.adhaarCardFrontImageURL ?? "");
        setAdhaarBackImageUrl(onboarding.adhaarCardBackImageURL ?? "");

        setPurchasedAt(toDateInput(onboarding.createdAt));
        setAmount(onboarding.finalPayableAmount ?? "");
        setPaidAmount(collected || (onboarding.amountToBePaid ?? ""));
        setEmiEnabled((onboarding.noOfInstallments ?? 0) > 1);
        setInstallments(onboarding.noOfInstallments && onboarding.noOfInstallments > 0 ? onboarding.noOfInstallments : 1);
        setPackageIds([]);
        setCourseIds([]);
    }, [open, onboarding, adhaarJson, collected]);

    useEffect(() => {
        if (!open) return;
        if (!packages.length) void getPackages();
        if (!courses.length) void getCourses();
    }, [open, packages.length, courses.length, getPackages, getCourses]);

    const packageOptions = useMemo(
        () => packages.map((p) => ({ id: p.packageId, label: p.packageName, hint: p.price ? `₹${p.price}` : undefined })),
        [packages],
    );
    const courseOptions = useMemo(
        () => courses.map((c) => ({ id: c.courseId, label: c.courseName, hint: c.price ? `₹${c.price}` : undefined })),
        [courses],
    );

    useEffect(() => {
        if (!open || selectionPrefilled.current) return;
        if (!packageOptions.length && !courseOptions.length) return;
        setPackageIds(pickExistingIds(onboarding.packagesSelected, packageOptions));
        setCourseIds(pickExistingIds(onboarding.coursesSelected, courseOptions));
        selectionPrefilled.current = true;
    }, [open, onboarding, packageOptions, courseOptions]);

    /* ------------------------------ uploads ----------------------------- */

    const pickFile = useCallback(
        (key: string, apply: (url: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploadingKey(key);
            fileUploaderToS3(file, () => { }, (fileUrl) => {
                apply(fileUrl);
                toast.success("File uploaded");
            }).finally(() => setUploadingKey(null));
            event.target.value = "";
        },
        [],
    );

    /* ------------------------------- submit ----------------------------- */

    const handleSubmit = async () => {
        if (!studentName.trim()) return toast.error("Student name is required");
        if (!phoneNumber.trim()) return toast.error("Phone number is required");

        const purchaseAmount = amount === "" ? 0 : amount;
        const purchasePaid = paidAmount === "" ? 0 : paidAmount;
        if (purchasePaid > purchaseAmount) return toast.error("Paid amount cannot exceed the purchase amount");
        if (emiEnabled && (installments === "" || installments < 1)) return toast.error("Installments must be at least 1");

        const permanent = sameAsCurrent ? currentAddress : permanentAddress;

        const addresses: CreateStudentInput["addresses"] = [];
        if (hasAddressData(currentAddress)) addresses.push({ addressType: "CURRENT", ...currentAddress });
        if (hasAddressData(permanent)) addresses.push({ addressType: "PERMANENT", ...permanent });

        const payload: CreateStudentInput = {
            studentName: studentName.trim(),
            callingCode: callingCode || "91",
            phoneNumber: phoneNumber.trim(),
            dateOfBirth: dateOfBirth || undefined,
            gender: gender || undefined,
            email: email.trim() || undefined,
            studentRegistrationNumber: registrationNumber.trim() || undefined,
            studentPhoto: studentPhoto || undefined,
            studentAlternatePhoneNumber: alternatePhone.trim() || undefined,
            machineCode: machineCode.trim() || undefined,
            password: password.trim() || undefined,
            isActive: true,
            highestEducation: highestEducation.trim() || undefined,
            highestEducationInstitute: highestEducationInstitute.trim() || undefined,
            onboardingRefId: onboarding.onboardingId,
            addresses,
            parentDetails: parentName.trim()
                ? [{
                    parentName: parentName.trim(),
                    parentRelation: parentRelation || undefined,
                    parentCallingCode: parentCallingCode || "91",
                    parentPhoneNumber: parentPhoneNumber.trim() || undefined,
                    parentEmail: parentEmail.trim() || undefined,
                }]
                : [],
            documents: educationDocumentUrl
                ? [{
                    documentName: EDUCATION_DOCUMENT_NAME,
                    documentUrl: educationDocumentUrl,
                    documentType: "Education",
                    isVerified: onboarding.isDocumentsVerified,
                }]
                : [],
            adhaarData: adhaarNumber || adhaarFrontImageUrl || adhaarBackImageUrl
                ? {
                    adhaarNumber: adhaarNumber.trim() || undefined,
                    adhaarName: adhaarName.trim() || undefined,
                    adhaarGender: adhaarGender || undefined,
                    adhaarDob: adhaarDob || undefined,
                    adhaarAddress: adhaarAddress.trim() || undefined,
                    adhaarFrontImageUrl: adhaarFrontImageUrl || undefined,
                    adhaarBackImageUrl: adhaarBackImageUrl || undefined,
                    referenceData: onboarding.adhaarJsonData || undefined,
                    isVerified: onboarding.isAdhaarVerified,
                    isManuallyAdded: !onboarding.isAdhaarVerified,
                }
                : undefined,
            purchase: purchaseAmount > 0
                ? {
                    purchasedAt: purchasedAt || undefined,
                    amount: purchaseAmount,
                    currentPaidAmount: purchasePaid,
                    isEMIEnabled: emiEnabled,
                    numberOfInstallments: emiEnabled ? Number(installments) : 1,
                    packageIds,
                    courseIds,
                }
                : undefined,
        };

        setSaving(true);
        const res = await createStudent(payload);
        setSaving(false);

        if (!res.success || !res.data) {
            toast.error(res.message ?? "Failed to create student");
            return;
        }
        toast.success("Student profile created");
        onCreated(res.data.studentId);
        onClose();
    };

    /* ------------------------------- render ----------------------------- */

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="md"
            slotProps={{ paper: { sx: { borderRadius: "10px", border: `1px solid ${BRAND.primary}` } } }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`,
                    color: "#fff", py: 1.25, px: 2,
                }}
            >
                <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2">
                        <UserPlus size={16} />
                        <Typography className="text-sm font-bold">Create student profile</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} disabled={saving} sx={{ color: "#fff" }}>
                        <X size={16} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 2, pt: "16px !important", bgcolor: "#f9fafb" }}>
                <div className="flex flex-col gap-2">
                    <Section title="Student details" icon={<User size={12} />} color={BRAND.primary} bg={BRAND.skyBg}>
                        <AppTextField label="Full name" required value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                        <AppTextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <PhoneField label="Phone" codeValue={callingCode} numberValue={phoneNumber} onCodeChange={setCallingCode} onNumberChange={setPhoneNumber} />
                        <AppTextField label="Alternate phone" value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} />
                        <AppSelect label="Gender" value={gender} onChange={setGender} options={GENDER_OPTIONS} />
                        <AppDateField label="Date of birth" value={dateOfBirth} onChange={setDateOfBirth} />
                        <AppTextField label="Registration number" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
                        <AppTextField label="Biometric machine code" value={machineCode} onChange={(e) => setMachineCode(e.target.value)} />
                        <AppTextField label="Login password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} helperText="Optional — student can set it later" />
                        <FileField
                            label="Student photo"
                            value={studentPhoto}
                            uploading={uploadingKey === "photo"}
                            onPick={pickFile("photo", setStudentPhoto)}
                            accept="image/*"
                        />
                    </Section>

                    <Section title="Education" icon={<GraduationCap size={12} />} color={BRAND.amber} bg={BRAND.amberBg}>
                        <AppTextField label="Highest education" value={highestEducation} onChange={(e) => setHighestEducation(e.target.value)} />
                        <AppTextField label="Institute" value={highestEducationInstitute} onChange={(e) => setHighestEducationInstitute(e.target.value)} />
                        <div className="sm:col-span-2">
                            <FileField
                                label={EDUCATION_DOCUMENT_NAME}
                                value={educationDocumentUrl}
                                uploading={uploadingKey === "education"}
                                onPick={pickFile("education", setEducationDocumentUrl)}
                                accept="image/*,application/pdf"
                            />
                        </div>
                    </Section>

                    <Section title="Current address" icon={<MapPin size={12} />} color={BRAND.emerald} bg={BRAND.emeraldBg}>
                        <AddressFields value={currentAddress} onChange={setCurrentAddress} />
                    </Section>

                    <Section
                        title="Permanent address"
                        icon={<MapPin size={12} />}
                        color={BRAND.violet}
                        bg={BRAND.violetBg}
                        action={
                            <FormControlLabel
                                control={<Switch size="small" checked={sameAsCurrent} onChange={(e) => setSameAsCurrent(e.target.checked)} />}
                                label={<span className="text-[11px] text-gray-600">Same as current</span>}
                                sx={{ mr: 0 }}
                            />
                        }
                    >
                        {sameAsCurrent
                            ? <p className="text-xs text-gray-500 sm:col-span-2">Permanent address will be saved as a copy of the current address.</p>
                            : <AddressFields value={permanentAddress} onChange={setPermanentAddress} />}
                    </Section>

                    <Section title="Parent / Guardian" icon={<Users size={12} />} color={BRAND.cyan} bg={BRAND.cyanBg}>
                        <AppTextField label="Parent name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                        <AppSelect label="Relation" value={parentRelation} onChange={setParentRelation} options={RELATION_OPTIONS} />
                        <PhoneField label="Parent phone" codeValue={parentCallingCode} numberValue={parentPhoneNumber} onCodeChange={setParentCallingCode} onNumberChange={setParentPhoneNumber} />
                        <AppTextField label="Parent email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
                    </Section>

                    <Section title="Aadhaar details" icon={<IdCard size={12} />} color={BRAND.rose} bg={BRAND.roseBg}>
                        <AppTextField label="Aadhaar number" value={adhaarNumber} onChange={(e) => setAdhaarNumber(e.target.value)} />
                        <AppTextField label="Name on Aadhaar" value={adhaarName} onChange={(e) => setAdhaarName(e.target.value)} />
                        <AppSelect label="Gender on Aadhaar" value={adhaarGender} onChange={setAdhaarGender} options={GENDER_OPTIONS} />
                        <AppDateField label="Date of birth on Aadhaar" value={adhaarDob} onChange={setAdhaarDob} />
                        <AppTextField label="Address on Aadhaar" multiline minRows={2} className="sm:col-span-2" value={adhaarAddress} onChange={(e) => setAdhaarAddress(e.target.value)} />
                        <FileField
                            label="Aadhaar front"
                            value={adhaarFrontImageUrl}
                            uploading={uploadingKey === "adhaarFront"}
                            onPick={pickFile("adhaarFront", setAdhaarFrontImageUrl)}
                            accept="image/*,application/pdf"
                        />
                        <FileField
                            label="Aadhaar back"
                            value={adhaarBackImageUrl}
                            uploading={uploadingKey === "adhaarBack"}
                            onPick={pickFile("adhaarBack", setAdhaarBackImageUrl)}
                            accept="image/*,application/pdf"
                        />
                    </Section>

                    <Section
                        title="Purchase"
                        icon={<CreditCard size={12} />}
                        color={BRAND.orange}
                        bg={BRAND.orangeBg}
                        action={
                            <FormControlLabel
                                control={<Switch size="small" checked={emiEnabled} onChange={(e) => setEmiEnabled(e.target.checked)} />}
                                label={<span className="text-[11px] text-gray-600">EMI</span>}
                                sx={{ mr: 0 }}
                            />
                        }
                    >
                        <AppDateField label="Purchase date" value={purchasedAt} onChange={setPurchasedAt} />
                        <AppNumberField label="Total amount" value={amount} onChange={setAmount} />
                        <AppNumberField label="Amount already paid" value={paidAmount} onChange={setPaidAmount} />
                        <AppNumberField label="Number of installments" value={emiEnabled ? installments : 1} onChange={setInstallments} min={1} />
                        <div className="sm:col-span-2">
                            <AppMultiSelect label="Packages" values={packageIds} onChange={setPackageIds} options={packageOptions} color={BRAND.violet} />
                        </div>
                        <div className="sm:col-span-2">
                            <AppMultiSelect label="Courses" values={courseIds} onChange={setCourseIds} options={courseOptions} color={BRAND.emerald} />
                        </div>
                        <p className="text-[11px] text-gray-500 sm:col-span-2">
                            Package and course access is granted automatically once the purchase is saved.
                        </p>
                    </Section>
                </div>
            </DialogContent>

            <DialogActions sx={{ px: 2, py: 1.5, borderTop: "1px solid #e5e7eb" }}>
                <Button onClick={onClose} disabled={saving} size="small" sx={{ textTransform: "none", color: "#6b7280" }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={saving || !!uploadingKey}
                    size="small"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <UserPlus size={13} />}
                    sx={{
                        textTransform: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.75rem",
                        bgcolor: BRAND.primary, "&:hover": { bgcolor: BRAND.primaryHover },
                    }}
                >
                    Create profile
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ================================================================ */
/* Local building blocks                                            */
/* ================================================================ */

function Section({
    title, icon, color, bg, action, children,
}: {
    title: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Surface accent={color} className="p-3">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
                        {icon}
                    </span>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-700">{title}</h4>
                </div>
                {action}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
        </Surface>
    );
}

function AddressFields({ value, onChange }: { value: AddressForm; onChange: (v: AddressForm) => void }) {
    const set = (key: keyof AddressForm) => (v: string) => onChange({ ...value, [key]: v });
    return (
        <>
            <AppTextField label="Address line" className="sm:col-span-2" value={value.addressLine} onChange={(e) => set("addressLine")(e.target.value)} />
            <AppTextField label="City" value={value.city} onChange={(e) => set("city")(e.target.value)} />
            <AppTextField label="State" value={value.state} onChange={(e) => set("state")(e.target.value)} />
            <AppTextField label="Country" value={value.country} onChange={(e) => set("country")(e.target.value)} />
            <AppTextField label="Postal code" value={value.postalCode} onChange={(e) => set("postalCode")(e.target.value)} />
            <AppTextField label="Map URL" className="sm:col-span-2" value={value.mapUrl} onChange={(e) => set("mapUrl")(e.target.value)} />
        </>
    );
}
