"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axiosHandler from "@/lib/enhanced-axios";
import { StandardResponse } from "./AuthContext";

/* ------------------------------------------------------------------ */
/* Entity types (mirroring erp.prisma / erp.controller)                */
/* ------------------------------------------------------------------ */

export interface BankAccount {
    bankAccountDetailsId: string;
    bankHolderName: string | null;
    accountNumber: string | null;
    ifscCode: string | null;
    mobileNumber: string | null;
    UPIId: string | null;
    commonCallingName: string | null;
    currentBalance: number | null;
    createdAt: string;
}

export interface BankAccountDetail extends BankAccount {
    isActive: boolean;
}

export interface BankAccountTransaction {
    bankAccountTransactionId: string;
    transactionType: string;
    transactionDate: string;
    amount: number;
    description: string | null;
    createdAt: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface BankAccountTransactionsResult {
    transactions: BankAccountTransaction[];
    pagination: PaginationMeta;
}

export type ExpenseStatus = "pending" | "approved" | "rejected" | "completed";

export interface ExpenseBankAccount {
    bankAccountDetailsId: string;
    bankHolderName: string | null;
    accountNumber: string | null;
    commonCallingName: string | null;
}

export interface Expense {
    expenseId: string;
    description: string | null;
    expenseStatus: ExpenseStatus;
    amount: number;
    modeOfPayment: string | null;
    proofOfPayment: string | null;
    createdAt: string;
    updatedAt: string;
    bankAccountDetails: ExpenseBankAccount | null;
}

export interface ExpenseDetail extends Omit<Expense, "bankAccountDetails"> {
    branchId: string;
    bankAccountDetails: (ExpenseBankAccount & { currentBalance: number | null }) | null;
}

export interface ExpensesResult {
    expenses: Expense[];
    totalAmount: number;
    pagination: PaginationMeta;
}

export interface PaymentScheduleStudent {
    studentId: string;
    studentName: string;
    callingCode: string;
    phoneNumber: string;
    email: string | null;
    studentRegistrationNumber: string | null;
    studentPhoto: string | null;
    studentAlternatePhoneNumber: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    branchId: string;
    isActive: boolean;
}

export interface PaymentSchedulePurchase {
    purchaseId: string;
    studentId: string;
    purchasedAt: string;
    amount: number | null;
    currentPaidAmount: number | null;
    isAllPaymentsDone: boolean;
    isEMIEnabled: boolean;
    numberOfInstallments: number | null;
    Student: PaymentScheduleStudent;
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
    StudentPurchases: PaymentSchedulePurchase;
}

export interface DueAndUpcomingPayments {
    duePayments: StudentPaymentSchedule[];
    upcomingPayments: StudentPaymentSchedule[];
}

export type PaymentStatus = "pending" | "completed" | "failed";

export interface StudentPaymentStudent {
    studentId: string;
    studentName: string;
    callingCode: string;
    phoneNumber: string;
    studentRegistrationNumber: string | null;
    studentPhoto: string | null;
}

export interface StudentPaymentBankAccount {
    bankAccountDetailsId: string;
    bankHolderName: string | null;
    accountNumber: string | null;
    commonCallingName: string | null;
}

export interface StudentPayment {
    paymentId: string;
    amount: number;
    anyFineAmount: number | null;
    paymentMode: string | null;
    paymentDate: string | null;
    paymentReference: string | null;
    paymentStatus: PaymentStatus | null;
    isVerified: boolean;
    comments: string | null;
    createdAt: string;
    purchaseId: string | null;
    student: StudentPaymentStudent;
    bankAccountDetails: StudentPaymentBankAccount | null;
}

export interface StudentPaymentsResult {
    payments: StudentPayment[];
    totalAmount: number;
    totalFineAmount: number;
    pagination: PaginationMeta;
}

/* ------------------------------------------------------------------ */
/* Input types                                                         */
/* ------------------------------------------------------------------ */

export interface CreateBankAccountInput {
    bankHolderName: string;
    accountNumber: string;
    ifscCode?: string;
    mobileNumber?: string;
    UPIId?: string;
    commonCallingName?: string;
    currentBalance?: number;
}

export type UpdateBankAccountInput = Partial<CreateBankAccountInput>;

export interface BankAccountTransactionsQuery {
    transactionType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface ExpensesQuery {
    startDate?: string;
    endDate?: string;
    modeOfPayment?: string;
    expenseStatus?: ExpenseStatus;
    bankAccountDetailsId?: string;
    page?: number;
    limit?: number;
}

export interface CreateExpenseInput {
    bankAccountDetailsId: string;
    amount: number;
    description?: string;
    modeOfPayment?: string;
}

export interface CompleteExpenseInput {
    proofOfPayment: string;
    modeOfPayment?: string;
}

export interface StudentPaymentsQuery {
    startDate?: string;
    endDate?: string;
    search?: string;
    studentId?: string;
    paymentStatus?: PaymentStatus;
    paymentMode?: string;
    isVerified?: boolean;
    page?: number;
    limit?: number;
}

export interface CreateStudentPaymentInput {
    studentId: string;
    bankAccountDetailsId: string;
    amount: number;
    purchaseId?: string;
    anyFineAmount?: number;
    paymentMode?: string;
    paymentDate?: string;
    paymentReference?: string;
    paymentStatus?: PaymentStatus;
    comments?: string;
    isVerified?: boolean;
}

export type UpdateStudentPaymentInput = Partial<Omit<CreateStudentPaymentInput, "studentId" | "bankAccountDetailsId" | "purchaseId">>;

/* ------------------------------------------------------------------ */
/* Context shape                                                       */
/* ------------------------------------------------------------------ */

interface ERPContextValue {
    bankAccounts: BankAccount[];
    transactions: BankAccountTransaction[];
    transactionsMeta: PaginationMeta | null;
    expenses: Expense[];
    expensesMeta: PaginationMeta | null;
    expensesTotalAmount: number;
    duePayments: StudentPaymentSchedule[];
    upcomingPayments: StudentPaymentSchedule[];
    studentPayments: StudentPayment[];
    studentPaymentsMeta: PaginationMeta | null;
    studentPaymentsTotalAmount: number;
    studentPaymentsTotalFineAmount: number;
    loadingBankAccounts: boolean;
    loadingTransactions: boolean;
    loadingExpenses: boolean;
    loadingPayments: boolean;
    loadingStudentPayments: boolean;

