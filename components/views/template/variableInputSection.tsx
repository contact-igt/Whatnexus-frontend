"use client";

import { useState, useEffect } from 'react';
import { Hash, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { extractVariables, suggestVariablePlaceholder } from './templateUtils';

const VARIABLE_SAMPLE_MAX_LENGTH = 50;

interface VariableInputSectionProps {
    isDarkMode: boolean;
    content: string;
    headerContent?: string;
    variables: Record<string, string>;
    onVariablesChange: (variables: Record<string, string>) => void;
    variableErrors?: Record<string, any>;
    disabled?: boolean;
}

export const VariableInputSection = ({
    isDarkMode,
    content,
    headerContent = '',
    variables,
    onVariablesChange,
    variableErrors,
    disabled
}: VariableInputSectionProps) => {
    const [detectedVars, setDetectedVars] = useState<string[]>([]);

    useEffect(() => {
        const vars = extractVariables(`${headerContent || ''}\n${content || ''}`);
        setDetectedVars(vars);

        const newVariables = { ...variables };
        vars.forEach(varNum => {
            if (!newVariables[varNum]) {
                newVariables[varNum] = '';
            }
        });

        Object.keys(newVariables).forEach(key => {
            if (!vars.includes(key)) {
                delete newVariables[key];
            }
        });

        if (JSON.stringify(newVariables) !== JSON.stringify(variables)) {
            onVariablesChange(newVariables);
        }
    }, [content, headerContent]);

    const handleVariableChange = (varNum: string, value: string) => {
        onVariablesChange({
            ...variables,
            [varNum]: value.slice(0, VARIABLE_SAMPLE_MAX_LENGTH)
        });
    };

    if (detectedVars.length === 0) {
        return null;
    }

    const templateText = `${headerContent || ''}\n${content || ''}`;

    return (
        <div id="field-section-variables" className="space-y-4">
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
                    const suggestion = suggestVariablePlaceholder(templateText, varNum);

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
                                placeholder={`e.g. ${suggestion}`}
                                maxLength={VARIABLE_SAMPLE_MAX_LENGTH}
                                error={variableErrors?.[varNum]?.message}
                                disabled={disabled}
                            />
                            <div className="flex items-center justify-end mt-1.5">
                                <span className={cn("text-[10px] mr-1", isDarkMode ? 'text-white/35' : 'text-slate-500')}>
                                    {(variables[varNum] || '').length}/{VARIABLE_SAMPLE_MAX_LENGTH}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
