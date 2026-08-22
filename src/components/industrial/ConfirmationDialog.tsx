"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "warning" | "danger";
  isDestructive?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  // Icon and colors based on variant
  const variantConfig = {
    default: {
      icon: "solar:check-circle-bold-duotone",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-300 dark:border-emerald-800",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    },
    warning: {
      icon: "solar:danger-triangle-bold",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-300 dark:border-amber-800",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
    },
    danger: {
      icon: "solar:close-circle-bold-duotone",
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      borderColor: "border-rose-300 dark:border-rose-800",
      buttonColor: "bg-rose-600 hover:bg-rose-700",
    },
  };

  const config = variantConfig[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-md rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-4">
          {/* Icon Banner */}
          <div className={`flex items-center justify-center p-4 ${config.bgColor} border ${config.borderColor} rounded-xl`}>
            <Icon icon={config.icon} className={`size-12 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <DialogTitle className="text-xl font-bold text-center text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </DialogTitle>

          {/* Description */}
          <DialogDescription className="text-center text-slate-600 dark:text-slate-400 font-medium text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <DialogFooter className="grid grid-cols-2 gap-3 pt-4 border-t-0 bg-transparent p-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-10 text-xs font-semibold"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`h-10 text-xs font-bold text-white ${config.buttonColor}`}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
