"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axiosHandler from "@/lib/enhanced-axios";
import { StandardResponse } from "./AuthContext";

/* ------------------------------------------------------------------ */
/* Entity types (mirroring content.prisma / content.controller)        */
/* ------------------------------------------------------------------ */

export interface CourseRef {
    courseId: string;
    courseName: string;
}

export interface BenefitRef {
    benefitId: string;
    benefitName: string;
}

export interface PackageRef {
    packageId: string;
    packageName: string;
}

export interface Course {
    courseId: string;
    courseName: string;
    description: string | null;
    durationInMonths: number | null;
    isCertified: boolean;
    noOfModules: number | null;
    price: number | null;
    createdAt: string;
    updatedAt?: string;
}

export interface CourseDetail extends Course {
    packages: PackageRef[];
}

export interface Benefit {
    benefitId: string;
    benefitName: string;
    description: string | null;
    amount: number | null;
    createdAt: string;
    updatedAt?: string;
}

export interface BenefitDetail extends Benefit {
    packages: PackageRef[];
}

/** Raw `Packages` row, without the mapped courses/benefits the content endpoints attach. */
export interface PackageBase {
    packageId: string;
    packageName: string;
    description: string | null;
    price: number | null;
    discountAmount: number | null;
    durationInMonths: number | null;
    isJobGuaranteed: boolean;
    packageLevel: string | null;
    createdAt: string;
    updatedAt?: string;
}

export interface Package extends PackageBase {
    courses: CourseRef[];
    benefits: BenefitRef[];
}

export interface PackageDetail extends PackageBase {
    courses: Course[];
    benefits: Benefit[];
}

/* ------------------------------------------------------------------ */
/* Input types                                                         */
/* ------------------------------------------------------------------ */

export interface CreatePackageInput {
    packageName: string;
    description?: string;
    price?: number;
    discountAmount?: number;
    durationInMonths?: number;
    isJobGuaranteed?: boolean;
    packageLevel?: string;
    courseIds?: string[];
    benefitIds?: string[];
}

export type UpdatePackageInput = Partial<Omit<CreatePackageInput, "courseIds" | "benefitIds">>;

export interface CreateCourseInput {
    courseName: string;
    description?: string;
    durationInMonths?: number;
    isCertified?: boolean;
    noOfModules?: number;
    price?: number;
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

export interface CreateBenefitInput {
    benefitName: string;
    description?: string;
    amount?: number;
}

export type UpdateBenefitInput = Partial<CreateBenefitInput>;

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface ContentContextValue {
    packages: Package[];
    courses: Course[];
    benefits: Benefit[];
    loadingPackages: boolean;
    loadingCourses: boolean;
    loadingBenefits: boolean;

    // Packages
    getPackages: () => Promise<StandardResponse<Package[]>>;
    getPackageById: (packageId: string) => Promise<StandardResponse<PackageDetail>>;
    createPackage: (data: CreatePackageInput) => Promise<StandardResponse<{ packageId: string }>>;
    updatePackage: (packageId: string, data: UpdatePackageInput) => Promise<StandardResponse<{ packageId: string }>>;
    deletePackage: (packageId: string) => Promise<StandardResponse<null>>;

    // Courses
    getCourses: () => Promise<StandardResponse<Course[]>>;
    getCourseById: (courseId: string) => Promise<StandardResponse<CourseDetail>>;
    createCourse: (data: CreateCourseInput) => Promise<StandardResponse<{ courseId: string }>>;
    updateCourse: (courseId: string, data: UpdateCourseInput) => Promise<StandardResponse<{ courseId: string }>>;
    deleteCourse: (courseId: string) => Promise<StandardResponse<null>>;

    // Benefits
    getBenefits: () => Promise<StandardResponse<Benefit[]>>;
    getBenefitById: (benefitId: string) => Promise<StandardResponse<BenefitDetail>>;
    createBenefit: (data: CreateBenefitInput) => Promise<StandardResponse<{ benefitId: string }>>;
    updateBenefit: (benefitId: string, data: UpdateBenefitInput) => Promise<StandardResponse<{ benefitId: string }>>;
    deleteBenefit: (benefitId: string) => Promise<StandardResponse<null>>;

    // Package <-> Course / Benefit mapping
    addCoursesToPackage: (packageId: string, courseIds: string[]) => Promise<StandardResponse<{ packageId: string; courseIds: string[] }>>;
    removeCoursesFromPackage: (packageId: string, courseIds: string[]) => Promise<StandardResponse<{ packageId: string; removed: number }>>;
    removeCourseFromPackage: (packageId: string, courseId: string) => Promise<StandardResponse<{ packageId: string; removed: number }>>;
    addBenefitsToPackage: (packageId: string, benefitIds: string[]) => Promise<StandardResponse<{ packageId: string; benefitIds: string[] }>>;
    removeBenefitsFromPackage: (packageId: string, benefitIds: string[]) => Promise<StandardResponse<{ packageId: string; removed: number }>>;
    removeBenefitFromPackage: (packageId: string, benefitId: string) => Promise<StandardResponse<{ packageId: string; removed: number }>>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

const BASE = "/api/v1/content";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function ContentProvider({ children }: { children: ReactNode }) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingBenefits, setLoadingBenefits] = useState(false);

