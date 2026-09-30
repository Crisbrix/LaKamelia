import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'btn-primary',
  green: 'btn-green',
  red: 'btn-red',
  ghost: 'btn-ghost',
  neutral: '',
};

const SIZES = {
  sm: '!py-1.5 !px-3 !text-xs',
  md: '',
  lg: '!py-3 !px-6 !text-base',
};

export default function Button({
  variant = 'neutral',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <motion.button
      type={type}
      className={`btn ${VARIANTS[variant] ?? ''} ${SIZES[size] ?? ''} ${className}`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
