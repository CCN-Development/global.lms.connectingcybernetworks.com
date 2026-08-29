"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        // perspective on the wrapper gives the 3-D depth field
        <div style={{ perspective: "1200px", minHeight: "100%", overflow: "hidden" }}>
            <motion.div
                key={pathname}
                initial={{ rotateY: 90 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 1, ease: [0.32, 0, 0.18, 1] }}
                style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
                className="flex flex-col min-h-full"
            >
                {children}
            </motion.div>
        </div>
    );
}