    getBankAccounts: () => Promise<StandardResponse<BankAccount[]>>;
    getBankAccountById: (bankAccountDetailsId: string) => Promise<StandardResponse<BankAccountDetail>>;
    createBankAccount: (data: CreateBankAccountInput) => Promise<StandardResponse<{ bankAccountDetailsId: string }>>;
    updateBankAccount: (bankAccountDetailsId: string, data: UpdateBankAccountInput) => Promise<StandardResponse<{ bankAccountDetailsId: string }>>;
    deleteBankAccount: (bankAccountDetailsId: string) => Promise<StandardResponse<null>>;

    getBankAccountTransactions: (
        bankAccountDetailsId: string,
        query?: BankAccountTransactionsQuery
    ) => Promise<StandardResponse<BankAccountTransactionsResult>>;

    getDueAndUpcomingPayments: () => Promise<StandardResponse<DueAndUpcomingPayments>>;

    getStudentPayments: (query?: StudentPaymentsQuery) => Promise<StandardResponse<StudentPaymentsResult>>;
    createStudentPayment: (data: CreateStudentPaymentInput) => Promise<StandardResponse<{ paymentId: string }>>;
    updateStudentPayment: (paymentId: string, data: UpdateStudentPaymentInput) => Promise<StandardResponse<{ paymentId: string }>>;
    deleteStudentPayment: (paymentId: string) => Promise<StandardResponse<null>>;

    getExpenses: (query?: ExpensesQuery) => Promise<StandardResponse<ExpensesResult>>;
    getExpenseById: (expenseId: string) => Promise<StandardResponse<ExpenseDetail>>;
    createExpense: (data: CreateExpenseInput) => Promise<StandardResponse<{ expenseId: string }>>;
    approveExpense: (expenseId: string) => Promise<StandardResponse<{ expenseId: string }>>;
    rejectExpense: (expenseId: string, description?: string) => Promise<StandardResponse<{ expenseId: string }>>;
    completeExpense: (expenseId: string, data: CompleteExpenseInput) => Promise<StandardResponse<{ expenseId: string }>>;
}

const ERPContext = createContext<ERPContextValue | null>(null);

const BASE = "/api/v1/erp";

function toMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function ERPProvider({ children }: { children: ReactNode }) {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [transactions, setTransactions] = useState<BankAccountTransaction[]>([]);
    const [transactionsMeta, setTransactionsMeta] = useState<PaginationMeta | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [expensesMeta, setExpensesMeta] = useState<PaginationMeta | null>(null);
    const [expensesTotalAmount, setExpensesTotalAmount] = useState(0);
    const [duePayments, setDuePayments] = useState<StudentPaymentSchedule[]>([]);
    const [upcomingPayments, setUpcomingPayments] = useState<StudentPaymentSchedule[]>([]);
    const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
    const [studentPaymentsMeta, setStudentPaymentsMeta] = useState<PaginationMeta | null>(null);
    const [studentPaymentsTotalAmount, setStudentPaymentsTotalAmount] = useState(0);
    const [studentPaymentsTotalFineAmount, setStudentPaymentsTotalFineAmount] = useState(0);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [loadingStudentPayments, setLoadingStudentPayments] = useState(false);

    /* ------------------------ Bank accounts ----------------------- */

    const getBankAccounts = useCallback(async (): Promise<StandardResponse<BankAccount[]>> => {
        setLoadingBankAccounts(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-bank-accounts`, method: "GET" }) as BankAccount[];
            setBankAccounts(res);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch bank accounts"), data: null };
        } finally {
            setLoadingBankAccounts(false);
        }
    }, []);

    const getBankAccountById = useCallback(async (bankAccountDetailsId: string): Promise<StandardResponse<BankAccountDetail>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/get-bank-account/${bankAccountDetailsId}`, method: "GET" }) as BankAccountDetail;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch bank account"), data: null };
        }
    }, []);

