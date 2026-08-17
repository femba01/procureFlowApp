import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export type ModalSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "fullscreen";

interface ModalProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  open?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;

  size?: ModalSize;

  onClose: () => void;

  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventBodyScroll?: boolean;

  overlayClassName?: string;
  containerClassName?: string;
  headerClassName?: string;
  headerContentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  childrenClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;

  header?: ReactNode;
  labelledBy?: string;
  describedBy?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-[550px]",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  fullscreen: "h-[calc(100dvh-2rem)] max-w-none",
};

const cn = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Modal({
  open = true,
  title,
  description,
  icon,
  children,
  footer,
  header,
  size = "lg",
  onClose,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventBodyScroll = true,
  overlayClassName,
  containerClassName,
  headerClassName,
  headerContentClassName,
  titleClassName,
  descriptionClassName,
  childrenClassName,
  footerClassName,
  closeButtonClassName,
  labelledBy,
  describedBy,
  className,
  ...sectionProps
}: ModalProps) {
  const modalRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const generatedTitleId = useId();
  const generatedDescriptionId = useId();

  const titleId = labelledBy ?? generatedTitleId;
  const descriptionId = describedBy ?? generatedDescriptionId;

  const hasDefaultHeader =
    title !== undefined || description !== undefined || icon !== undefined;

  const hasHeader = header !== undefined || hasDefaultHeader || showCloseButton;

  useEffect(() => {
    if (!open) return;

    previousActiveElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const originalOverflow = document.body.style.overflow;

    if (preventBodyScroll) {
      document.body.style.overflow = "hidden";
    }

    const focusableElements =
      modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);

    const firstFocusableElement = focusableElements?.[0];

    window.requestAnimationFrame(() => {
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      } else {
        modalRef.current?.focus();
      }
    });

    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = originalOverflow;
      }

      previousActiveElement.current?.focus();
    };
  }, [open, preventBodyScroll]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      // Keep keyboard focus inside the modal.
      if (event.key !== "Tab" || !modalRef.current) return;

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS),
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true",
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  const isFullscreen = size === "fullscreen";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center bg-[#101828a8]",
        isFullscreen ? "p-4" : "p-5 max-sm:p-2",
        overlayClassName,
      )}
      onMouseDown={handleOverlayClick}
      aria-hidden="false"
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={!title ? "Dialog" : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-white",
          "rounded-[14px] shadow-[0_20px_60px_#10182845] outline-none",
          sizeClasses[size],
          isFullscreen && "rounded-xl",
          className,
          containerClassName,
        )}
        onMouseDown={(event) => event.stopPropagation()}
        {...sectionProps}
      >
        {hasHeader && (
          <header
            className={cn(
              "flex shrink-0 items-center justify-between gap-4",
              "border-b border-[#e7eaf0] p-6! max-sm:px-4",
              headerClassName,
            )}
          >
            {header !== undefined ? (
              <div className="min-w-0 flex-1">{header}</div>
            ) : (
              <div
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-[11px]",
                  headerContentClassName,
                )}
              >
                {icon && (
                  <span
                    className={cn(
                      "grid size-[38px] shrink-0 place-items-center",
                      "rounded-[9px] bg-[#e9efff] text-[#315fdb]",
                    )}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                )}

                <div className="min-w-0">
                  {title && (
                    <h2
                      id={titleId}
                      className={cn(
                        "m-0 font-[Manrope] text-base font-bold leading-5 text-[#273246]",
                        titleClassName,
                      )}
                    >
                      {title}
                    </h2>
                  )}

                  {description && (
                    <p
                      id={descriptionId}
                      className={cn(
                        "mt-[3px] text-[10px] leading-4 text-[#8690a1]",
                        descriptionClassName,
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {showCloseButton && (
              <Button
                type="button"
                variant="ghost"
                aria-label="Close modal"
                className={cn(
                  "h-auto min-h-0 w-auto shrink-0 rounded-none p-0! text-[#7e8899] shadow-none",
                  "hover:bg-transparent hover:text-[#526078]",
                  closeButtonClassName,
                )}
                onClick={onClose}
              >
                <X size={25} aria-hidden="true" />
              </Button>
            )}
          </header>
        )}

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            "px-2! py-[22px] max-sm:px-4",
            childrenClassName,
          )}
        >
          {children}
        </div>

        {footer !== undefined && (
          <footer
            className={cn(
              "flex shrink-0 flex-row justify-end gap-2.5",
              "border-t border-[#e7eaf0] bg-[#f8f9fb] px-6 py-4 max-sm:px-4",
              footerClassName,
            )}
          >
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
