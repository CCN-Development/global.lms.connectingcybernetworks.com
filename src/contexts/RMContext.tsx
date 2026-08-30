"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axiosHandler from "@/lib/enhanced-axios";
import { StandardResponse } from "./AuthContext";
import type {
    LMSStudentData,
    ParentDetails,
    StudentAddress,
    StudentDocument,
    StudentAdhaarData,
    StudentCourseAccessWithCourse,
    StudentPackagesAccessDetail,
    StudentPackagesAccessWithPackage,
    StudentPurchaseDetail,
    PackageInPurchase,
    CourseInPurchase,
    StudentPayment,
} from "./StudentContext";

/* ------------------------------------------------------------------ */
/* Input types (mirroring rm.controller)                               */
/* ------------------------------------------------------------------ */

export interface UpdateStudentInput {
    studentName?: string;
    callingCode?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    studentRegistrationNumber?: string;
    studentPhoto?: string;
    studentAlternatePhoneNumber?: string;
    isActive?: boolean;
    highestEducation?: string;
    highestEducationInstitute?: string;
    machineCode?: string;
}

export interface CreateStudentInput extends UpdateStudentInput {
    studentName: string;
    phoneNumber: string;
    /** Defaults to the authenticated RM's branch when omitted. */
    branchId?: string;
    password?: string;
    onboardingRefId?: string;
    parentDetails?: AddParentInput[];
    addresses?: AddAddressInput[];
    documents?: CreateStudentDocumentInput[];
    adhaarData?: UpdateAdhaarInput;
    purchase?: AddPurchaseInput;
}

export interface AddParentInput {
    parentName: string;
    parentEmail?: string;
    parentCallingCode?: string;
    parentPhoneNumber?: string;
    parentRelation?: string;
}

export type UpdateParentInput = Partial<AddParentInput>;

export interface AddAddressInput {
    addressType?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    mapUrl?: string;
}

export type UpdateAddressInput = Partial<AddAddressInput>;

export interface AddDocumentInput {
    documentName: string;
    documentUrl: string;
    documentType: string;
}

export interface UpdateDocumentInput {
    documentName?: string;
    documentUrl?: string;
    documentType?: string;
    isVerified?: boolean;
}

export type CreateStudentDocumentInput = AddDocumentInput & { isVerified?: boolean };

export interface AddAdhaarInput {
    adhaarNumber?: string;
    adhaarName?: string;
    adhaarGender?: string;
    adhaarDob?: string;
    adhaarAddress?: string;
    adhaarFrontImageUrl?: string;
    adhaarBackImageUrl?: string;
    referenceData?: string;
    isManuallyAdded?: boolean;
}

export type UpdateAdhaarInput = AddAdhaarInput & { isVerified?: boolean };

export interface AddPackageAccessInput {
    packageId: string;
    expiresAt?: string | null;
    isActive?: boolean;
}

export interface UpdatePackageAccessInput {
    expiresAt?: string | null;
    isActive?: boolean;
}

export interface AddCourseAccessInput {
    courseId: string;
    expiresAt?: string | null;
    isActive?: boolean;
}

export interface UpdateCourseAccessInput {
    expiresAt?: string | null;
    isActive?: boolean;
}

export interface AddPurchaseInput {
    purchasedAt?: string;
    amount?: number;
    currentPaidAmount?: number;
    isAllPaymentsDone?: boolean;
    isEMIEnabled?: boolean;
    numberOfInstallments?: number;
    packageIds?: string[];
    courseIds?: string[];
}

export type UpdatePurchaseInput = Omit<AddPurchaseInput, "packageIds" | "courseIds">;


export interface OnboardingCollectionData {
    onboardingCollectionsDataId: string;
    onboardingId: string;
    phoneNumber: string;
    paidAmount: number;
    paymentMode: string;
    date: string;
    extraData: unknown;
    comment: unknown;
    paymentImageProofs: string[];
    isVerified: boolean;
    verifiedBy: unknown;
    createdAt: string;
    updatedAt: string;
}