    /* -------------------------- Packages -------------------------- */

    const getPackages = useCallback(async (): Promise<StandardResponse<Package[]>> => {
        setLoadingPackages(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-packages`, method: "GET" }) as Package[];
            setPackages(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch packages"), data: null };
        } finally {
            setLoadingPackages(false);
        }
    }, []);

    const getPackageById = useCallback(async (packageId: string): Promise<StandardResponse<PackageDetail>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/get-package/${packageId}`, method: "GET" }) as PackageDetail;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch package"), data: null };
        }
    }, []);

    const createPackage = useCallback(async (data: CreatePackageInput): Promise<StandardResponse<{ packageId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/create-package`, method: "POST", body: data }) as { packageId: string };
            return { success: true, message: "Package created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create package"), data: null };
        }
    }, []);

    const updatePackage = useCallback(async (packageId: string, data: UpdatePackageInput): Promise<StandardResponse<{ packageId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/update-package/${packageId}`, method: "PUT", body: data }) as { packageId: string };
            return { success: true, message: "Package updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update package"), data: null };
        }
    }, []);

    const deletePackage = useCallback(async (packageId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `${BASE}/delete-package/${packageId}`, method: "DELETE" });
            setPackages((prev) => prev.filter((item) => item.packageId !== packageId));
            return { success: true, message: "Package deleted successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to delete package"), data: null };
        }
    }, []);

    /* --------------------------- Courses -------------------------- */

    const getCourses = useCallback(async (): Promise<StandardResponse<Course[]>> => {
        setLoadingCourses(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-courses`, method: "GET" }) as Course[];
            setCourses(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch courses"), data: null };
        } finally {
            setLoadingCourses(false);
        }
    }, []);

    const getCourseById = useCallback(async (courseId: string): Promise<StandardResponse<CourseDetail>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/get-course/${courseId}`, method: "GET" }) as CourseDetail;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch course"), data: null };
        }
    }, []);

    const createCourse = useCallback(async (data: CreateCourseInput): Promise<StandardResponse<{ courseId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/create-course`, method: "POST", body: data }) as { courseId: string };
            return { success: true, message: "Course created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create course"), data: null };
        }
    }, []);

    const updateCourse = useCallback(async (courseId: string, data: UpdateCourseInput): Promise<StandardResponse<{ courseId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/update-course/${courseId}`, method: "PUT", body: data }) as { courseId: string };
            return { success: true, message: "Course updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update course"), data: null };
        }
    }, []);

    const deleteCourse = useCallback(async (courseId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `${BASE}/delete-course/${courseId}`, method: "DELETE" });
            setCourses((prev) => prev.filter((item) => item.courseId !== courseId));
            return { success: true, message: "Course deleted successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to delete course"), data: null };
        }
    }, []);

    /* -------------------------- Benefits -------------------------- */

    const getBenefits = useCallback(async (): Promise<StandardResponse<Benefit[]>> => {
        setLoadingBenefits(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-benefits`, method: "GET" }) as Benefit[];
            setBenefits(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch benefits"), data: null };
        } finally {
            setLoadingBenefits(false);
        }
    }, []);

    const getBenefitById = useCallback(async (benefitId: string): Promise<StandardResponse<BenefitDetail>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/get-benefit/${benefitId}`, method: "GET" }) as BenefitDetail;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch benefit"), data: null };
        }
    }, []);

    const createBenefit = useCallback(async (data: CreateBenefitInput): Promise<StandardResponse<{ benefitId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/create-benefit`, method: "POST", body: data }) as { benefitId: string };
            return { success: true, message: "Benefit created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create benefit"), data: null };
        }
    }, []);

    const updateBenefit = useCallback(async (benefitId: string, data: UpdateBenefitInput): Promise<StandardResponse<{ benefitId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/update-benefit/${benefitId}`, method: "PUT", body: data }) as { benefitId: string };
            return { success: true, message: "Benefit updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update benefit"), data: null };
        }
    }, []);

    const deleteBenefit = useCallback(async (benefitId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `${BASE}/delete-benefit/${benefitId}`, method: "DELETE" });
            setBenefits((prev) => prev.filter((item) => item.benefitId !== benefitId));
            return { success: true, message: "Benefit deleted successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to delete benefit"), data: null };
        }
    }, []);

    /* -------------------- Package mappings ------------------------ */

    const addCoursesToPackage = useCallback(async (packageId: string, courseIds: string[]): Promise<StandardResponse<{ packageId: string; courseIds: string[] }>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/package/${packageId}/add-courses`,
                method: "POST",
                body: { courseIds },
            }) as { packageId: string; courseIds: string[] };
            return { success: true, message: "Courses added to package successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add courses to package"), data: null };
        }
    }, []);

    const removeCoursesFromPackage = useCallback(async (packageId: string, courseIds: string[]): Promise<StandardResponse<{ packageId: string; removed: number }>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/package/${packageId}/remove-courses`,
                method: "DELETE",
                body: { courseIds },
            }) as { packageId: string; removed: number };
            return { success: true, message: "Courses removed from package successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove courses from package"), data: null };
        }
    }, []);

    const removeCourseFromPackage = useCallback(async (packageId: string, courseId: string): Promise<StandardResponse<{ packageId: string; removed: number }>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/package/${packageId}/remove-course/${courseId}`,
                method: "DELETE",
            }) as { packageId: string; removed: number };
            return { success: true, message: "Course removed from package successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove course from package"), data: null };
        }
    }, []);

    const addBenefitsToPackage = useCallback(async (packageId: string, benefitIds: string[]): Promise<StandardResponse<{ packageId: string; benefitIds: string[] }>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/package/${packageId}/add-benefits`,
                method: "POST",
                body: { benefitIds },
            }) as { packageId: string; benefitIds: string[] };
            return { success: true, message: "Benefits added to package successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to add benefits to package"), data: null };
        }
    }, []);

    const removeBenefitsFromPackage = useCallback(async (packageId: string, benefitIds: string[]): Promise<StandardResponse<{ packageId: string; removed: number }>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/package/${packageId}/remove-benefits`,
                method: "DELETE",
                body: { benefitIds },
            }) as { packageId: string; removed: number };
            return { success: true, message: "Benefits removed from package successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove benefits from package"), data: null };
        }
    }, []);

    const removeBenefitFromPackage = useCallback(async (packageId: string, benefitId: string): Promise<StandardResponse<{ packageId: string; removed: number }>> => {
        try {
            const res = await axiosHandler({
                path: `${BASE}/package/${packageId}/remove-benefit/${benefitId}`,
                method: "DELETE",
            }) as { packageId: string; removed: number };
            return { success: true, message: "Benefit removed from package successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to remove benefit from package"), data: null };
        }
    }, []);

    const value = useMemo<ContentContextValue>(() => ({
        packages,
        courses,
        benefits,
        loadingPackages,
        loadingCourses,
        loadingBenefits,
        getPackages,
        getPackageById,
        createPackage,
        updatePackage,
        deletePackage,
        getCourses,
        getCourseById,
        createCourse,
        updateCourse,
        deleteCourse,
        getBenefits,
        getBenefitById,
        createBenefit,
        updateBenefit,
        deleteBenefit,
        addCoursesToPackage,
        removeCoursesFromPackage,
        removeCourseFromPackage,
        addBenefitsToPackage,
        removeBenefitsFromPackage,
        removeBenefitFromPackage,
    }), [
        packages, courses, benefits,
        loadingPackages, loadingCourses, loadingBenefits,
        getPackages, getPackageById, createPackage, updatePackage, deletePackage,
        getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
        getBenefits, getBenefitById, createBenefit, updateBenefit, deleteBenefit,
        addCoursesToPackage, removeCoursesFromPackage, removeCourseFromPackage,
        addBenefitsToPackage, removeBenefitsFromPackage, removeBenefitFromPackage,
    ]);

    return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useContent(): ContentContextValue {
    const ctx = useContext(ContentContext);
    if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
    return ctx;
}
