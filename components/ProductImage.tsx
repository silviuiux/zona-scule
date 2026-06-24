import Image from "next/image";

export default function ProductImage({
  src,
  alt,
  sizes,
  fill = true,
  className = "",
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  fill?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-surface ${className}`}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-faint">
          <path d="M4 7h16v13H4z" strokeLinejoin="round" />
          <path d="M4 7l4-4h8l4 4" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
      className={`object-contain ${className}`}
    />
  );
}
