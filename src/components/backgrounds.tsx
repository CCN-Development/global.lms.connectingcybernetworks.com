


export function BackgroundGray3D({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (<div className={`bg-linear-to-b from-indigo-200/20 to-gray-500/10 rounded-[99px]  inline-flex justify-start items-center gap-2 ${className ?? ""}`}>
        {children}
    </div>
    )
}



export function CardBackground1({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (<div className={`${className ?? ""}`}
        style={{
            background: "url('/card-bg-1.webp')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            width: "100%",
            backdropFilter: "blur(2px)",
        }}
    >
        {children}
    </div>
    )
}


export function CardBackground2({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (<div className={`${className ?? ""}`}
        style={{
            background: "url('/card-bg-2.webp')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            width: "100%",
            backdropFilter: "blur(2px)",
        }}
    >
        {children}
    </div>
    )
}

export function CardBackground3({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (<div className={`${className ?? ""}`}
        style={{
            background: "url('/next-lesson.webp')",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            width: "100%",
            backdropFilter: "blur(2px)",
        }}
    >
        {children}
    </div>
    )
}