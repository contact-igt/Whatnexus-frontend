
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from "lucide-react";

interface ImportContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => void;
    isDarkMode: boolean;
    isLoading?: boolean;
}

export const ImportContactsModal = ({
    isOpen,
    onClose,
    onImport,
    isDarkMode,
    isLoading = false
}: ImportContactsModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string>("");

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError("");

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            validateAndSetFile(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("");
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
            setError("Please upload a valid CSV file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("File size should not exceed 5MB");
            return;
        }
        setSelectedFile(file);
    };

    const handleImport = () => {
        if (selectedFile) {
            onImport(selectedFile);
            handleReset();
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setError("");
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const downloadSampleCSV = () => {
        const csvContent = "name,phone,email,tags\nJohn Doe,+1234567890,john@example.com,VIP;Customer\nJane Smith,+0987654321,jane@example.com,Lead";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts_sample.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Import Contacts from CSV"
            description="Upload a CSV file to bulk import contacts"
            isDarkMode={isDarkMode}
            className="max-w-2xl"
            footer={
                <div className="flex items-center justify-between">
                    <button
                        onClick={downloadSampleCSV}
                        className={cn(
                            "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            isDarkMode
                                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )}
                    >
                        <Download size={14} />
                        <span>Download Sample CSV</span>
                    </button>
                    <div className="flex items-center space-x-3">
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
                            onClick={handleImport}
                            disabled={!selectedFile || isLoading}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all",
                                (!selectedFile || isLoading) && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            {isLoading ? 'Importing...' : 'Import Contacts'}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Upload Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer",
                        dragActive
                            ? (isDarkMode ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50')
                            : (isDarkMode ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-slate-300'),
                        selectedFile && (isDarkMode ? 'bg-white/5' : 'bg-slate-50')
                    )}
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center text-center">
                            {selectedFile ? (
                                <>
                                    <div className={cn(
                                        "p-3 rounded-full mb-4",
                                        isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                    )}>
                                        <CheckCircle className="text-emerald-500" size={32} />
                                    </div>
                                    <p className={cn(
                                        "text-sm font-medium mb-1",
                                        isDarkMode ? 'text-white' : 'text-slate-900'
                                    )}>
                                        {selectedFile.name}
                                    </p>
                                    <p className={cn(
                                        "text-xs",
                                        isDarkMode ? 'text-white/50' : 'text-slate-500'
                                    )}>
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleReset();
                                        }}
                                        className={cn(
                                            "mt-3 text-xs font-medium transition-all",
                                            isDarkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                                        )}
                                    >
                                        Choose different file
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className={cn(
                                        "p-3 rounded-full mb-4",
                                        isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                    )}>
                                        <Upload className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={32} />
                                    </div>
                                    <p className={cn(
                                        "text-sm font-medium mb-1",
                                        isDarkMode ? 'text-white' : 'text-slate-900'
                                    )}>
                                        Drop your CSV file here or click to browse
                                    </p>
                                    <p className={cn(
                                        "text-xs",
                                        isDarkMode ? 'text-white/50' : 'text-slate-500'
                                    )}>
                                        Maximum file size: 5MB
                                    </p>
                                </>
                            )}
                        </div>
                    </label>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={cn(
                        "flex items-start space-x-3 p-3 rounded-lg",
                        isDarkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                    )}>
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                        <p className={cn(
                            "text-sm",
                            isDarkMode ? 'text-red-400' : 'text-red-700'
                        )}>
                            {error}
                        </p>
                    </div>
                )}

                {/* Instructions */}
                <div className={cn(
                    "p-4 rounded-lg border",
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                )}>
                    <div className="flex items-start space-x-3">
                        <FileText className={isDarkMode ? 'text-white/50' : 'text-slate-500'} size={20} />
                        <div>
                            <h4 className={cn(
                                "text-sm font-semibold mb-2",
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}>
                                CSV Format Requirements
                            </h4>
                            <ul className={cn(
                                "text-xs space-y-1",
                                isDarkMode ? 'text-white/60' : 'text-slate-600'
                            )}>
                                <li>• Required columns: <code className="px-1 py-0.5 rounded bg-black/10">name</code>, <code className="px-1 py-0.5 rounded bg-black/10">phone</code></li>
                                <li>• Optional columns: <code className="px-1 py-0.5 rounded bg-black/10">email</code>, <code className="px-1 py-0.5 rounded bg-black/10">tags</code></li>
                                <li>• For multiple tags, separate them with semicolons (;)</li>
                                <li>• First row should contain column headers</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
