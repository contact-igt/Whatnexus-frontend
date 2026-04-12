"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { MessageCircleQuestion, FileText } from "lucide-react";

interface CreateFaqModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { question: string; answer: string }) => void;
    isDarkMode: boolean;
    isLoading?: boolean;
}

export const CreateFaqModal = ({
    isOpen,
    onClose,
    onSubmit,
    isDarkMode,
    isLoading = false
}: CreateFaqModalProps) => {
    const [formData, setFormData] = useState({
        question: "",
        answer: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = (name: string, value: string): string => {
        if (name === "question") {
            if (!value.trim()) return "Question is required";
            if (value.trim().length < 5) return "Question must be at least 5 characters";
            if (value.length > 500) return "Question must be less than 500 characters";
        }
        if (name === "answer") {
            if (!value.trim()) return "Answer is required";
            if (value.trim().length < 5) return "Answer must be at least 5 characters";
            if (value.length > 2000) return "Answer must be less than 2000 characters";
        }
        return "";
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const questionErr = validateField("question", formData.question);
        if (questionErr) newErrors.question = questionErr;
        const answerErr = validateField("answer", formData.answer);
        if (answerErr) newErrors.answer = answerErr;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (touched[name]) {
            const err = validateField(name, value);
            setErrors((prev) => ({ ...prev, [name]: err }));
        }
    };

    const handleBlur = (name: string, value: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }));
        const err = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: err }));
    };

    const handleSubmit = () => {
        setTouched({ question: true, answer: true });
        if (validateForm()) {
            onSubmit(formData);
            handleReset();
        }
    };

    const handleReset = () => {
        setFormData({ question: "", answer: "" });
        setErrors({});
        setTouched({});
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add New FAQ"
            description="Create a new FAQ that will be published immediately and available to the AI"
            isDarkMode={isDarkMode}
            className="max-w-2xl font-sans"
            footer={
                <div className="flex items-center justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isDarkMode
                                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all",
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {isLoading ? 'Creating...' : 'Create FAQ'}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Question Field */}
                <div>
                    <label className={cn(
                        "text-xs font-semibold mb-2 block ml-1",
                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                    )}>
                        Question <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <MessageCircleQuestion className={cn(
                            "absolute left-3 top-3",
                            isDarkMode ? "text-white/30" : "text-slate-400"
                        )} size={16} />
                        <textarea
                            placeholder="Enter the frequently asked question"
                            value={formData.question}
                            onChange={(e) => handleChange("question", e.target.value)}
                            onBlur={(e) => handleBlur("question", e.target.value)}
                            rows={3}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none resize-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30',
                                errors.question && 'border-red-500'
                            )}
                        />
                    </div>
                    {errors.question && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{errors.question}</p>
                    )}
                    <p className={cn(
                        "text-xs mt-1 ml-1",
                        formData.question.length > 450
                            ? 'text-orange-500'
                            : isDarkMode ? 'text-white/40' : 'text-slate-400'
                    )}>
                        {formData.question.length}/500 characters
                    </p>
                </div>

                {/* Answer Field */}
                <div>
                    <label className={cn(
                        "text-xs font-semibold mb-2 block ml-1",
                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                    )}>
                        Answer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FileText className={cn(
                            "absolute left-3 top-3",
                            isDarkMode ? "text-white/30" : "text-slate-400"
                        )} size={16} />
                        <textarea
                            placeholder="Enter the answer to this question"
                            value={formData.answer}
                            onChange={(e) => handleChange("answer", e.target.value)}
                            onBlur={(e) => handleBlur("answer", e.target.value)}
                            rows={6}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none resize-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30',
                                errors.answer && 'border-red-500'
                            )}
                        />
                    </div>
                    {errors.answer && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{errors.answer}</p>
                    )}
                    <p className={cn(
                        "text-xs mt-1 ml-1",
                        formData.answer.length > 1800
                            ? 'text-orange-500'
                            : isDarkMode ? 'text-white/40' : 'text-slate-400'
                    )}>
                        {formData.answer.length}/2000 characters
                    </p>
                </div>
            </div>
        </Modal>
    );
};
