export default function Skeleton({ rows = 3, className = '' }) {
  return (
    <div className={`grid gap-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton h-16 w-full" />
      ))}
    </div>
  );
}
