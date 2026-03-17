import clsx from 'clsx';

export default function Skeleton({
  variant = 'rect',
  className,
  width,
  height,
}) {
  if (variant === 'text') {
    return (
      <div
        className={clsx('animate-pulse bg-slate-200 rounded h-4 w-full', className)}
        style={{ width, height }}
      />
    );
  }

  return (
    <div
      className={clsx('animate-pulse bg-slate-200 rounded', className)}
      style={{ width, height }}
    />
  );
}
