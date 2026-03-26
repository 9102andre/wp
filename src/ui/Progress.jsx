import "./progress.css";

export function Progress({ value = 0, className = "", ...props }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`uiProgress ${className}`.trim()} {...props}>
      <div className="uiProgress__bar" style={{ width: `${safe}%` }} />
    </div>
  );
}

