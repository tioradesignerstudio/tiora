import React from "react";

interface ShoppingBagIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function ShoppingBagIcon({ size = 20, className, ...props }: ShoppingBagIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Handle */}
      <path d="M 9.5 13 L 9.5 6.5 A 2.5 2.5 0 0 1 14.5 6.5 L 14.5 13" />
      {/* Attachment dots */}
      <circle cx="9.5" cy="13" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13" r="0.75" fill="currentColor" stroke="none" />
      {/* Bag Body */}
      <path d="M 7.5 9 L 16.5 9 A 1 1 0 0 1 17.4 10.1 L 19.8 20 A 1.5 1.5 0 0 1 18.3 21.8 L 5.7 21.8 A 1.5 1.5 0 0 1 4.2 20 L 6.6 10.1 A 1 1 0 0 1 7.5 9 Z" />
    </svg>
  );
}
