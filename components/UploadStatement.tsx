'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadStatementProps {
    onSuccess: (data?: any) => void;
    isDemo?: boolean;
}

export function UploadStatement({ onSuccess, isDemo }: UploadStatementProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorHeader, setErrorHeader] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processUpload = async (fileDataString: string, mimeType: string, filename: string) => {
        const endpoint = isDemo ? '/api/demo' : '/api/upload-csv';
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename,
                mimeType,
                fileData: fileDataString,
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return data;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setStatus('idle');
        setErrorHeader('');

        try {
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const base64 = Buffer.from(uint8Array).toString('base64');
                const data = await processUpload(base64, file.type, file.name);
                completeSuccess(data);
            } else {
                const text = await file.text();
                const data = await processUpload(text, file.type, file.name);
                completeSuccess(data);
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorHeader(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const completeSuccess = (data: any) => {
        setStatus('success');
        setTimeout(() => {
            setStatus('idle');
            onSuccess(data);
        }, 1500);
    };

    return (
        <div className="relative w-full max-w-xs">
            <label
                className={clsx(
                    "flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:border-cyan-500/50 hover:text-white group",
                    isUploading && "pointer-events-none opacity-50",
                    status === 'success' && "border-green-500/50 bg-green-500/10 text-green-400",
                    status === 'error' && "border-red-500/50 bg-red-500/10 text-red-400"
                )}
            >
                <input
                    type="file"
                    accept=".csv,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    ref={fileInputRef}
                />

                {isUploading ? (
                    <RefreshCcw size={18} className="animate-spin text-cyan-400" />
                ) : status === 'success' ? (
                    <CheckCircle2 size={18} className="text-green-400" />
                ) : status === 'error' ? (
                    <AlertCircle size={18} className="text-red-400" />
                ) : (
                    <FileText size={18} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                )}

                <span>
                    {isUploading ? 'Engine Parsing...' :
                        status === 'success' ? 'Report Ready' :
                            status === 'error' ? 'Failed' :
                                'Select Statement'}
                </span>
            </label>

            {status === 'error' && (
                <div className="absolute right-0 top-full mt-3 w-72 rounded-xl border border-red-500/20 bg-black/90 backdrop-blur-xl p-3 text-[11px] text-red-400 shadow-2xl z-50 animate-fade-up">
                    <div className="flex gap-2">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{errorHeader}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
