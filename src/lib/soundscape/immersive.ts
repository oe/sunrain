import './immersive.css';
import { createScene } from './scene';

export interface RoomOptions {
  labels: Record<string, string>;
  sounds: () => string[];
  title: () => string;
  stop: () => void;
  volume: (value: number) => void;
  getVolume: () => number;
  onExit: () => void;
  canEnter: () => boolean;
}
export function createRoom(options: RoomOptions) {
  const { labels } = options;
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');
  const normalHint = () => (mouse.matches ? labels.hint : labels.touchHint);
  const lockedHint = () =>
    mouse.matches ? labels.lockedHint : labels.lockedTouchHint;
  const dialog = document.createElement('dialog');
  dialog.className = 'sound-room';
  dialog.tabIndex = -1;
  dialog.ariaLabel = labels.enter;
  const stage = document.createElement('div');
  stage.className = 'room-stage';
  const canvas = document.createElement('canvas');
  canvas.ariaHidden = 'true';
  const vignette = document.createElement('div');
  vignette.className = 'room-vignette';
  const header = document.createElement('div');
  header.className = 'room-header';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'room-eyebrow';
  eyebrow.textContent = labels.eyebrow;
  const title = document.createElement('h2');
  title.className = 'room-title';
  const hint = document.createElement('p');
  hint.className = 'room-hint';
  hint.textContent = normalHint();
  header.append(eyebrow, title, hint);
  const controls = document.createElement('div');
  controls.className = 'room-controls';
  const message = document.createElement('p');
  message.className = 'room-message';
  message.setAttribute('role', 'status');
  function button(text: string, action: () => void) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', action);
    return b;
  }
  let scene: Awaited<ReturnType<typeof createScene>> | undefined;
  let locked = false,
    hideTimer = 0,
    openedAt = 0;
  let previous: { x: number; y: number; time: number } | undefined;
  let motionStart = 0,
    distance = 0;
  let origin: HTMLElement | null = null;
  let bodyOverflow = '',
    openRevision = 0;
  function reveal() {
    dialog.classList.remove('controls-hidden');
    clearTimeout(hideTimer);
    if (!controls.contains(document.activeElement))
      hideTimer = window.setTimeout(
        () => dialog.classList.add('controls-hidden'),
        5500
      );
  }
  function exit() {
    ++openRevision;
    if (!dialog.open) return;
    if (document.fullscreenElement === stage)
      void document.exitFullscreen().catch(() => {});
    dialog.close();
    dialog.classList.remove('ready');
    scene?.dispose();
    scene = undefined;
    clearTimeout(hideTimer);
    document.body.style.overflow = bodyOverflow;
    origin?.focus({ preventScroll: true });
    options.onExit();
  }
  const exitButton = button(labels.exit, exit);
  const stopButton = button(labels.stop, () => {
    options.stop();
    exit();
  });
  const fullButton = button(labels.fullscreen, async () => {
    try {
      if (document.fullscreenElement === stage) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch {
      message.textContent = labels.fullscreenError;
      reveal();
    }
  });
  fullButton.hidden = !document.fullscreenEnabled;
  const lockButton = button(labels.lock, () => {
    locked = !locked;
    lockButton.textContent = locked ? labels.unlock : labels.lock;
    lockButton.ariaPressed = String(locked);
    dialog.classList.toggle('locked', locked);
    hint.textContent = locked ? lockedHint() : normalHint();
    previous = undefined;
    distance = 0;
    reveal();
    if (locked) lockButton.focus();
  });
  lockButton.className = 'room-lock';
  lockButton.ariaPressed = 'false';
  const volumeLabel = document.createElement('label');
  volumeLabel.className = 'room-volume';
  volumeLabel.textContent = labels.volume;
  const volume = document.createElement('input');
  volume.type = 'range';
  volume.min = '0';
  volume.max = '1';
  volume.step = '.01';
  volume.value = '1';
  volume.ariaLabel = labels.volume;
  volume.addEventListener('input', () => options.volume(Number(volume.value)));
  volumeLabel.append(volume);
  controls.append(exitButton, stopButton, fullButton, volumeLabel);
  stage.append(canvas, vignette, header, controls, lockButton, message);
  dialog.append(stage);
  document.body.append(dialog);
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    exit();
  });
  dialog.addEventListener('pointerdown', reveal);
  dialog.addEventListener('focusin', reveal);
  dialog.addEventListener('focusout', () => setTimeout(reveal, 0));
  dialog.addEventListener('keydown', reveal);
  dialog.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const now = performance.now();
    if (
      locked ||
      now - openedAt < 1200 ||
      (e.target as Element).closest('button,input,.room-controls')
    ) {
      previous = undefined;
      distance = 0;
      reveal();
      return;
    }
    if (previous) {
      const elapsed = now - previous.time;
      const delta = Math.hypot(e.clientX - previous.x, e.clientY - previous.y);
      if (elapsed > 150 || now - motionStart > 350) {
        motionStart = now;
        distance = 0;
      }
      if (elapsed > 0 && delta / elapsed > 0.7) distance += delta;
      if (distance > 240) {
        exit();
        return;
      }
    } else {
      motionStart = now;
      distance = 0;
    }
    previous = { x: e.clientX, y: e.clientY, time: now };
    reveal();
  });
  const fullscreenChange = () => {
    fullButton.textContent =
      document.fullscreenElement === stage
        ? labels.exitFullscreen
        : labels.fullscreen;
    previous = undefined;
  };
  document.addEventListener('fullscreenchange', fullscreenChange);
  return {
    async open() {
      if (dialog.open) return;
      const revision = ++openRevision;
      const prepared = await createScene(canvas, options.sounds);
      if (revision !== openRevision || !options.canEnter()) {
        prepared.dispose();
        return;
      }
      scene = prepared;
      origin =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      locked = false;
      dialog.classList.remove('locked', 'controls-hidden');
      lockButton.textContent = labels.lock;
      lockButton.ariaPressed = 'false';
      hint.textContent = normalHint();
      volume.value = String(options.getVolume());
      message.textContent = '';
      previous = undefined;
      distance = 0;
      openedAt = performance.now();
      title.textContent = options.title();
      dialog.showModal();
      dialog.focus({ preventScroll: true });

      requestAnimationFrame(() => dialog.classList.add('ready'));
      reveal();
    },
    update() {
      title.textContent = options.title();
      scene?.update();
      if (!options.sounds().length) exit();
    },
    exit,
    get active() {
      return dialog.open;
    },
    dispose() {
      exit();
      document.removeEventListener('fullscreenchange', fullscreenChange);
      dialog.remove();
    }
  };
}
