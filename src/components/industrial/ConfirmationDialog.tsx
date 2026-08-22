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
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

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

/**
 * Industrial SCADA-style Confirmation Dialog
 * 
 * Follows Ignition/Siemens HMI confirmation patterns:
 * - Clear action description
 * - Prominent warning/status icons
 * - Bold confirm/cancel buttons
 * - Light industrial theme
 * 
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Start Motor?"
 *   description="Motor will accelerate to setpoint speed. Ensure area is clear."
 *   confirmLabel="START MOTOR"
 *   onConfirm={() => startMotor()}
 *   variant="default"
 * />
 * ```
 */
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
  isDestructive = false,
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
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-400",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700 border-emerald-700",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-400",
      buttonColor: "bg-amber-600 hover:bg-amber-700 border-amber-700",
    },
    danger: {
      icon: XCircle,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-400",
      buttonColor: "bg-rose-600 hover:bg-rose-700 border-rose-700",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-white border-2 border-slate-400 shadow-2xl max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-4">
          {/* Icon Banner */}
          <div className={`flex items-center justify-center p-4 ${config.bgColor} border-2 ${config.borderColor} rounded-lg`}>
            <Icon className={`size-12 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <DialogTitle className="text-2xl font-bold text-center text-slate-900 font-mono uppercase tracking-wider">
            {title}
          </DialogTitle>

          {/* Description */}
          <DialogDescription className="text-center text-slate-700 font-medium text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <DialogFooter className="grid grid-cols-2 gap-3 pt-4 -mx-0 -mb-0 border-t-0 bg-transparent p-0">
          <Button
            onClick={handleCancel}
            className="h-12 bg-slate-600 hover:bg-slate-700 text-white font-bold font-mono border-2 border-slate-700 shadow-md tracking-widest"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`h-12 text-white font-bold font-mono border-2 shadow-md tracking-widest ${config.buttonColor}`}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