export interface OnboardingFile {
    fileId: string;
    onboardingId: string;
    fileName: string;
    fileType: string;
    fileURL: string;
    fileCategory: string;
    fileSize: number;
    createdAt: string;
    updatedAt: string;
}



/*
following will be the json stringified data of adhaar card which will be stored in adhaarJsonData field of OnboardingListItem
{
            "@entity": string;
            reference_id: number;
            status: string;
            message: string;
            care_of: string;
            full_address: string;
            date_of_birth: string;
            email_hash: string;
            gender: string;
            name: string;
            address: {
                "@entity": string;
                country: string;
                district: string;
                house: string;
                landmark: string;
                pincode: number;
                post_office: string;
                state: string;
                street: string;
                subdistrict: string;
                vtc: string;
            };
            year_of_birth: number;
            mobile_hash: string;
            photo: string;
            share_code: string;
        }


        */

export interface OnboardingListItem {
    onboardingId: string;
    phoneNumber: string;
    isWhatsappContact: boolean;
    countryCode: string;
    photoURL?: string;
    fullName?: string;
    email?: string;
    gender?: string;
    dateOfBirth?: string;
    alternateContactNumber?: string;
    currentStreetAddress?: string;
    currentAptSuite?: string;
    currentCity?: string;
    currentState?: string;
    currentZipCode?: string;
    currentGoogleMapRef: unknown;
    permanentStreetAddress?: string;
    permanentAptSuite?: string;
    permanentCity?: string;
    permanentState?: string;
    permanentZipCode?: string;
    permanentGoogleMapRef: unknown;
    lattitude: unknown;
    longitude: unknown;
    parentName?: string;
    parentCountryCode?: string;
    parentContactNumber?: string;
    isParentPhoneVerified: boolean;
    relationWithParent?: string;
    parentEmail?: string;
    parentSignature: unknown;
    highestEducationLevel?: string;
    institutionName?: string;
    googleInstitutionReference: unknown;
    submittedDocument?: string;
    isDocumentsVerified: boolean;
    trainingOptionSelected: string;
    /** LMS package ids picked during onboarding. */
    packagesSelected: string[];
    /** LMS course ids picked during onboarding. */
    coursesSelected: string[];
    benefitsSelected: unknown[];
    preferredLearningMode?: string;
    selectedBranch?: string;
    discountCode: unknown;
    paymentPreferenceSelection?: string;
    finalPayableAmount: number;
    paymentMode?: string;
    noOfInstallments?: number;
    installmentAmounts: unknown[];
    amountToBePaid: number;
    isPaymentCompleted: boolean;
    transactionId?: string;
    adhaarNumber?: string;
    adhaarJsonData?: string;
    isAdhaarVerified: boolean;
    adhaarVerificationReferenceId?: string;
    adhaarVerificationAttempts: number;
    isOnboarded: boolean;
    currentStep: string;
    createdAt: string;
    updatedAt: string;
    studentReferrerId: unknown;
    formNumber: string;
    isOldStudent: boolean;
    paymentReciept: unknown;
    ApplicationPDF: unknown;
    adhaarCardFrontImageURL?: string;
    adhaarCardBackImageURL?: string;
    frontOCRText?: string;
    backOCRText?: string;
    isConversionFound: boolean;
    isOldData: boolean;
    courseReference: unknown;
    packageReference: unknown;
    isDroppedOut: boolean;
    isPlaced: boolean;
    onboardingCollectionsDatas: OnboardingCollectionData[];
    files: OnboardingFile[];
    // appended by backend
    isApproved: boolean;
    studentId: string | null;
}

