"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode: boolean;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  isDarkMode?: boolean;
}>({
  value: "",
  onValueChange: () => {},
});

export const Tabs = ({
  defaultValue,
  value: propValue,
  onValueChange: propOnValueChange,
  children,
  className,
}: TabsProps) => {
  const [value, setValue] = React.useState(propValue || defaultValue);

  const onValueChange = React.useCallback(
    (val: string) => {
      setValue(val);
      propOnValueChange?.(val);
    },
    [propOnValueChange]
  );

  React.useEffect(() => {
    if (propValue) setValue(propValue);
  }, [propValue]);

  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className, isDarkMode }: TabsListProps) => {
  return (
    <div
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-2xl p-1 mb-8 border",
        isDarkMode ? "bg-white/[0.03] border-white/5" : "bg-slate-100 border-slate-200",
        className
      )}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        "relative flex items-center justify-center px-6 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 outline-none",
        isSelected
          ? "text-white"
          : "text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/60",
        className
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const { value: selectedValue } = React.useContext(TabsContext);

  return (
    <AnimatePresence mode="wait">
      {selectedValue === value && (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.99 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn("w-full", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
