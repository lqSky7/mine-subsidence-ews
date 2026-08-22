"use client";

import React from "react";
import { Icon as IconifyIcon, type IconProps } from "@iconify/react";

export interface AppIconProps extends IconProps {
  className?: string;
}

export function Icon({ icon, className, ...props }: AppIconProps) {
  return <IconifyIcon icon={icon} className={className} {...props} />;
}

export default Icon;
