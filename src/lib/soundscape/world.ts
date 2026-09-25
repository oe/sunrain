export interface SceneWorld {
  readonly browserAnimation?: boolean;
  activate(): void;
  resize(width: number, height: number, pixelRatio: number): void;
  render(time: number): void;
  setMotion?(enabled: boolean): void;
  dispose(): void;
}
