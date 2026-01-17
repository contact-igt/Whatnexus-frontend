"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { GlassCard } from './shared-components';

export const VideoDemoSection = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [buffered, setBuffered] = useState(0);

    const [isDragging, setIsDragging] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    // Auto-hide controls after 3 seconds of inactivity
    useEffect(() => {
        if (isPlaying && !isHovering) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        } else {
            setShowControls(true);
        }

        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying, isHovering]);

    const handleTimeUpdate = () => {
        if (videoRef.current && !isDragging) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleProgress = () => {
        if (videoRef.current && videoRef.current.buffered.length > 0) {
            const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
            const bufferedPercent = (bufferedEnd / videoRef.current.duration) * 100;
            setBuffered(bufferedPercent);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (clientX: number) => {
        if (!progressRef.current || !videoRef.current || !duration) return;

        const rect = progressRef.current.getBoundingClientRect();
        const pos = (clientX - rect.left) / rect.width;
        const clampedPos = Math.max(0, Math.min(1, pos));

        const newTime = clampedPos * duration;

        if (Number.isFinite(newTime)) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                e.preventDefault(); // Prevent text selection
                handleSeek(e.clientX);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, duration]);

    const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        handleSeek(e.clientX);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            videoRef.current.muted = newMutedState;
            if (newMutedState) {
                setVolume(0);
            } else {
                setVolume(videoRef.current.volume || 1);
            }
        }
    };

    const toggleFullscreen = () => {
        if (!videoRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoRef.current.requestFullscreen();
        }
    };

    const changePlaybackSpeed = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackRate(speed);
            setShowSpeedMenu(false);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <section className="py-32 px-6 relative overflow-hidden bg-[#0A0A0B]">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Emerald Glow - Right Side */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse" />

                {/* Teal Glow - Left Side */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px]" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.3) 1px, transparent 0)',
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <p className="text-[#10B981] font-bold tracking-[0.2em] uppercase text-[10px] mb-3">Product Demo</p>
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-4">
                        See WhatsNexus in Action
                    </h2>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        Watch how our AI receptionist transforms customer conversations into meaningful engagements.
                    </p>
                </div>

                {/* Video Container */}
                <div className="max-w-4xl mx-auto">
                    <GlassCard className="p-4 md:p-6 relative group">
                        {/* Glowing Border Effect */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-emerald-500/50 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />

                        {/* Video Player */}
                        <div
                            className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/50 backdrop-blur-sm"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            onMouseMove={() => setIsHovering(true)}
                        >
                            {/* Video Element */}
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                poster="/placeholder-video-thumbnail.jpg"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onProgress={handleProgress}
                                onClick={togglePlay}
                            >
                                <source src="/video/demo.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>

                            {/* Custom Play Button Overlay (shows when video is not playing) */}
                            {!isPlaying && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer transition-opacity hover:bg-black/50"
                                    onClick={togglePlay}
                                >
                                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:shadow-[0_0_60px_rgba(16,185,129,0.8)] transition-all duration-300 hover:scale-110 active:scale-95">
                                        <Play size={40} className="text-white fill-white ml-2" />
                                    </div>
                                </div>
                            )}

                            {/* Custom Controls */}
                            <div
                                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-md transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                                    }`}
                            >
                                {/* Progress Bar */}
                                <div className="px-4 pt-6 pb-2">
                                    <div
                                        ref={progressRef}
                                        className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2 transition-all"
                                        onMouseDown={handleProgressMouseDown}
                                    >
                                        {/* Buffered Progress */}
                                        <div
                                            className="absolute h-full bg-white/30 rounded-full transition-all"
                                            style={{ width: `${buffered}%` }}
                                        />

                                        {/* Current Progress */}
                                        <div
                                            className="absolute h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        >
                                            {/* Progress Thumb */}
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>

                                {/* Control Buttons */}
                                <div className="flex items-center justify-between px-4 pb-4">
                                    {/* Left Controls */}
                                    <div className="flex items-center gap-4">
                                        {/* Play/Pause Button */}
                                        <button
                                            onClick={togglePlay}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
                                        >
                                            {isPlaying ? (
                                                <Pause size={20} className="text-white fill-white" />
                                            ) : (
                                                <Play size={20} className="text-white fill-white ml-0.5" />
                                            )}
                                        </button>

                                        {/* Volume Control */}
                                        <div className="flex items-center gap-2 group/volume">
                                            <button
                                                onClick={toggleMute}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                            >
                                                {isMuted || volume === 0 ? (
                                                    <VolumeX size={18} className="text-white" />
                                                ) : (
                                                    <Volume2 size={18} className="text-white" />
                                                )}
                                            </button>

                                            {/* Volume Slider */}
                                            <div className="w-0 opacity-0 group-hover/volume:w-24 group-hover/volume:opacity-100 transition-all duration-300 overflow-hidden flex items-center h-8">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Time Display */}
                                        <div className="text-white/80 text-sm font-medium tabular-nums select-none min-w-[80px]">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </div>
                                    </div>

                                    {/* Right Controls */}
                                    <div className="flex items-center gap-2">
                                        {/* Playback Speed */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 active:scale-95 relative cursor-pointer"
                                            >
                                                <Settings size={18} className="text-white" />
                                                {playbackRate !== 1 && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-[10px] font-bold flex items-center justify-center pointer-events-none">
                                                        {playbackRate}x
                                                    </span>
                                                )}
                                            </button>

                                            {/* Speed Menu */}
                                            {showSpeedMenu && (
                                                <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                                    <div className="px-3 py-2 text-xs font-bold text-white/60 border-b border-white/10">
                                                        Playback Speed
                                                    </div>
                                                    {playbackSpeeds.map((speed) => (
                                                        <button
                                                            key={speed}
                                                            onClick={() => changePlaybackSpeed(speed)}
                                                            className={`w-full px-4 py-2 text-sm font-medium text-left transition-colors ${playbackRate === speed
                                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                                : 'text-white/80 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {speed === 1 ? 'Normal' : `${speed}x`}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Fullscreen Button */}
                                        <button
                                            onClick={toggleFullscreen}
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
                                        >
                                            <Maximize size={18} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video Stats/Features Below */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            {[
                                { label: "Response Time", value: "< 1s" },
                                { label: "Accuracy", value: "99.8%" },
                                { label: "Languages", value: "50+" },
                                { label: "Uptime", value: "24/7" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="text-2xl md:text-3xl font-black text-emerald-400 mb-1">{stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Additional Info */}
                <div className="text-center mt-12">
                    <p className="text-white/30 text-sm">
                        <span className="text-emerald-400 font-bold">Pro Tip:</span> Watch with sound on to experience the full neural conversation flow
                    </p>
                </div>
            </div>
        </section>
    );
};
