"use client";

const DEFAULT_NOTIFICATION_SOUND_PATH =
  process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_PATH || "/sounds/FAQ_notify.mp3";

const RAW_VOLUME = Number(
  process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_VOLUME ?? 0.6,
);

const NOTIFICATION_SOUND_VOLUME = Number.isFinite(RAW_VOLUME)
  ? Math.min(1, Math.max(0, RAW_VOLUME))
  : 0.6;

const RAW_MIN_INTERVAL = Number(
  process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_MIN_INTERVAL_MS ?? 180,
);

const MIN_PLAY_INTERVAL_MS = Number.isFinite(RAW_MIN_INTERVAL)
  ? Math.max(0, RAW_MIN_INTERVAL)
  : 180;

const MAX_AUDIO_POOL_SIZE = 3;
const SOUND_ENABLED_STORAGE_KEY = "whatsnexus.notificationSound.enabled";

type PlayOptions = {
  bypassThrottle?: boolean;
  soundPath?: string;
};

type WebkitAudioWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

let listenersBound = false;
let userInteracted = false;
let pendingPlayRequest = false;
let pendingSoundPath: string | undefined;
let lastPlayedAt = 0;
let fallbackAudioContext: AudioContext | null = null;

const audioPools = new Map<string, HTMLAudioElement[]>();

const canPlayAudio = () =>
  typeof window !== "undefined" && typeof Audio !== "undefined";

const isSoundEnabled = () => {
  if (!canPlayAudio()) return true;

  try {
    return window.localStorage.getItem(SOUND_ENABLED_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
};

const resolveSoundPath = (soundPath?: string) =>
  soundPath && soundPath.trim().length > 0
    ? soundPath
    : DEFAULT_NOTIFICATION_SOUND_PATH;

const getAudioPool = (soundPath: string) => {
  const existingPool = audioPools.get(soundPath);
  if (existingPool) return existingPool;

  const nextPool: HTMLAudioElement[] = [];
  audioPools.set(soundPath, nextPool);
  return nextPool;
};

const getAvailableAudio = (soundPath = DEFAULT_NOTIFICATION_SOUND_PATH) => {
  const resolvedSoundPath = resolveSoundPath(soundPath);
  const audioPool = getAudioPool(resolvedSoundPath);

  const existingAudio = audioPool.find((audio) => audio.paused || audio.ended);
  if (existingAudio) return existingAudio;

  if (audioPool.length < MAX_AUDIO_POOL_SIZE) {
    const nextAudio = new Audio(resolvedSoundPath);
    nextAudio.preload = "auto";
    nextAudio.volume = NOTIFICATION_SOUND_VOLUME;
    audioPool.push(nextAudio);
    return nextAudio;
  }

  const recycledAudio = audioPool[0];
  recycledAudio.pause();
  try {
    recycledAudio.currentTime = 0;
  } catch {
    recycledAudio.load();
  }
  return recycledAudio;
};

const prepareAudioForPlayback = (audio: HTMLAudioElement) => {
  audio.volume = NOTIFICATION_SOUND_VOLUME;

  try {
    if (audio.readyState >= 1) {
      audio.currentTime = 0;
    } else {
      audio.load();
    }
  } catch {
    audio.load();
  }
};

const removeUnlockListeners = () => {
  if (typeof window === "undefined") return;

  window.removeEventListener("pointerdown", onUserInteraction);
  window.removeEventListener("keydown", onUserInteraction);
  window.removeEventListener("touchstart", onUserInteraction);
};

const playFallbackBeep = () => {
  if (typeof window === "undefined") return;

  const audioWindow = window as WebkitAudioWindow;
  const AudioContextCtor =
    audioWindow.AudioContext || audioWindow.webkitAudioContext;

  if (!AudioContextCtor) return;

  const context =
    fallbackAudioContext ?? (fallbackAudioContext = new AudioContextCtor());
  if (context.state === "suspended") {
    void context.resume();
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const startAt = context.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, startAt);

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(0.05, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.12);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + 0.12);
};

const flushPendingRequest = () => {
  if (!pendingPlayRequest) return;

  const soundPath = pendingSoundPath;
  pendingPlayRequest = false;
  pendingSoundPath = undefined;
  void playNotificationSound({ bypassThrottle: true, soundPath });
};

function onUserInteraction() {
  userInteracted = true;
  removeUnlockListeners();

  const primedAudio = getAvailableAudio();
  primedAudio.load();

  flushPendingRequest();
}

const bindUnlockListeners = () => {
  if (!canPlayAudio() || listenersBound || userInteracted) return;

  listenersBound = true;

  window.addEventListener("pointerdown", onUserInteraction, { passive: true });
  window.addEventListener("keydown", onUserInteraction);
  window.addEventListener("touchstart", onUserInteraction, { passive: true });
};

const isAutoplayBlockedError = (error: unknown) =>
  error instanceof DOMException && error.name === "NotAllowedError";

export const initializeNotificationSound = () => {
  if (!canPlayAudio()) return;

  bindUnlockListeners();

  const audio = getAvailableAudio();
  audio.preload = "auto";
  audio.load();
};

export const playNotificationSound = async (
  options: PlayOptions = {},
): Promise<boolean> => {
  const { bypassThrottle = false, soundPath } = options;

  if (!canPlayAudio() || !isSoundEnabled()) return false;

  bindUnlockListeners();

  const now = Date.now();
  if (!bypassThrottle && now - lastPlayedAt < MIN_PLAY_INTERVAL_MS) {
    return false;
  }

  lastPlayedAt = now;

  const resolvedSoundPath = resolveSoundPath(soundPath);
  const audio = getAvailableAudio(resolvedSoundPath);

  try {
    prepareAudioForPlayback(audio);
    await audio.play();
    return true;
  } catch (error) {
    if (isAutoplayBlockedError(error) && !userInteracted) {
      pendingPlayRequest = true;
      pendingSoundPath = resolvedSoundPath;
      return false;
    }

    playFallbackBeep();
    return false;
  }
};

export const setNotificationSoundEnabled = (enabled: boolean) => {
  if (!canPlayAudio()) return;

  try {
    window.localStorage.setItem(SOUND_ENABLED_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore storage write failures to keep notifications non-blocking.
  }
};

export const getNotificationSoundPath = () => DEFAULT_NOTIFICATION_SOUND_PATH;