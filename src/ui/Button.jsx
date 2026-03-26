import "./button.css";

const VARIANT_CLASS = {
  default: "uiButton--primary",
  primary: "uiButton--primary",
  outline: "uiButton--outline",
  secondary: "uiButton--secondary",
  ghost: "uiButton--ghost",
  link: "uiButton--link",
};

const SIZE_CLASS = {
  sm: "uiButton--sm",
  default: "uiButton--md",
  md: "uiButton--md",
  lg: "uiButton--lg",
  icon: "uiButton--icon",
};

export function Button({
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  ...props
}) {
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.default;
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.default;

  return (
    <button
      type={type}
      className={`uiButton ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    />
  );
}

