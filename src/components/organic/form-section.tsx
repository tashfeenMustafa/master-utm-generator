import * as React from "react"
import { cn } from "@/lib/utils"

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function FormSection({ 
  step, 
  title, 
  description, 
  children, 
  className, 
  ...props 
}: FormSectionProps) {
  return (
    <div 
      className={cn(
        "space-y-4 rounded-xl border border-indigo-100 bg-white p-5 sm:p-6 shadow-sm", 
        className
      )} 
      {...props}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm sm:text-base">
          {step}
        </div>
        <div className="space-y-1 mt-0.5 sm:mt-1">
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-indigo-950 uppercase">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500">
            {description}
          </p>
        </div>
      </div>
      <div className="pl-10 sm:pl-12 pt-2 space-y-5">
        {children}
      </div>
    </div>
  )
}
