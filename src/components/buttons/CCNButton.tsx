import { Button } from '@mui/material';
import React from 'react'

type Props = {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export default function CCNButton({
    onClick,
    children,
    className,
    disabled,
}: Props) {
    return (
        <Button onClick={onClick} disabled={disabled} className={`bg-linear-to-r from-[#00098B]  via-13% to-[#5900AC] text-white ${className}`} sx={{
            borderRadius: "7px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "#fff",
            // py: 1.25,
            px: 2.5,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
            },
            "&.Mui-disabled": {
                color: "rgba(255,255,255,0.55)",
                opacity: 0.6,
            },
        }}>
            {children}
        </Button>
    )
}