export interface OnboardingDetail extends Omit<OnboardingListItem, "files"> {
    files: OnboardingFile[];
    approvedStudentData: LMSStudentData | null;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface OnboardingsListResult {
    data: OnboardingListItem[];
    meta: PaginationMeta;
}

export interface GetOnboardingsParams {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export type GetStudentsParams = GetOnboardingsParams;

export interface StudentsListResult {
    data: LMSStudentData[];
    meta: PaginationMeta;
}

/** `GET /rm/dashboard/stats` — branch-scoped counters */
export interface RMDashboardStats {
    students: {
        total: number;
        active: number;
        inactive: number;
        dropped: number;
    };
    batches: {
        total: number;
        active: number;
        inactive: number;
        upcoming: number;
        ongoing: number;
        completed: number;
    };
}

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface RMContextValue {
    onboardings: OnboardingListItem[];
    meta: PaginationMeta | null;
    students: LMSStudentData[];
    studentsMeta: PaginationMeta | null;
    dashboardStats: RMDashboardStats | null;
    loadingList: boolean;
    loadingDetail: boolean;
    loadingStudents: boolean;
    loadingDashboardStats: boolean;
    getDashboardStats: () => Promise<StandardResponse<RMDashboardStats>>;
    getOnboardings: (params?: GetOnboardingsParams) => Promise<StandardResponse<OnboardingsListResult>>;
    getOnboardingById: (onboardingId: string) => Promise<StandardResponse<OnboardingDetail>>;
    getAllStudentsForBranch: (params?: GetStudentsParams) => Promise<StandardResponse<StudentsListResult>>;
    getStudent: (studentId: string) => Promise<StandardResponse<LMSStudentData>>;
    createStudent: (data: CreateStudentInput) => Promise<StandardResponse<LMSStudentData>>;
    updateStudent: (studentId: string, data: UpdateStudentInput) => Promise<StandardResponse<LMSStudentData>>;
    addParentDetails: (studentId: string, data: AddParentInput) => Promise<StandardResponse<ParentDetails>>;
    updateParentDetails: (studentId: string, parentId: string, data: UpdateParentInput) => Promise<StandardResponse<ParentDetails>>;
    removeParentDetails: (studentId: string, parentId: string) => Promise<StandardResponse<null>>;
    addStudentAddress: (studentId: string, data: AddAddressInput) => Promise<StandardResponse<StudentAddress>>;
    updateStudentAddress: (studentId: string, addressId: string, data: UpdateAddressInput) => Promise<StandardResponse<StudentAddress>>;
    removeStudentAddress: (studentId: string, addressId: string) => Promise<StandardResponse<null>>;
    addStudentDocument: (studentId: string, data: AddDocumentInput) => Promise<StandardResponse<StudentDocument>>;
    updateStudentDocument: (studentId: string, documentId: string, data: UpdateDocumentInput) => Promise<StandardResponse<StudentDocument>>;
    removeStudentDocument: (studentId: string, documentId: string) => Promise<StandardResponse<null>>;
    addStudentAdhaarData: (studentId: string, data: AddAdhaarInput) => Promise<StandardResponse<StudentAdhaarData>>;
    updateStudentAdhaarData: (studentId: string, adhaarId: string, data: UpdateAdhaarInput) => Promise<StandardResponse<StudentAdhaarData>>;
    removeStudentAdhaarData: (studentId: string, adhaarId: string) => Promise<StandardResponse<null>>;
    getStudentPackageAccesses: (studentId: string) => Promise<StandardResponse<StudentPackagesAccessDetail[]>>;
    addStudentPackageAccess: (studentId: string, data: AddPackageAccessInput) => Promise<StandardResponse<StudentPackagesAccessWithPackage>>;
    updateStudentPackageAccess: (studentId: string, packageId: string, data: UpdatePackageAccessInput) => Promise<StandardResponse<StudentPackagesAccessWithPackage>>;
    removeStudentPackageAccess: (studentId: string, packageId: string) => Promise<StandardResponse<null>>;
    getStudentCourseAccesses: (studentId: string) => Promise<StandardResponse<StudentCourseAccessWithCourse[]>>;
    addStudentCourseAccess: (studentId: string, data: AddCourseAccessInput) => Promise<StandardResponse<StudentCourseAccessWithCourse>>;
    updateStudentCourseAccess: (studentId: string, courseId: string, data: UpdateCourseAccessInput) => Promise<StandardResponse<StudentCourseAccessWithCourse>>;
    removeStudentCourseAccess: (studentId: string, courseId: string) => Promise<StandardResponse<null>>;
    getStudentPurchases: (studentId: string) => Promise<StandardResponse<StudentPurchaseDetail[]>>;
    addStudentPurchase: (studentId: string, data: AddPurchaseInput) => Promise<StandardResponse<StudentPurchaseDetail>>;
    updateStudentPurchase: (purchaseId: string, data: UpdatePurchaseInput) => Promise<StandardResponse<StudentPurchaseDetail>>;
    removeStudentPurchase: (purchaseId: string) => Promise<StandardResponse<null>>;
    addPackageInPurchase: (purchaseId: string, packageId: string) => Promise<StandardResponse<PackageInPurchase>>;
    removePackageFromPurchase: (purchaseId: string, packageId: string) => Promise<StandardResponse<null>>;
    addCourseInPurchase: (purchaseId: string, courseId: string) => Promise<StandardResponse<CourseInPurchase>>;
    removeCourseFromPurchase: (purchaseId: string, courseId: string) => Promise<StandardResponse<null>>;
    getStudentPayments: (studentId: string) => Promise<StandardResponse<StudentPayment[]>>;
}

const RMContext = createContext<RMContextValue | null>(null);

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function RMProvider({ children }: { children: ReactNode }) {
    const [onboardings, setOnboardings] = useState<OnboardingListItem[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [students, setStudents] = useState<LMSStudentData[]>([]);
    const [studentsMeta, setStudentsMeta] = useState<PaginationMeta | null>(null);
    const [dashboardStats, setDashboardStats] = useState<RMDashboardStats | null>(null);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingDashboardStats, setLoadingDashboardStats] = useState(false);

    const getDashboardStats = useCallback(async (): Promise<StandardResponse<RMDashboardStats>> => {
        setLoadingDashboardStats(true);
        try {
            const res = await axiosHandler({ path: "/api/v1/rm/dashboard/stats", method: "GET" }) as RMDashboardStats;
            setDashboardStats(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch dashboard stats"), data: null };
        } finally {
            setLoadingDashboardStats(false);
        }
    }, []);

    const getOnboardings = useCallback(async (params: GetOnboardingsParams = {}): Promise<StandardResponse<OnboardingsListResult>> => {
        setLoadingList(true);
        try {
            const res = await axiosHandler({
                path: "/api/v1/rm/onboardings/all",
                method: "GET",
                params,
            }) as OnboardingsListResult;
            setOnboardings(res.data);
            setMeta(res.meta);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to fetch onboardings";
            return { success: false, message: msg, data: null };
        } finally {
            setLoadingList(false);
        }
    }, []);

    const getOnboardingById = useCallback(async (onboardingId: string): Promise<StandardResponse<OnboardingDetail>> => {
        setLoadingDetail(true);
        try {
            const res = await axiosHandler({
                path: `/api/v1/rm/onboardings/${onboardingId}`,
                method: "GET",
            }) as OnboardingDetail;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to fetch onboarding";
            return { success: false, message: msg, data: null };
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    const getAllStudentsForBranch = useCallback(async (params: GetStudentsParams = {}): Promise<StandardResponse<StudentsListResult>> => {
        setLoadingStudents(true);
        try {
            const res = await axiosHandler({ path: "/api/v1/rm/all-students/branch", method: "GET", params }) as StudentsListResult;
            setStudents(res.data);
            setStudentsMeta(res.meta);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to fetch students";
            return { success: false, message: msg, data: null };
        } finally {
            setLoadingStudents(false);
        }
    }, []);

    const getStudent = useCallback(async (studentId: string): Promise<StandardResponse<LMSStudentData>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/profile`, method: "GET" }) as LMSStudentData;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to fetch student";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const createStudent = useCallback(async (data: CreateStudentInput): Promise<StandardResponse<LMSStudentData>> => {
        try {
            const res = await axiosHandler({ path: "/api/v1/rm/students/create", method: "POST", body: data }) as LMSStudentData;
            return { success: true, message: "Student created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create student"), data: null };
        }
    }, []);

    const updateStudent = useCallback(async (studentId: string, data: UpdateStudentInput): Promise<StandardResponse<LMSStudentData>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/update`, method: "POST", body: data }) as LMSStudentData;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to update student";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const addParentDetails = useCallback(async (studentId: string, data: AddParentInput): Promise<StandardResponse<ParentDetails>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/parents/add`, method: "POST", body: data }) as ParentDetails;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to add parent details";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const updateParentDetails = useCallback(async (studentId: string, parentId: string, data: UpdateParentInput): Promise<StandardResponse<ParentDetails>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/parents/${parentId}/update`, method: "POST", body: data }) as ParentDetails;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to update parent details";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const removeParentDetails = useCallback(async (studentId: string, parentId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/students/${studentId}/parents/${parentId}/remove`, method: "POST" });
            return { success: true, message: null, data: null };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to remove parent details";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const addStudentAddress = useCallback(async (studentId: string, data: AddAddressInput): Promise<StandardResponse<StudentAddress>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/addresses/add`, method: "POST", body: data }) as StudentAddress;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to add address";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const updateStudentAddress = useCallback(async (studentId: string, addressId: string, data: UpdateAddressInput): Promise<StandardResponse<StudentAddress>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/addresses/${addressId}/update`, method: "POST", body: data }) as StudentAddress;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to update address";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const removeStudentAddress = useCallback(async (studentId: string, addressId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/students/${studentId}/addresses/${addressId}/remove`, method: "POST" });
            return { success: true, message: null, data: null };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to remove address";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const addStudentDocument = useCallback(async (studentId: string, data: AddDocumentInput): Promise<StandardResponse<StudentDocument>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/documents/add`, method: "POST", body: data }) as StudentDocument;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to add document";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const updateStudentDocument = useCallback(async (studentId: string, documentId: string, data: UpdateDocumentInput): Promise<StandardResponse<StudentDocument>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/documents/${documentId}/update`, method: "POST", body: data }) as StudentDocument;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to update document";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const removeStudentDocument = useCallback(async (studentId: string, documentId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/students/${studentId}/documents/${documentId}/remove`, method: "POST" });
            return { success: true, message: null, data: null };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to remove document";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const addStudentAdhaarData = useCallback(async (studentId: string, data: AddAdhaarInput): Promise<StandardResponse<StudentAdhaarData>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/adhaar/add`, method: "POST", body: data }) as StudentAdhaarData;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to add Adhaar data";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const updateStudentAdhaarData = useCallback(async (studentId: string, adhaarId: string, data: UpdateAdhaarInput): Promise<StandardResponse<StudentAdhaarData>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/adhaar/${adhaarId}/update`, method: "POST", body: data }) as StudentAdhaarData;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to update Adhaar data";
            return { success: false, message: msg, data: null };
        }
    }, []);

    const removeStudentAdhaarData = useCallback(async (studentId: string, adhaarId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/students/${studentId}/adhaar/${adhaarId}/remove`, method: "POST" });
            return { success: true, message: null, data: null };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to remove Adhaar data";
            return { success: false, message: msg, data: null };
        }
    }, []);

    /* --------------------- Package accesses ----------------------- */

    const getStudentPackageAccesses = useCallback(async (studentId: string): Promise<StandardResponse<StudentPackagesAccessDetail[]>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/package-accesses`, method: "GET" }) as StudentPackagesAccessDetail[];
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch package accesses"), data: null };
        }
    }, []);

    const addStudentPackageAccess = useCallback(async (studentId: string, data: AddPackageAccessInput): Promise<StandardResponse<StudentPackagesAccessWithPackage>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/package-accesses/add`, method: "POST", body: data }) as StudentPackagesAccessWithPackage;
            return { success: true, message: "Package access added successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add package access"), data: null };
        }
    }, []);

    const updateStudentPackageAccess = useCallback(async (studentId: string, packageId: string, data: UpdatePackageAccessInput): Promise<StandardResponse<StudentPackagesAccessWithPackage>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/package-accesses/${packageId}/update`, method: "POST", body: data }) as StudentPackagesAccessWithPackage;
            return { success: true, message: "Package access updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update package access"), data: null };
        }
    }, []);

    const removeStudentPackageAccess = useCallback(async (studentId: string, packageId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/students/${studentId}/package-accesses/${packageId}/remove`, method: "POST" });
            return { success: true, message: "Package access removed successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove package access"), data: null };
        }
    }, []);

    /* ---------------------- Course accesses ----------------------- */

    const getStudentCourseAccesses = useCallback(async (studentId: string): Promise<StandardResponse<StudentCourseAccessWithCourse[]>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/course-accesses`, method: "GET" }) as StudentCourseAccessWithCourse[];
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch course accesses"), data: null };
        }
    }, []);

    const addStudentCourseAccess = useCallback(async (studentId: string, data: AddCourseAccessInput): Promise<StandardResponse<StudentCourseAccessWithCourse>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/course-accesses/add`, method: "POST", body: data }) as StudentCourseAccessWithCourse;
            return { success: true, message: "Course access added successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add course access"), data: null };
        }
    }, []);

    const updateStudentCourseAccess = useCallback(async (studentId: string, courseId: string, data: UpdateCourseAccessInput): Promise<StandardResponse<StudentCourseAccessWithCourse>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/course-accesses/${courseId}/update`, method: "POST", body: data }) as StudentCourseAccessWithCourse;
            return { success: true, message: "Course access updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update course access"), data: null };
        }
    }, []);

    const removeStudentCourseAccess = useCallback(async (studentId: string, courseId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/students/${studentId}/course-accesses/${courseId}/remove`, method: "POST" });
            return { success: true, message: "Course access removed successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove course access"), data: null };
        }
    }, []);

    /* ------------------------- Purchases -------------------------- */

    const getStudentPurchases = useCallback(async (studentId: string): Promise<StandardResponse<StudentPurchaseDetail[]>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/purchases`, method: "GET" }) as StudentPurchaseDetail[];
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch purchases"), data: null };
        }
    }, []);

    const addStudentPurchase = useCallback(async (studentId: string, data: AddPurchaseInput): Promise<StandardResponse<StudentPurchaseDetail>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/purchases/add`, method: "POST", body: data }) as StudentPurchaseDetail;
            return { success: true, message: "Purchase added successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add purchase"), data: null };
        }
    }, []);

    const updateStudentPurchase = useCallback(async (purchaseId: string, data: UpdatePurchaseInput): Promise<StandardResponse<StudentPurchaseDetail>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/purchases/${purchaseId}/update`, method: "POST", body: data }) as StudentPurchaseDetail;
            return { success: true, message: "Purchase updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update purchase"), data: null };
        }
    }, []);

    const removeStudentPurchase = useCallback(async (purchaseId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/purchases/${purchaseId}/remove`, method: "POST" });
            return { success: true, message: "Purchase removed successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove purchase"), data: null };
        }
    }, []);

    const addPackageInPurchase = useCallback(async (purchaseId: string, packageId: string): Promise<StandardResponse<PackageInPurchase>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/purchases/${purchaseId}/packages/add`, method: "POST", body: { packageId } }) as PackageInPurchase;
            return { success: true, message: "Package added to purchase successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add package to purchase"), data: null };
        }
    }, []);

    const removePackageFromPurchase = useCallback(async (purchaseId: string, packageId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/purchases/${purchaseId}/packages/${packageId}/remove`, method: "POST" });
            return { success: true, message: "Package removed from purchase successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove package from purchase"), data: null };
        }
    }, []);

    const addCourseInPurchase = useCallback(async (purchaseId: string, courseId: string): Promise<StandardResponse<CourseInPurchase>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/purchases/${purchaseId}/courses/add`, method: "POST", body: { courseId } }) as CourseInPurchase;
            return { success: true, message: "Course added to purchase successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add course to purchase"), data: null };
        }
    }, []);

    const removeCourseFromPurchase = useCallback(async (purchaseId: string, courseId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `/api/v1/rm/purchases/${purchaseId}/courses/${courseId}/remove`, method: "POST" });
            return { success: true, message: "Course removed from purchase successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove course from purchase"), data: null };
        }
    }, []);

    /* -------------------------- Payments -------------------------- */

    const getStudentPayments = useCallback(async (studentId: string): Promise<StandardResponse<StudentPayment[]>> => {
        try {
            const res = await axiosHandler({ path: `/api/v1/rm/students/${studentId}/payments`, method: "GET" }) as StudentPayment[];
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch payments"), data: null };
        }
    }, []);

    const value = useMemo<RMContextValue>(() => ({
        onboardings,
        meta,
        students,
        studentsMeta,
        dashboardStats,
        loadingList,
        loadingDetail,
        loadingStudents,
        loadingDashboardStats,
        getDashboardStats,
        getOnboardings,
        getOnboardingById,
        getAllStudentsForBranch,
        getStudent,
        createStudent,
        updateStudent,
        addParentDetails,
        updateParentDetails,
        removeParentDetails,
        addStudentAddress,
        updateStudentAddress,
        removeStudentAddress,
        addStudentDocument,
        updateStudentDocument,
        removeStudentDocument,
        addStudentAdhaarData,
        updateStudentAdhaarData,
        removeStudentAdhaarData,
        getStudentPackageAccesses,
        addStudentPackageAccess,
        updateStudentPackageAccess,
        removeStudentPackageAccess,
        getStudentCourseAccesses,
        addStudentCourseAccess,
        updateStudentCourseAccess,
        removeStudentCourseAccess,
        getStudentPurchases,
        addStudentPurchase,
        updateStudentPurchase,
        removeStudentPurchase,
        addPackageInPurchase,
        removePackageFromPurchase,
        addCourseInPurchase,
        removeCourseFromPurchase,
        getStudentPayments,
    }), [
        onboardings, meta, students, studentsMeta,
        loadingList, loadingDetail, loadingStudents,
        dashboardStats, loadingDashboardStats, getDashboardStats,
        getOnboardings, getOnboardingById,
        getAllStudentsForBranch, getStudent, createStudent, updateStudent,
        addParentDetails, updateParentDetails, removeParentDetails,
        addStudentAddress, updateStudentAddress, removeStudentAddress,
        addStudentDocument, updateStudentDocument, removeStudentDocument,
        addStudentAdhaarData, updateStudentAdhaarData, removeStudentAdhaarData,
        getStudentPackageAccesses, addStudentPackageAccess, updateStudentPackageAccess, removeStudentPackageAccess,
        getStudentCourseAccesses, addStudentCourseAccess, updateStudentCourseAccess, removeStudentCourseAccess,
        getStudentPurchases, addStudentPurchase, updateStudentPurchase, removeStudentPurchase,
        addPackageInPurchase, removePackageFromPurchase,
        addCourseInPurchase, removeCourseFromPurchase,
        getStudentPayments,
    ]);

    return <RMContext.Provider value={value}>{children}</RMContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useRM(): RMContextValue {
    const ctx = useContext(RMContext);
    if (!ctx) throw new Error("useRM must be used inside <RMProvider>");
    return ctx;
}
