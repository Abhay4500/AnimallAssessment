'use client';

import { useCallback, useEffect, useRef } from 'react';

const TRACKS = [
    '/audio/scott-buckley-moonlight%20(1).mp3',
    '/audio/sb_adriftamonginfinitestars.mp3',
    '/audio/Moon-Waltz.mp3',
    '/audio/After-the-Rain-Inspiring-Atmospheric-Music.mp3'
];

export default function useAmbientMusic(isPlaying: boolean) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const trackIndexRef = useRef(0);

    const ensureAudioReady = useCallback(async (): Promise<boolean> => {
        if (typeof window === 'undefined' || TRACKS.length === 0) {
            return false;
        }

        if (!audioRef.current) {
            const audio = new window.Audio(TRACKS[trackIndexRef.current]);
            audio.volume = 0.45;
            audio.preload = 'auto';

            audio.addEventListener('ended', () => {
                trackIndexRef.current = (trackIndexRef.current + 1) % TRACKS.length;
                audio.src = TRACKS[trackIndexRef.current];
                audio.play().catch(() => {});
            });

            audioRef.current = audio;
        }

        try {
            await audioRef.current.play();
            return true;
        } catch (error) {
            console.error('Unable to start ambient music.', error);
            return false;
        }
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }

        if (isPlaying) {
            audio.play().catch(() => {});
            return;
        }

        audio.pause();
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (!audioRef.current) {
                return;
            }

            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
            audioRef.current.load();
            audioRef.current = null;
        };
    }, []);

    return ensureAudioReady;
}
