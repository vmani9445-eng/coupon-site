    import Image from "next/image";

    type StoreLogoProps = {
    name: string;
    logo?: string | null;
    size?: number;
    className?: string;
    rounded?: number;
    };

    export default function StoreLogo({
    name,
    logo,
    size = 64,
    className = "",
    rounded = 18,
    }: StoreLogoProps) {
    const initials = name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
        className={className}
        style={{
            width: size,
            height: size,
            borderRadius: rounded,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8f9fc",
            border: "1px solid #eceff4",
            flexShrink: 0,
        }}
        >
        {logo ? (
            <Image
            src={logo}
            alt={name}
            width={size}
            height={size}
            unoptimized
            style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
            }}
            />
        ) : (
            <span
            style={{
                fontSize: size >= 72 ? 24 : size >= 56 ? 18 : 15,
                fontWeight: 800,
                color: "#6b7280",
                letterSpacing: "-0.02em",
            }}
            >
            {initials}
            </span>
        )}
        </div>
    );
    }