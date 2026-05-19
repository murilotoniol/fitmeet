import { Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

type BaseFieldProps = {
  error?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

type InputProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

function FieldShell({
  children,
  error,
  helperText,
  label,
  required,
}: BaseFieldProps & { children: ReactNode }) {
  return (
    <label className="flex min-w-0 max-w-full flex-col gap-1.5">
      {label ? (
        <span className="text-label text-[var(--color-title)]">
          {label}
          {required ? <span className="ml-1 text-[var(--color-danger)]">*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span className="text-sm text-[var(--color-danger)]">{error}</span> : null}
      {!error && helperText ? (
        <span className="text-sm text-[var(--color-placeholder)]">{helperText}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-[var(--radius-sm)] border bg-white px-5 py-3 text-body text-[var(--color-text)] transition-colors outline-none placeholder:text-[var(--color-placeholder)] disabled:cursor-not-allowed disabled:bg-white disabled:text-[var(--color-placeholder)]";

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, helperText, label, required, leadingIcon, trailingIcon, type = "text", ...props },
  ref,
) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const isDatePicker = type === "date" || type === "datetime-local";
  const resolvedType = isPassword && passwordVisible ? "text" : type;

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  function handleOpenPicker() {
    const input = inputRef.current;

    if (!input || props.disabled) {
      return;
    }

    input.focus();

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }

  return (
    <FieldShell error={error} helperText={helperText} label={label} required={required}>
      <div
        className={cn(
          "flex min-h-12 min-w-0 w-full max-w-full items-center gap-3 overflow-hidden border",
          error
            ? "border-[var(--color-danger)]"
            : "border-[var(--color-border)] focus-within:border-[var(--color-border-focus)]",
          "rounded-[var(--radius-sm)] bg-white",
        )}
      >
        {leadingIcon ? (
          <span className="shrink-0 pl-4 text-[var(--color-placeholder)]">{leadingIcon}</span>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          className={cn(
            inputBase,
            "min-h-12 min-w-0 flex-1 border-0 px-0 py-0 shadow-none focus-visible:ring-0",
            leadingIcon ? "pr-5" : "px-5",
            trailingIcon && !isPassword ? "pr-2" : "",
            isPassword ? "pr-2" : "",
            isDatePicker
              ? "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              : "",
            className,
          )}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {trailingIcon && !isPassword && isDatePicker ? (
          <button
            type="button"
            onClick={handleOpenPicker}
            className="mr-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-placeholder)] transition-colors hover:text-[var(--color-text)]"
            aria-label="Abrir seletor de data e hora"
            disabled={props.disabled}
          >
            {trailingIcon}
          </button>
        ) : trailingIcon && !isPassword ? (
          <span className="shrink-0 pr-4 text-[var(--color-placeholder)] [&_svg]:pointer-events-none">
            {trailingIcon}
          </span>
        ) : null}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-placeholder)] transition-colors hover:text-[var(--color-text)]"
            aria-label={passwordVisible ? "Esconder senha" : "Mostrar senha"}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
    </FieldShell>
  );
});

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, helperText, label, required, ...props },
  ref,
) {
    const generatedId = useId();
    const id = props.id ?? generatedId;

    return (
      <FieldShell error={error} helperText={helperText} label={label} required={required}>
        <textarea
          ref={ref}
          id={id}
          className={cn(
            inputBase,
            "max-w-full min-w-0 min-h-32 resize-none border-[var(--color-border)] px-5 py-4",
            error
              ? "border-[var(--color-danger)]"
              : "focus:border-[var(--color-border-focus)]",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </FieldShell>
    );
});

export { Input, Textarea };