    const createBankAccount = useCallback(async (data: CreateBankAccountInput): Promise<StandardResponse<{ bankAccountDetailsId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/create-bank-account`, method: "POST", body: data }) as { bankAccountDetailsId: string };
            return { success: true, message: "Bank account created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create bank account"), data: null };
        }
    }, []);

    const updateBankAccount = useCallback(async (bankAccountDetailsId: string, data: UpdateBankAccountInput): Promise<StandardResponse<{ bankAccountDetailsId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/update-bank-account/${bankAccountDetailsId}`, method: "PUT", body: data }) as { bankAccountDetailsId: string };
            return { success: true, message: "Bank account updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update bank account"), data: null };
        }
    }, []);

    const deleteBankAccount = useCallback(async (bankAccountDetailsId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `${BASE}/delete-bank-account/${bankAccountDetailsId}`, method: "DELETE" });
            setBankAccounts((prev) => prev.filter((item) => item.bankAccountDetailsId !== bankAccountDetailsId));
            return { success: true, message: "Bank account deleted successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to delete bank account"), data: null };
        }
    }, []);

    /* --------------------- Bank transactions ---------------------- */

    const getBankAccountTransactions = useCallback(async (
        bankAccountDetailsId: string,
        query?: BankAccountTransactionsQuery
    ): Promise<StandardResponse<BankAccountTransactionsResult>> => {
        setLoadingTransactions(true);
        try {
            const res = await axiosHandler({
                path: `${BASE}/get-bank-account-transactions/${bankAccountDetailsId}`,
                method: "GET",
                params: query,
            }) as BankAccountTransactionsResult;
            setTransactions(res.transactions);
            setTransactionsMeta(res.pagination);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch bank account transactions"), data: null };
        } finally {
            setLoadingTransactions(false);
        }
    }, []);

    /* ------------------------- Payments --------------------------- */

    const getDueAndUpcomingPayments = useCallback(async (): Promise<StandardResponse<DueAndUpcomingPayments>> => {
        setLoadingPayments(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-due-and-upcoming-payments`, method: "GET" }) as DueAndUpcomingPayments;
            setDuePayments(res.duePayments);
            setUpcomingPayments(res.upcomingPayments);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch due and upcoming payments"), data: null };
        } finally {
            setLoadingPayments(false);
        }
    }, []);

    /* --------------------- Student payments ----------------------- */

    const getStudentPayments = useCallback(async (query?: StudentPaymentsQuery): Promise<StandardResponse<StudentPaymentsResult>> => {
        setLoadingStudentPayments(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-student-payments`, method: "GET", params: query }) as StudentPaymentsResult;
            setStudentPayments(res.payments);
            setStudentPaymentsMeta(res.pagination);
            setStudentPaymentsTotalAmount(res.totalAmount);
            setStudentPaymentsTotalFineAmount(res.totalFineAmount);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch student payments"), data: null };
        } finally {
            setLoadingStudentPayments(false);
        }
    }, []);

    const createStudentPayment = useCallback(async (data: CreateStudentPaymentInput): Promise<StandardResponse<{ paymentId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/create-student-payment`, method: "POST", body: data }) as { paymentId: string };
            return { success: true, message: "Student payment recorded successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to record student payment"), data: null };
        }
    }, []);

    const updateStudentPayment = useCallback(async (paymentId: string, data: UpdateStudentPaymentInput): Promise<StandardResponse<{ paymentId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/update-student-payment/${paymentId}`, method: "PUT", body: data }) as { paymentId: string };
            return { success: true, message: "Student payment updated successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to update student payment"), data: null };
        }
    }, []);

    const deleteStudentPayment = useCallback(async (paymentId: string): Promise<StandardResponse<null>> => {
        try {
            await axiosHandler({ path: `${BASE}/delete-student-payment/${paymentId}`, method: "DELETE" });
            setStudentPayments((prev) => prev.filter((item) => item.paymentId !== paymentId));
            return { success: true, message: "Student payment deleted successfully", data: null };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to delete student payment"), data: null };
        }
    }, []);

    /* ------------------------- Expenses --------------------------- */

    const getExpenses = useCallback(async (query?: ExpensesQuery): Promise<StandardResponse<ExpensesResult>> => {
        setLoadingExpenses(true);
        try {
            const res = await axiosHandler({ path: `${BASE}/get-expenses`, method: "GET", params: query }) as ExpensesResult;
            setExpenses(res.expenses);
            setExpensesMeta(res.pagination);
            setExpensesTotalAmount(res.totalAmount);
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch expenses"), data: null };
        } finally {
            setLoadingExpenses(false);
        }
    }, []);

    const getExpenseById = useCallback(async (expenseId: string): Promise<StandardResponse<ExpenseDetail>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/get-expense/${expenseId}`, method: "GET" }) as ExpenseDetail;
            return { success: true, message: null, data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to fetch expense"), data: null };
        }
    }, []);

    const createExpense = useCallback(async (data: CreateExpenseInput): Promise<StandardResponse<{ expenseId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/create-expense`, method: "POST", body: data }) as { expenseId: string };
            return { success: true, message: "Expense created successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to create expense"), data: null };
        }
    }, []);

    const applyStatusLocally = useCallback((expenseId: string, expenseStatus: ExpenseStatus) => {
        setExpenses((prev) => prev.map((item) => (item.expenseId === expenseId ? { ...item, expenseStatus } : item)));
    }, []);

    const approveExpense = useCallback(async (expenseId: string): Promise<StandardResponse<{ expenseId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/approve-expense/${expenseId}`, method: "PUT" }) as { expenseId: string };
            applyStatusLocally(expenseId, "approved");
            return { success: true, message: "Expense approved successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to approve expense"), data: null };
        }
    }, [applyStatusLocally]);

    const rejectExpense = useCallback(async (expenseId: string, description?: string): Promise<StandardResponse<{ expenseId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/reject-expense/${expenseId}`, method: "PUT", body: { description } }) as { expenseId: string };
            applyStatusLocally(expenseId, "rejected");
            return { success: true, message: "Expense rejected successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to reject expense"), data: null };
        }
    }, [applyStatusLocally]);

    const completeExpense = useCallback(async (expenseId: string, data: CompleteExpenseInput): Promise<StandardResponse<{ expenseId: string }>> => {
        try {
            const res = await axiosHandler({ path: `${BASE}/complete-expense/${expenseId}`, method: "PUT", body: data }) as { expenseId: string };
            applyStatusLocally(expenseId, "completed");
            return { success: true, message: "Expense completed successfully", data: res };
        } catch (error: unknown) {
            return { success: false, message: toMessage(error, "Failed to complete expense"), data: null };
        }
    }, [applyStatusLocally]);

    const value = useMemo<ERPContextValue>(() => ({
        bankAccounts,
        transactions,
        transactionsMeta,
        expenses,
        expensesMeta,
        expensesTotalAmount,
        duePayments,
        upcomingPayments,
        studentPayments,
        studentPaymentsMeta,
        studentPaymentsTotalAmount,
        studentPaymentsTotalFineAmount,
        loadingBankAccounts,
        loadingTransactions,
        loadingExpenses,
        loadingPayments,
        loadingStudentPayments,
        getBankAccounts,
        getBankAccountById,
        createBankAccount,
        updateBankAccount,
        deleteBankAccount,
        getBankAccountTransactions,
        getDueAndUpcomingPayments,
        getStudentPayments,
        createStudentPayment,
        updateStudentPayment,
        deleteStudentPayment,
        getExpenses,
        getExpenseById,
        createExpense,
        approveExpense,
        rejectExpense,
        completeExpense,
    }), [
        bankAccounts,
        transactions,
        transactionsMeta,
        expenses,
        expensesMeta,
        expensesTotalAmount,
        duePayments,
        upcomingPayments,
        studentPayments,
        studentPaymentsMeta,
        studentPaymentsTotalAmount,
        studentPaymentsTotalFineAmount,
        loadingBankAccounts,
        loadingTransactions,
        loadingExpenses,
        loadingPayments,
        loadingStudentPayments,
        getBankAccounts,
        getBankAccountById,
        createBankAccount,
        updateBankAccount,
        deleteBankAccount,
        getBankAccountTransactions,
        getDueAndUpcomingPayments,
        getStudentPayments,
        createStudentPayment,
        updateStudentPayment,
        deleteStudentPayment,
        getExpenses,
        getExpenseById,
        createExpense,
        approveExpense,
        rejectExpense,
        completeExpense,
    ]);

    return <ERPContext.Provider value={value}>{children}</ERPContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useERP(): ERPContextValue {
    const ctx = useContext(ERPContext);
    if (!ctx) throw new Error("useERP must be used inside <ERPProvider>");
    return ctx;
}
