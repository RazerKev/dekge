import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface AnimatedButtonProps {
  href: string;
  text: string;
  className?: string;
}

export function AnimatedButton({ href, text, className = "" }: AnimatedButtonProps) {
  return (
    <Link
      className={`${buttonVariants({
        size: "lg",
        className: `${className} relative overflow-hidden group`,
        variant: "pink",
      })} before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:animate-shine`}
      href={href}
      target="_blank"
    >
      <div className="relative w-full h-full">
        {/* Arrow container with animation */}
        <div className="absolute inset-0 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="52"
            height="24"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 52 24"
            fill="none"
            className="ml-3 group-hover:animate-arrow-slide"
          >
            <path
              d="M51.0607 13.0607C51.6464 12.4749 51.6464 11.5251 51.0607 10.9393L41.5147 1.3934C40.9289 0.807612 39.9792 0.807612 39.3934 1.3934C38.8076 1.97918 38.8076 2.92893 39.3934 3.51472L47.8787 12L39.3934 20.4853C38.8076 21.0711 38.8076 22.0208 39.3934 22.6066C39.9792 23.1924 40.9289 23.1924 41.5147 22.6066L51.0607 13.0607ZM0 13.5H50V10.5H0V13.5Z"
              fill="#FFC7FF"
            />
          </svg>
        </div>
        
        {/* Text mask */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#6C35DE]">
          <p className="text-white text-xl md:text-2xl mix-blend-lighten">
            {text}
          </p>
        </div>
      </div>
    </Link>
  );
}
