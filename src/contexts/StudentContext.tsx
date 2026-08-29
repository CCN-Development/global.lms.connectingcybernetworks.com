"use client";

import { createContext, useContext } from "react";
import type { Benefit, Course, PackageBase } from "./ContentContext";

/* ------------------------------------------------------------------ */
/* Prisma-derived types — mirror student.prisma + erp.prisma           */
/* ------------------------------------------------------------------ */

export interface ParentDetails {
    parentId: string;
    studentId: string;
    parentName: string;
    parentEmail: string | null;
    parentCallingCode: string;
    parentPhoneNumber: string | null;
    parentRelation: string | null;
}

export interface StudentAddress {
    addressId: string;
    studentId: string;
    addressType: string | null;
    addressLine: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    latitude: number | null;
    longitude: number | null;
    mapUrl: string | null;
}

export interface StudentDocument {
    documentId: string;
    studentId: string;
    documentName: string;
    documentUrl: string;
    documentType: string;
    isVerified: boolean;
}

export interface StudentAdhaarData {
    adhaarId: string;
    studentId: string;
    adhaarNumber: string | null;
    adhaarName: string | null;
    adhaarGender: string | null;
    adhaarDob: string | null;
    adhaarAddress: string | null;
    adhaarFrontImageUrl: string | null;
    adhaarBackImageUrl: string | null;
    referenceData: string | null;
    isVerified: boolean;
    isManuallyAdded: boolean;
}

export interface StudentCourseAccess {
    studentId: string;
    courseId: string;
    expiresAt: string | null;
    isActive: boolean;
}

export interface StudentPackagesAccess {
    studentId: string;
    packageId: string;
    expiresAt: string | null;
    isActive: boolean;
}

/* ------------------------------------------------------------------ */
/* Content relations attached by the RM includes                       */
/* ------------------------------------------------------------------ */

export interface BenefitOnPackage {
    benefitId: string;
    packageId: string;
    Benefits: Benefit;
}

export interface PackageWithBenefits extends PackageBase {
    benefitsOnPackages: BenefitOnPackage[];
}

/** Shape from add/update package access (`include: { Packages: true }`) */
export interface StudentPackagesAccessWithPackage extends StudentPackagesAccess {
    Packages: PackageBase;
}

/** Shape from GetStudentPackageAccesses (packages include their benefits) */
export interface StudentPackagesAccessDetail extends StudentPackagesAccess {
    Packages: PackageWithBenefits;
}

export interface StudentCourseAccessWithCourse extends StudentCourseAccess {
    Courses: Course;
}

export interface StudentPaymentSchedule {
    scheduleId: string;
    purchaseId: string;
    dueDate: string;
    amount: number;
    isPaid: boolean;
    isPartialPayment: boolean;
    partialPaymentAmount: number | null;
    fineAmount: number | null;
}

export interface StudentPurchase {
    purchaseId: string;
    studentId: string;
    purchasedAt: string;
    amount: number | null;
    currentPaidAmount: number | null;
    isAllPaymentsDone: boolean;
    isEMIEnabled: boolean;
    numberOfInstallments: number | null;
    studentPaymentSchedules: StudentPaymentSchedule[];
}

export interface PackageInPurchase {
    purchaseId: string;
    packageId: string;
    Packages: PackageBase;
}

export interface CourseInPurchase {
    purchaseId: string;
    courseId: string;
    Courses: Course;
}

/** Shape from the purchase endpoints, which also include the purchased items */
export interface StudentPurchaseDetail extends StudentPurchase {
    packagesInPurchases: PackageInPurchase[];
    courseInPurchases: CourseInPurchase[];
}

export interface StudentPayment {
    paymentId: string;
    studentId: string;
    purchaseId: string | null;
    amount: number;
    paymentMode: string | null;
    paymentDate: string | null;
    paymentReference: string | null;
    paymentStatus: string | null;
    transactionId: string | null;
    isVerified: boolean;
    comments: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Shape returned by prisma.student.findFirst with the rm.controller includes */
export interface LMSStudentData {
    studentId: string;
    studentName: string;
    callingCode: string;
    phoneNumber: string;
    dateOfBirth: string | null;
    gender: string | null;
    email: string | null;
    studentRegistrationNumber: string | null;
    studentPhoto: string | null;
    studentAlternatePhoneNumber: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    branchId: string;
    onboardingRefId: string | null;
    machineCode: string | null;
    highestEducation: string | null;
    highestEducationInstitute: string | null;
    webNotificationToken: string | null;
    androidNotificationToken: string | null;
    iosNotificationToken: string | null;
    parentDetails: ParentDetails[];
    studentAddresses: StudentAddress[];
    studentDocuments: StudentDocument[];
    studentAdhaarDatas: StudentAdhaarData[];
    studentCourseAccesses: StudentCourseAccess[];
    studentPackagesAccesses: StudentPackagesAccess[];
    studentPurchases: StudentPurchase[];
    studentPayments: StudentPayment[];
}

/* ------------------------------------------------------------------ */
/* Context placeholder — extend when student-specific calls are added  */
/* ------------------------------------------------------------------ */

const StudentContext = createContext<null>(null);

export function useStudent() {
    const ctx = useContext(StudentContext);
    return ctx;
}
