import "./textarea.css";

export function Textarea({ className = "", ...props }) {
  return <textarea className={`uiTextarea ${className}`.trim()} {...props} />;
}

