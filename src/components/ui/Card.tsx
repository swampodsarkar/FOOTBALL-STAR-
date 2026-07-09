import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  header,
  footer,
}: CardProps) {
  const Component = hoverable ? motion.div : 'div';
  const motionProps = hoverable
    ? { whileHover: { y: -4 }, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`bg-gray-900 rounded-xl border border-gray-800 overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...motionProps}
    >
      {header && <div className="px-5 pt-5 pb-2 border-b border-gray-800">{header}</div>}
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 py-3 border-t border-gray-800">{footer}</div>}
    </Component>
  );
}
