import "./input.css";

export function Input({ className = "", ...props }) {
  return <input className={`uiInput ${className}`.trim()} {...props} />;
}

