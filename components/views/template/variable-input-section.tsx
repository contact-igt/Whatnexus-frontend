"use client";

import { useState, useEffect } from 'react';
import { Hash, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { extractVariables } from './template-utils';

interface VariableInputSectionProps {
    isDarkMode: boolean;
    content: string;
    variables: Record<string, string>;
    onVariablesChange: (variables: Record<string, string>) => void;
    variableErrors?: Record<string, any>;
    disabled?: boolean;
}

export const VariableInputSection = ({
    isDarkMode,
    content,
    variables,
    onVariablesChange,
    variableErrors,
    disabled
}: VariableInputSectionProps) => {
    const [detectedVars, setDetectedVars] = useState<string[]>([]);
    console.log("content1", content)
    useEffect(() => {
        const vars = extractVariables(content);
        setDetectedVars(vars);

        // Initialize variables if not already set
        const newVariables = { ...variables };
        vars.forEach(varNum => {
            if (!newVariables[varNum]) {
                newVariables[varNum] = '';
            }
        });

        // Remove variables that are no longer in content
        Object.keys(newVariables).forEach(key => {
            if (!vars.includes(key)) {
                delete newVariables[key];
            }
        });

        if (JSON.stringify(newVariables) !== JSON.stringify(variables)) {
            onVariablesChange(newVariables);
        }
    }, [content]);

    const handleVariableChange = (varNum: string, value: string) => {
        onVariablesChange({
            ...variables,
            [varNum]: value
        });
    };

    if (detectedVars.length === 0) {
        return null;
    }

    const exampleValues: Record<string, string> = {
        '1': 'John Doe',
        '2': 'Product Name',
        '3': '19th June 2025',
        '4': '10 AM IST',
        '5': 'Example Value',
    };
    console.log("variables", variables)
    console.log("detectedVars", detectedVars)
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Hash size={16} className="text-emerald-500" />
                <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Variables & Personalization
                </h3>
            </div>

            <div className={cn(
                "p-4 rounded-xl border flex items-start gap-2",
                isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'
            )}>
                <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className={cn("text-xs", isDarkMode ? 'text-blue-300' : 'text-blue-700')}>
                    Variables detected in your template. Provide example values to see how they appear in the preview.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {detectedVars.map((varNum) => {
                    return (
                        <div key={varNum}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono text-xs">
                                    {`{{${varNum}}}`}
                                </span>
                                <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Variable {varNum}
                                </span>
                            </div>
                            <Input
                                isDarkMode={isDarkMode}
                                type="text"
                                value={variables[varNum] || ''}
                                onChange={(e) => handleVariableChange(varNum, e.target.value)}
                                placeholder={exampleValues[varNum] || `Enter value for {{${varNum}}}`}
                                error={variableErrors?.[varNum]?.message}
                                disabled={disabled}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
