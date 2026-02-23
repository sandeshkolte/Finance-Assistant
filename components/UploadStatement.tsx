'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCcw, Lock, Key } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadStatementProps {
    onSuccess: (data?: any) => void;
    isDemo?: boolean;
}

export function UploadStatement({ onSuccess, isDemo }: UploadStatementProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'awaiting-password'>('idle');
    const [errorHeader, setErrorHeader] = useState('');
    const [pendingFile, setPendingFile] = useState<{ name: string; type: string; data: Uint8Array } | null>(null);
    const [pdfPassword, setPdfPassword] = useState('');
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

                // Dynamic import to bypass build-time resolution issues with pdf-lib
                const { PDFDocument } = await import('pdf-lib');

                try {
                    const pdfDoc = await PDFDocument.load(uint8Array);
                    const base64 = Buffer.from(uint8Array).toString('base64');
                    const data = await processUpload(base64, file.type, file.name);
                    completeSuccess(data);
                } catch (loadError: any) {
                    if (loadError.message.includes('encrypted') || loadError.message.includes('password')) {
                        setPendingFile({ name: file.name, type: file.type, data: uint8Array });
                        setStatus('awaiting-password');
                    } else {
                        throw loadError;
                    }
                }
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
            if (status !== 'awaiting-password') setIsUploading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!pendingFile || !pdfPassword) return;
        setIsUploading(true);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(pendingFile.data, {
                password: pdfPassword,
                ignoreEncryption: false
            });

            const decryptedPdfBytes = await pdfDoc.save();
            const base64 = Buffer.from(decryptedPdfBytes).toString('base64');

            const data = await processUpload(base64, pendingFile.type, pendingFile.name);
            completeSuccess(data);
            setPendingFile(null);
            setPdfPassword('');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorHeader("Incorrect password or decryption failed. Please try again.");
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
            {status !== 'awaiting-password' ? (
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
            ) : (
                <div className="animate-fade-up bg-slate-900 border border-cyan-500/30 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <Lock size={14} />
                        <span className="text-[10px] font-mono tracking-widest uppercase">Password Protected</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">This PDF is encrypted. Enter password to decrypt locally.</p>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="password"
                            autoFocus
                            placeholder="File Password"
                            value={pdfPassword}
                            onChange={(e) => setPdfPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePasswordSubmit}
                            disabled={isUploading}
                            className="flex-1 bg-cyan-500 text-black font-bold py-2 rounded-xl text-xs hover:bg-cyan-400 transition-all disabled:opacity-50"
                        >
                            {isUploading ? 'Decrypting...' : 'Decrypt & Parse'}
                        </button>
                        <button
                            onClick={() => { setStatus('idle'); setPendingFile(null); setPdfPassword(''); }}
                            className="px-4 bg-white/5 text-slate-400 rounded-xl text-xs hover:bg-white/10"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

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
