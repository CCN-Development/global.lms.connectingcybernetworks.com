"use client";

import { createContext, useContext, useEffect } from "react";

/** Lets a nested batch page (e.g. an assignment) replace the batch layout's header title. */
export const BatchHeaderTitleContext = createContext<((title: string | null) => void) | null>(null);

export function useBatchHeaderTitle(title: string | null) {
    const setTitle = useContext(BatchHeaderTitleContext);
    useEffect(() => {
        setTitle?.(title);
        return () => setTitle?.(null);
    }, [setTitle, title]);
}
