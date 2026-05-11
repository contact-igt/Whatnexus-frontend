"use client";
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Smile, Paperclip, Mic, Send, X, FileText, Film, Music, Image as ImageIcon, FileAudio, Trash2, StopCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

const MAX_FILES = 10;

// ── Emoji data ────────────────────────────────────────────────────────────────
const EMOJI_TABS = [
    { label: '😀', title: 'Smileys',    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','😐','😑','😶','😏','😒','🙄','😬','🤥','😔','😪','😴','😷','🤒','🤕','🥴','🤢','🤧','🥵','🥶','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐'] },
    { label: '👍', title: 'Gestures',   emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍','💅','🤳','💪','🦾','🦵','🦶','👂','🦻','👃','👶','🧒','👦','👧','🧑','👱','👩','👨','🧔','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷'] },
    { label: '❤️', title: 'Hearts',     emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','♾️','💯','💢','💥','💫','💦','💨','🕳','💬','💭','🗯','💤','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔲','🔳','⬛','⬜'] },
    { label: '🐶', title: 'Animals',    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐟','🐠','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍'] },
    { label: '🍕', title: 'Food',       emojis: ['🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍑','🍒','🥭','🍍','🥥','🥝','🍅','🥑','🍆','🥔','🥕','🌽','🌶','🫑','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🧀','🍖','🍗','🍔','🍟','🌭','🍕','🥪','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥗','🍱','🍘','🍣','🍤','🍜','🍝','🍛','🍚','🍙','🍥','🍡'] },
    { label: '⚽', title: 'Activities', emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🥅','⛳','🏹','🎣','🤿','🥊','🥋','🛹','🛷','🏋','🤼','🤸','⛹','🤺','🤾','🏇','🏊','🧘','🧗','🚴','🏆','🥇','🥈','🥉','🏅','🎖','🎪','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎮','🕹','🎲','🎯','🎳'] },
    { label: '🚀', title: 'Travel',     emojis: ['🚗','🚕','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍','🛵','🚲','🛴','🚁','🛸','🚀','✈️','🛩','🪂','⛵','🚢','🛳','🚂','🚃','🚄','🚅','🚇','🚉','🚊','🚝','🚞','🗺','🏔','⛰','🌋','🗻','🏕','🏖','🏜','🏝','🏞','🏟','🏛','🏗','🧱','🏘','🏚','🏠','🏡','🏢','🏣','🏤','🏥'] },
] as const;

// ── Attachment type definitions ───────────────────────────────────────────────
const ATTACH_OPTIONS = [
    { id: 'document', label: 'Document',          icon: FileText,  color: 'bg-[#5157ae]', accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt' },
    { id: 'photos',   label: 'Photos & Videos',   icon: ImageIcon, color: 'bg-[#bf59cf]', accept: 'image/*,video/mp4,video/webm' },
    { id: 'audio',    label: 'Audio',              icon: FileAudio, color: 'bg-[#d3396d]', accept: '.mp3,.wav,.ogg,.m4a,.aac,audio/*' },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getFileCategory(file: File): 'image' | 'video' | 'audio' | 'document' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
}

function fmtTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

// ── File preview ──────────────────────────────────────────────────────────────
const FilePreview: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
    const category = getFileCategory(file);
    const objectUrl = React.useMemo(() => category === 'image' ? URL.createObjectURL(file) : null, [file, category]);
    React.useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

    return (
        <div className="relative flex-shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden bg-[#1d282f]">
            {category === 'image' && objectUrl
                ? <img src={objectUrl} alt={file.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                    {category === 'video'    && <Film     size={22} className="text-blue-400"    />}
                    {category === 'audio'    && <Music    size={22} className="text-purple-400"  />}
                    {category === 'document' && <FileText size={22} className="text-emerald-400" />}
                    <span className="text-[9px] font-bold uppercase tracking-wide text-white/40 px-1 truncate w-full text-center">
                        {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                </div>
            }
            <button onClick={onRemove} className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors">
                <X size={10} className="text-white" />
            </button>
        </div>
    );
};

// ── Emoji picker ──────────────────────────────────────────────────────────────
const EmojiPicker: React.FC<{ onSelect: (e: string) => void; isDarkMode: boolean }> = ({ onSelect, isDarkMode }) => {
    const [tab, setTab] = useState(0);
    return (
        <div className={cn(
            "absolute bottom-full left-0 mb-2 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col w-[320px] h-[300px]",
            isDarkMode ? "bg-[#233138] border border-white/5" : "bg-white border border-black/5"
        )}>
            <div className={cn("flex items-center gap-0.5 px-2 pt-2 pb-1 border-b shrink-0", isDarkMode ? "border-white/5" : "border-black/5")}>
                {EMOJI_TABS.map((t, i) => (
                    <button key={i} onClick={() => setTab(i)} title={t.title}
                        className={cn("w-9 h-8 rounded-lg text-base flex items-center justify-center transition-colors",
                            tab === i ? (isDarkMode ? "bg-white/10" : "bg-[#f0f2f5]") : (isDarkMode ? "hover:bg-white/5" : "hover:bg-[#f5f6f6]")
                        )}>
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-8 gap-0.5 content-start">
                {EMOJI_TABS[tab].emojis.map((emoji) => (
                    <button key={emoji} onClick={() => onSelect(emoji)}
                        className={cn("w-8 h-8 text-xl rounded-lg flex items-center justify-center transition-colors",
                            isDarkMode ? "hover:bg-white/10" : "hover:bg-[#f0f2f5]"
                        )}>
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ── Voice waveform animation ──────────────────────────────────────────────────
const VoiceWave: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
    <div className="flex items-center gap-[3px] h-5">
        {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 1, 0.6, 0.8].map((h, i) => (
            <div
                key={i}
                className={cn("w-[3px] rounded-full", isDarkMode ? "bg-[#00a884]" : "bg-[#00a884]")}
                style={{
                    height: `${Math.round(h * 18)}px`,
                    animation: `voiceBar 0.8s ease-in-out ${(i * 0.07).toFixed(2)}s infinite alternate`,
                }}
            />
        ))}
        <style>{`
            @keyframes voiceBar {
                from { transform: scaleY(0.3); opacity: 0.5; }
                to   { transform: scaleY(1);   opacity: 1; }
            }
        `}</style>
    </div>
);

// ── Props ─────────────────────────────────────────────────────────────────────
export interface MessageInputProps {
    isDarkMode: boolean;
    message: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSendMessage: () => void;
    isPending: boolean;
    attachments?: File[];
    onAttachmentsChange?: (files: File[]) => void;
    onVoiceSend?: (file: File) => void;
}

// ── Main component ────────────────────────────────────────────────────────────
export const MessageInput: React.FC<MessageInputProps> = ({
    isDarkMode,
    message,
    handleInputChange,
    handleSendMessage,
    isPending,
    attachments = [],
    onAttachmentsChange,
    onVoiceSend,
}) => {
    const [emojiOpen,      setEmojiOpen]      = useState(false);
    const [attachMenuOpen, setAttachMenuOpen]  = useState(false);
    const [isRecording,    setIsRecording]     = useState(false);
    const [recordingSec,   setRecordingSec]    = useState(0);
    const [micError,       setMicError]        = useState<string | null>(null);

    const containerRef    = useRef<HTMLDivElement>(null);
    const textareaRef     = useRef<HTMLTextAreaElement>(null);
    const attachBtnRef    = useRef<HTMLButtonElement>(null);
    const docInputRef     = useRef<HTMLInputElement>(null);
    const photoInputRef   = useRef<HTMLInputElement>(null);
    const audioInputRef   = useRef<HTMLInputElement>(null);
    const streamRef    = useRef<MediaStream | null>(null);
    const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
    const mp3ChunksRef = useRef<Blob[]>([]);
    const mediaRecRef  = useRef<MediaRecorder | null>(null);

    const inputRefMap: Record<string, React.RefObject<HTMLInputElement | null>> = {
        document: docInputRef,
        photos:   photoInputRef,
        audio:    audioInputRef,
    };

    // Close panels on outside click
    useEffect(() => {
        if (!emojiOpen && !attachMenuOpen) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setEmojiOpen(false);
                setAttachMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [emojiOpen, attachMenuOpen]);

    // Cleanup recording on unmount
    useEffect(() => () => {
        if (timerRef.current) clearInterval(timerRef.current);
        streamRef.current?.getTracks().forEach(t => t.stop());
        if (mediaRecRef.current?.state !== 'inactive') mediaRecRef.current?.stop();
    }, []);

    // ── Emoji insert ──────────────────────────────────────────────────────────
    const handleEmojiSelect = useCallback((emoji: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart ?? message.length;
        const end   = ta.selectionEnd   ?? message.length;
        const next  = message.slice(0, start) + emoji + message.slice(end);
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        setter?.call(ta, next);
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + emoji.length;
            ta.focus();
        });
    }, [message]);

    // ── File picker ───────────────────────────────────────────────────────────
    const openFilePicker = useCallback((optionId: string) => {
        inputRefMap[optionId]?.current?.click();
        setAttachMenuOpen(false);
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        if (!selected.length) return;
        onAttachmentsChange?.([...attachments, ...selected].slice(0, MAX_FILES));
        e.target.value = "";
    }, [attachments, onAttachmentsChange]);

    const removeAttachment = useCallback((index: number) => {
        onAttachmentsChange?.(attachments.filter((_, i) => i !== index));
    }, [attachments, onAttachmentsChange]);

    // ── Voice recording ───────────────────────────────────────────────────────
    // Strategy: record with MediaRecorder (always works in any browser), then on send
    // post-process the raw audio blob:
    //   • OGG/Opus (Firefox) → send as-is, WhatsApp supports audio/ogg natively
    //   • WebM/Opus (Chrome) → decode PCM with AudioContext.decodeAudioData, then
    //     re-encode to audio/mpeg (MP3) with lamejs — WhatsApp's preferred format
    // This avoids the deprecated ScriptProcessorNode and real-time encoding race conditions.
    const startRecording = useCallback(async () => {
        setMicError(null);

        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (permErr: any) {
            const msg = permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError'
                ? 'Microphone permission denied. Allow mic access in browser settings.'
                : 'Could not access microphone. Please connect one and try again.';
            setMicError(msg);
            setTimeout(() => setMicError(null), 5000);
            return;
        }
        streamRef.current = stream;

        try {
            // Prefer OGG (WhatsApp-native, Firefox), fall back to WebM (Chrome — re-encoded to MP3 on send)
            const MIME_CANDIDATES = ['audio/ogg;codecs=opus', 'audio/webm;codecs=opus', 'audio/webm'];
            const mimeType = MIME_CANDIDATES.find(m => MediaRecorder.isTypeSupported(m)) || 'audio/webm';
            const mr = new MediaRecorder(stream, { mimeType });
            mediaRecRef.current = mr;
            mp3ChunksRef.current = [];

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) mp3ChunksRef.current.push(e.data);
            };
            mr.start(100);

            setIsRecording(true);
            setRecordingSec(0);
            timerRef.current = setInterval(() => setRecordingSec(s => s + 1), 1000);
        } catch {
            stream.getTracks().forEach(t => t.stop());
            streamRef.current = null;
            setMicError('Could not start recording. Please try again.');
            setTimeout(() => setMicError(null), 4000);
        }
    }, []);

    const stopRecording = useCallback((send: boolean) => {
        setIsRecording(false);
        setRecordingSec(0);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

        const mr = mediaRecRef.current;
        mediaRecRef.current = null;
        // Stop mic tracks inside onstop, AFTER MediaRecorder flushes its buffer.
        // Stopping the track before mr.stop() can cause the final chunk to be empty.
        const stream = streamRef.current;
        streamRef.current = null;

        if (!mr) { stream?.getTracks().forEach(t => t.stop()); return; }

        mr.onstop = () => {
            stream?.getTracks().forEach(t => t.stop());
            if (!send || mp3ChunksRef.current.length === 0) { mp3ChunksRef.current = []; return; }

            const chunks = mp3ChunksRef.current;
            mp3ChunksRef.current = [];

            // Send raw blob to backend — server transcodes audio/webm → MP3 via ffmpeg.
            const mimeType = mr.mimeType || 'audio/webm';
            const ext      = mimeType.includes('ogg') ? 'ogg' : 'webm';
            const blob     = new Blob(chunks, { type: mimeType });
            onVoiceSend?.(new File([blob], `voice-${Date.now()}.${ext}`, { type: mimeType }));
        };

        if (mr.state !== 'inactive') mr.stop();
    }, [onVoiceSend]);

    const canSend = (message.trim().length > 0 || attachments.length > 0) && !isPending;

    // Colors
    const barBg   = isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]';
    const inputBg = isDarkMode ? 'bg-[#2a3942]' : 'bg-white';
    const iconCol = isDarkMode ? 'text-[#8696a0]' : 'text-[#54656f]';
    const hoverBtn= isDarkMode ? 'hover:bg-[#374045]' : 'hover:bg-[#e9edef]';
    const textCol = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
    const phCol   = isDarkMode ? 'placeholder:text-[#8696a0]' : 'placeholder:text-[#8696a0]';

    return (
        <div ref={containerRef} className={cn("shrink-0 relative z-10", barBg)}>

            {/* Hidden file inputs */}
            <input ref={docInputRef}   type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"  onChange={handleFileChange} className="hidden" aria-hidden />
            <input ref={photoInputRef} type="file" multiple accept="image/*,video/mp4,video/webm"      onChange={handleFileChange} className="hidden" aria-hidden />
            <input ref={audioInputRef} type="file" multiple accept=".mp3,.wav,.ogg,.m4a,.aac,audio/*" onChange={handleFileChange} className="hidden" aria-hidden />

            {/* Mic permission error toast */}
            {micError && (
                <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 px-4 py-2.5 rounded-xl bg-red-500/90 text-white text-[13px] font-medium text-center shadow-lg z-50">
                    {micError}
                </div>
            )}

            {/* Attachment preview strip */}
            {attachments.length > 0 && !isRecording && (
                <div className={cn("flex gap-2 px-3 pt-3 pb-2 overflow-x-auto no-scrollbar border-b", isDarkMode ? "border-white/5" : "border-black/5")}>
                    {attachments.map((file, idx) => (
                        <FilePreview key={`${file.name}-${idx}`} file={file} onRemove={() => removeAttachment(idx)} />
                    ))}
                    {attachments.length < MAX_FILES && (
                        <button onClick={() => setAttachMenuOpen(v => !v)}
                            className={cn("flex-shrink-0 w-[72px] h-[72px] rounded-lg border-2 border-dashed flex items-center justify-center transition-colors",
                                isDarkMode ? "border-white/20 hover:border-white/40 text-white/30 hover:text-white/50" : "border-black/15 hover:border-black/30 text-black/30 hover:text-black/50"
                            )}>
                            <Paperclip size={20} />
                        </button>
                    )}
                </div>
            )}

            {/* Emoji picker */}
            {emojiOpen && !isRecording && <EmojiPicker onSelect={handleEmojiSelect} isDarkMode={isDarkMode} />}

            {/* Attachment menu */}
            {attachMenuOpen && !isRecording && (
                <div className={cn("absolute bottom-full left-12 mb-2 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[180px]",
                    isDarkMode ? "bg-[#233138] border border-white/5" : "bg-white border border-black/5"
                )}>
                    {ATTACH_OPTIONS.map((opt) => (
                        <button key={opt.id} onClick={() => openFilePicker(opt.id)}
                            className={cn("flex items-center gap-3 w-full px-4 py-3 text-[13.5px] font-medium transition-colors",
                                isDarkMode ? "text-[#e9edef] hover:bg-white/5" : "text-[#111b21] hover:bg-[#f5f6f6]"
                            )}>
                            <span className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", opt.color)}>
                                <opt.icon size={18} className="text-white" />
                            </span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── RECORDING UI ───────────────────────────────────────── */}
            {isRecording ? (
                <div className="px-2 py-2 flex items-center gap-3">

                    {/* Cancel / Trash */}
                    <button
                        onClick={() => stopRecording(false)}
                        className={cn("w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all", "bg-red-500/10 hover:bg-red-500/20")}
                        aria-label="Cancel recording"
                    >
                        <Trash2 size={20} className="text-red-500" />
                    </button>

                    {/* Waveform + timer pill */}
                    <div className={cn("flex-1 flex items-center gap-3 rounded-[10px] px-4 py-[11px] min-w-0", inputBg)}>
                        {/* Pulsing red dot */}
                        <span className="w-3 h-3 rounded-full bg-red-500 shrink-0 animate-pulse" />
                        {/* Timer */}
                        <span className={cn("text-[15px] font-mono tabular-nums shrink-0", textCol)}>
                            {fmtTime(recordingSec)}
                        </span>
                        {/* Waveform */}
                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                            <VoiceWave isDarkMode={isDarkMode} />
                        </div>
                    </div>

                    {/* Stop & Send — green circle */}
                    <button
                        onClick={() => stopRecording(true)}
                        disabled={isPending}
                        className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#06cf9c] active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-60"
                        aria-label="Send voice message"
                    >
                        {isPending
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Send size={20} className="text-white translate-x-[1px] -translate-y-[1px]" />
                        }
                    </button>
                </div>
            ) : (
            /* ── NORMAL INPUT ROW ──────────────────────────────────── */
                <div className="px-2 py-2 flex items-end gap-1.5">

                    {/* Emoji button */}
                    <button
                        onClick={() => { setEmojiOpen(v => !v); setAttachMenuOpen(false); }}
                        className={cn("p-2.5 rounded-full transition-colors shrink-0 mb-[1px]", iconCol, hoverBtn, emojiOpen && (isDarkMode ? "bg-[#374045]" : "bg-[#e9edef]"))}
                        aria-label="Emoji"
                    >
                        <Smile size={24} />
                    </button>

                    {/* Input pill */}
                    <div className={cn("flex-1 flex items-end rounded-[10px] overflow-hidden min-w-0", inputBg)}>
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={message}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (canSend) handleSendMessage();
                                }
                            }}
                            placeholder={attachments.length > 0 ? "Add a caption…" : "Type a message"}
                            className={cn("flex-1 bg-transparent py-[11px] pl-4 pr-2 text-[15px] focus:outline-none resize-none no-scrollbar leading-[1.4]", textCol, phCol)}
                            style={{ minHeight: '44px', maxHeight: '148px' }}
                        />
                        <button
                            ref={attachBtnRef}
                            onClick={() => { setAttachMenuOpen(v => !v); setEmojiOpen(false); }}
                            className={cn("p-2.5 mb-[1px] shrink-0 rounded-full transition-colors", iconCol, hoverBtn, attachMenuOpen && (isDarkMode ? "bg-[#374045]" : "bg-[#e9edef]"))}
                            aria-label="Attach"
                        >
                            <Paperclip size={22} />
                        </button>
                    </div>

                    {/* Send / Mic */}
                    <button
                        onClick={canSend ? handleSendMessage : startRecording}
                        disabled={isPending}
                        className="w-11 h-11 rounded-full bg-[#00a884] hover:bg-[#06cf9c] active:scale-95 transition-all flex items-center justify-center shrink-0 mb-[1px] disabled:opacity-60"
                        aria-label={canSend ? "Send" : "Record voice message"}
                    >
                        {isPending
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : canSend
                            ? <Send size={20} className="text-white translate-x-[1px] -translate-y-[1px]" />
                            : <Mic size={20} className="text-white" />
                        }
                    </button>
                </div>
            )}
        </div>
    );
};
