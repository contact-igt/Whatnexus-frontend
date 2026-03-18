"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

// ── Context ──────────────────────────────────────────────────────────────────

interface DialogContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
    open: false,
    onOpenChange: () => {},
});

// ── Dialog (root) ─────────────────────────────────────────────────────────────

interface DialogProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog = ({
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    children,
}: DialogProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const handleOpenChange = React.useCallback(
        (value: boolean) => {
            if (!isControlled) setUncontrolledOpen(value);
            onOpenChange?.(value);
        },
        [isControlled, onOpenChange]
    );

    return (
        <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

// ── DialogTrigger ─────────────────────────────────────────────────────────────

interface DialogTriggerProps {
    asChild?: boolean;
    children: React.ReactNode;
}

export const DialogTrigger = ({ asChild, children }: DialogTriggerProps) => {
    const { onOpenChange } = React.useContext(DialogContext);

    const handleClick = () => onOpenChange(true);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(
            children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
            { onClick: handleClick }
        );
    }

    return (
        <button type="button" onClick={handleClick}>
            {children}
        </button>
    );
};

// ── DialogPortal ──────────────────────────────────────────────────────────────

interface DialogPortalProps {
    children: React.ReactNode;
}

export const DialogPortal = ({ children }: DialogPortalProps) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return createPortal(children, document.body);
};

// ── DialogOverlay ─────────────────────────────────────────────────────────────

interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200",
                className
            )}
            {...props}
        />
    )
);
DialogOverlay.displayName = "DialogOverlay";

// ── DialogContent ─────────────────────────────────────────────────────────────

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    onPointerDownOutside?: () => void;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, onPointerDownOutside, ...props }, ref) => {
        const { open, onOpenChange } = React.useContext(DialogContext);

        // Lock body scroll while open
        React.useEffect(() => {
            if (open) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
            return () => {
                document.body.style.overflow = "";
            };
        }, [open]);

        if (!open) return null;

        return (
            <DialogPortal>
                {/* Overlay */}
                <DialogOverlay onClick={() => { onPointerDownOutside?.(); onOpenChange(false); }} />

                {/* Panel */}
                <div
                    ref={ref}
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                        "w-full max-w-lg max-h-[90vh] overflow-y-auto",
                        "rounded-xl border border-[#2a2a2a] bg-[#111111] shadow-2xl",
                        "animate-in fade-in zoom-in-95 duration-200",
                        "p-6",
                        className
                    )}
                    {...props}
                >
                    {children}

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-all hover:bg-white/10 hover:text-white hover:rotate-90"
                        aria-label="Close dialog"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </DialogPortal>
        );
    }
);
DialogContent.displayName = "DialogContent";

// ── DialogHeader ──────────────────────────────────────────────────────────────

export const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-1.5 mb-4", className)}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

// ── DialogFooter ──────────────────────────────────────────────────────────────

export const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
            className
        )}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

// ── DialogTitle ───────────────────────────────────────────────────────────────

export const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

// ── DialogDescription ─────────────────────────────────────────────────────────

export const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-gray-400", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

// ── DialogClose ───────────────────────────────────────────────────────────────

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export const DialogClose = ({ asChild, children, ...props }: DialogCloseProps) => {
    const { onOpenChange } = React.useContext(DialogContext);

    const handleClick = () => onOpenChange(false);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(
            children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
            { onClick: handleClick }
        );
    }

    return (
        <button type="button" onClick={handleClick} {...props}>
            {children}
        </button>
    );
};
