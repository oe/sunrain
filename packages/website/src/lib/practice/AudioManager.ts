import type { AudioTrack, MediaPlaylist, PracticeSettings } from '../../types/practice';

/**
 * Manages audio playback for practice sessions
 * Handles Web Audio API, background music mixing, and audio caching
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private voiceGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;

  // Audio sources
  private voiceSource: AudioBufferSourceNode | null = null;
  private musicSource: AudioBufferSourceNode | null = null;

  // Audio buffers cache
  private audioBufferCache = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer>>();

  // Playback state
  private isInitialized = false;
  private currentVoiceTrack: AudioTrack | null = null;
  private currentMusicTrack: AudioTrack | null = null;
  private isPaused = false;
  private startTime = 0;
  private pauseTime = 0;

  // Settings
  private settings: PracticeSettings = {
    voiceGuidance: { enabled: true, volume: 0.8, speed: 1.0 },
    backgroundMusic: { enabled: true, volume: 0.3 }
  };

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      // Create audio context with fallback for older browsers
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Create master gain node
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);

      // Create separate gain nodes for voice and music
      this.voiceGainNode = this.audioContext.createGain();
      this.voiceGainNode.connect(this.masterGainNode);

      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.connect(this.masterGainNode);

      // Set initial volumes
      this.updateVolumes();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Ensure audio context is ready and resumed
   */
  private async ensureAudioContextReady(): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }

  /**
   * Load audio buffer from URL with caching
   */
  private async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    // Check cache first
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Start loading
    const loadingPromise = this.doLoadAudioBuffer(url);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const buffer = await loadingPromise;
      this.audioBufferCache.set(url, buffer);
      this.loadingPromises.delete(url);
      return buffer;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Actually load the audio buffer
   */
  private async doLoadAudioBuffer(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load audio from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Preload audio tracks for better performance
   */
  async preloadAudio(tracks: AudioTrack[]): Promise<void> {
    const loadPromises = tracks.map(track =>
      this.loadAudioBuffer(track.url).catch(error => {
        console.warn(`Failed to preload ${track.name}:`, error);
        return null;
      })
    );

    await Promise.all(loadPromises);
  }

  /**
   * Play voice guidance audio
   */
  async playVoiceGuidance(track: AudioTrack): Promise<void> {
    if (!this.settings.voiceGuidance?.enabled) {
      return;
    }

    await this.ensureAudioContextReady();

    try {
      // Stop current voice if playing
      this.stopVoiceGuidance();

      // Load audio buffer
      const buffer = await this.loadAudioBuffer(track.url);

      // Create and configure source
      this.voiceSource = this.audioContext!.createBufferSource();
      this.voiceSource.buffer = buffer;
      this.voiceSource.playbackRate.value = this.settings.voiceGuidance?.speed || 1.0;

      // Apply fade in if specified
      if (track.fadeIn) {
        this.voiceGainNode!.gain.setValueAtTime(0, this.audioContext!.currentTime);
        this.voiceGainNode!.gain.linearRampToValueAtTime(
          this.settings.voiceGuidance?.volume || 0.8,
          this.audioContext!.currentTime + track.fadeIn
        );
      }

      // Connect and start
      this.voiceSource.connect(this.voiceGainNode!);
      this.voiceSource.start();

      this.currentVoiceTrack = track;

      // Handle fade out
      if (track.fadeOut && track.duration) {
        const fadeOutStart = track.duration - track.fadeOut;
        setTimeout(() => {
          if (this.voiceGainNode && this.audioContext) {
            this.voiceGainNode.gain.linearRampToValueAtTime(
              0,
              this.audioContext.currentTime + track.fadeOut!
            );
          }
        }, fadeOutStart * 1000);
      }

    } catch (error) {
      console.error('Failed to play voice guidance:', error);
      throw error;
    }
  }

  /**
   * Stop voice guidance
   */
  stopVoiceGuidance(): void {
    if (this.voiceSource) {
      try {
        this.voiceSource.stop();
      } catch (error) {
        // Source might already be stopped
      }
      this.voiceSource = null;
      this.currentVoiceTrack = null;
    }
  }

  /**
   * Play background music
   */
  async playBackgroundMusic(track: AudioTrack): Promise<void> {
    if (!this.settings.backgroundMusic?.enabled) {
      return;
    }

    await this.ensureAudioContextReady();

    try {
      // Stop current music if playing
      this.stopBackgroundMusic();

      // Load audio buffer
      const buffer = await this.loadAudioBuffer(track.url);

      // Create and configure source
      this.musicSource = this.audioContext!.createBufferSource();
      this.musicSource.buffer = buffer;
      this.musicSource.loop = track.loop;

      // Apply fade in if specified
      if (track.fadeIn) {
        this.musicGainNode!.gain.setValueAtTime(0, this.audioContext!.currentTime);
        this.musicGainNode!.gain.linearRampToValueAtTime(
          this.settings.backgroundMusic?.volume || 0.3,
          this.audioContext!.currentTime + track.fadeIn
        );
      }

      // Connect and start
      this.musicSource.connect(this.musicGainNode!);
      this.musicSource.start();

      this.currentMusicTrack = track;

    } catch (error) {
      console.error('Failed to play background music:', error);
      throw error;
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (this.musicSource) {
      try {
        // Apply fade out if current track has it
        if (this.currentMusicTrack?.fadeOut && this.musicGainNode && this.audioContext) {
          this.musicGainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + this.currentMusicTrack.fadeOut
          );

          setTimeout(() => {
            if (this.musicSource) {
              this.musicSource.stop();
              this.musicSource = null;
            }
          }, this.currentMusicTrack.fadeOut * 1000);
        } else {
          this.musicSource.stop();
          this.musicSource = null;
        }
      } catch (error) {
        // Source might already be stopped
        this.musicSource = null;
      }
      this.currentMusicTrack = null;
    }
  }

  /**
   * Play a playlist with crossfading
   */
  async playPlaylist(playlist: MediaPlaylist): Promise<void> {
    if (!playlist.tracks.length) {
      return;
    }

    let currentTrackIndex = 0;
    const tracks = playlist.shuffle ? this.shuffleArray([...playlist.tracks]) : playlist.tracks;

    const playNextTrack = async () => {
      if (currentTrackIndex >= tracks.length) {
        return; // Playlist finished
      }

      const track = tracks[currentTrackIndex];
      await this.playBackgroundMusic(track);

      // Schedule next track if crossfading is enabled
      if (playlist.crossfade && currentTrackIndex < tracks.length - 1) {
        const nextTrack = tracks[currentTrackIndex + 1];
        const crossfadeTime = 3; // 3 seconds crossfade
        const scheduleTime = (track.duration - crossfadeTime) * 1000;

        setTimeout(async () => {
          // Start fading out current track
          if (this.musicGainNode && this.audioContext) {
            this.musicGainNode.gain.linearRampToValueAtTime(
              0,
              this.audioContext.currentTime + crossfadeTime
            );
          }

          // Start next track
          currentTrackIndex++;
          await playNextTrack();
        }, scheduleTime);
      } else {
        // Schedule next track normally
        setTimeout(() => {
          currentTrackIndex++;
          playNextTrack();
        }, track.duration * 1000);
      }
    };

    await playNextTrack();
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<PracticeSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.updateVolumes();

    // Update playback speed if voice is playing
    if (this.voiceSource && newSettings.voiceGuidance?.speed) {
      this.voiceSource.playbackRate.value = newSettings.voiceGuidance.speed;
    }
  }

  /**
   * Update volume levels
   */
  private updateVolumes(): void {
    if (this.voiceGainNode && this.settings.voiceGuidance) {
      this.voiceGainNode.gain.value = this.settings.voiceGuidance.enabled
        ? (this.settings.voiceGuidance.volume || 0.8)
        : 0;
    }

    if (this.musicGainNode && this.settings.backgroundMusic) {
      this.musicGainNode.gain.value = this.settings.backgroundMusic.enabled
        ? (this.settings.backgroundMusic.volume || 0.3)
        : 0;
    }
  }

  /**
   * Pause all audio
   */
  pause(): void {
    if (this.audioContext && !this.isPaused) {
      this.pauseTime = this.audioContext.currentTime;
      this.audioContext.suspend();
      this.isPaused = true;
    }
  }

  /**
   * Resume all audio
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.isPaused) {
      await this.audioContext.resume();
      this.isPaused = false;
    }
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.stopVoiceGuidance();
    this.stopBackgroundMusic();
  }

  /**
   * Get current playback state
   */
  getPlaybackState(): {
    isPlaying: boolean;
    isPaused: boolean;
    currentVoiceTrack: AudioTrack | null;
    currentMusicTrack: AudioTrack | null;
  } {
    return {
      isPlaying: !!(this.voiceSource || this.musicSource),
      isPaused: this.isPaused,
      currentVoiceTrack: this.currentVoiceTrack,
      currentMusicTrack: this.currentMusicTrack
    };
  }

  /**
   * Check if audio is supported
   */
  isAudioSupported(): boolean {
    return this.isInitialized && !!this.audioContext;
  }

  /**
   * Get audio context state
   */
  getAudioContextState(): string {
    return this.audioContext?.state || 'closed';
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioBufferCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; urls: string[] } {
    return {
      size: this.audioBufferCache.size,
      urls: Array.from(this.audioBufferCache.keys())
    };
  }

  /**
   * Shuffle array utility
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopAll();
    this.clearCache();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.masterGainNode = null;
    this.voiceGainNode = null;
    this.musicGainNode = null;
    this.isInitialized = false;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
