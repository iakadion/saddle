import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

interface PygameConfig {
  pythonPath?: string;
  width?: number;
  height?: number;
  fps?: number;
  fullscreen?: boolean;
}

const DEFAULT_PYGAME_CONFIG: Required<PygameConfig> = {
  pythonPath: 'python',
  width: 1280,
  height: 720,
  fps: 30,
  fullscreen: false,
};

function generatePygameScript(
  imagePath: string,
  config: Required<PygameConfig>,
  interactive = false
): string {
  const lines = [
    'import sys, json',
    'import pygame',
    'pygame.init()',
    `screen = pygame.display.set_mode((${config.width}, ${config.height})${config.fullscreen ? ', pygame.FULLSCREEN' : ''})`,
    'pygame.display.set_caption("DevThink WebScrape Renderer")',
    `clock = pygame.time.Clock()`,
    '',
    'try:',
    `  img = pygame.image.load(${JSON.stringify(imagePath)})`,
    '  img_rect = img.get_rect(center=(screen.get_width()//2, screen.get_height()//2))',
    'except:',
    '  img = None',
    '',
    'font = pygame.font.Font(None, 36)',
    '',
    'running = True',
    'while running:',
    '  for event in pygame.event.get():',
    '    if event.type == pygame.QUIT:',
    '      running = False',
    '    elif event.type == pygame.KEYDOWN:',
    '      if event.key == pygame.K_ESCAPE:',
    '        running = False',
    ...(interactive ? [
    '      elif event.key == pygame.K_SPACE:',
    '        print(json.dumps({"action": "next"}))',
    '        sys.stdout.flush()',
    ] : []),
    '',
    '  screen.fill((30, 30, 40))',
    '  if img:',
    '    screen.blit(img, img_rect)',
    '  else:',
    '    text = font.render("No screenshot available", True, (200, 200, 200))',
    '    screen.blit(text, (config.width//2 - text.get_width()//2, config.height//2))',
    '',
    '  pygame.display.flip()',
    '  clock.tick(30)',
    '',
    'pygame.quit()',
  ];
  return lines.join('\n');
}

function generateDoomScript(
  config: Required<PygameConfig>
): string {
  const lines = [
    'import sys, json, asyncio, subprocess',
    'import pygame',
    'pygame.init()',
    `screen = pygame.display.set_mode((${config.width}, ${config.height})${config.fullscreen ? ', pygame.FULLSCREEN' : ''})`,
    'pygame.display.set_caption("DevThink WebScrape - DOOM")',
    '',
    'font = pygame.font.Font(None, 24)',
    'small_font = pygame.font.Font(None, 18)',
    '',
    'frames = []',
    'current_frame = 0',
    'running = True',
    '',
    'def load_frames(path):',
    '  import os',
    '  frames_dir = os.path.expanduser(path)',
    '  if os.path.isdir(frames_dir):',
    '    files = sorted(os.listdir(frames_dir))',
    '    for f in files:',
    '      if f.endswith((".png", ".jpg", ".jpeg")):',
    '        try:',
    '          img = pygame.image.load(os.path.join(frames_dir, f))',
    '          frames.append(img)',
    '        except: pass',
    '',
    'load_frames("~/devthink/webscrape/doom_frames")',
    '',
    'while running:',
    '  for event in pygame.event.get():',
    '    if event.type == pygame.QUIT:',
    '      running = False',
    '    elif event.type == pygame.KEYDOWN:',
    '      if event.key == pygame.K_ESCAPE: running = False',
    '      elif event.key == pygame.K_LEFT: current_frame = max(0, current_frame - 1)',
    '      elif event.key == pygame.K_RIGHT: current_frame = min(len(frames)-1, current_frame + 1)',
    '      elif event.key == pygame.K_SPACE:',
    '        out = {"action": "frame", "index": current_frame, "total": len(frames)}',
    '        print(json.dumps(out))',
    '        sys.stdout.flush()',
    '',
    '  screen.fill((20, 20, 30))',
    '  if frames and current_frame < len(frames):',
    '    img = pygame.transform.scale(frames[current_frame], (config.width, config.height - 60))',
    '    screen.blit(img, (0, 0))',
    '  else:',
    '    text = font.render("No DOOM frames loaded", True, (200, 80, 80))',
    '    screen.blit(text, (config.width//2 - 150, config.height//2))',
    '',
    '  info = f"Frame {current_frame+1}/{len(frames)} | ESC: quit | <- ->: navigate | SPACE: capture"',
    '  info_surf = small_font.render(info, True, (180, 180, 180))',
    '  screen.blit(info_surf, (10, config.height - 40))',
    '',
    '  pygame.display.flip()',
    '  clock.tick(30)',
    '',
    'pygame.quit()',
  ];
  return lines.join('\n');
}

export class PygameRenderer {
  private config: Required<PygameConfig>;
  private process: ChildProcess | null = null;
  private tempDir: string;
  private screenDir: string;

  constructor(config: PygameConfig = {}) {
    this.config = { ...DEFAULT_PYGAME_CONFIG, ...config };
    this.tempDir = join(process.cwd(), '.webscrape');
    this.screenDir = join(this.tempDir, 'screenshots');
    if (!existsSync(this.tempDir)) mkdirSync(this.tempDir, { recursive: true });
    if (!existsSync(this.screenDir)) mkdirSync(this.screenDir, { recursive: true });
  }

  async renderScreenshot(imageBuffer: Buffer): Promise<void> {
    const imagePath = join(this.screenDir, 'current.png');
    writeFileSync(imagePath, imageBuffer);

    const script = generatePygameScript(imagePath, this.config);
    const scriptPath = join(this.tempDir, 'render_screenshot.py');
    writeFileSync(scriptPath, script);

    await this.runScript(scriptPath);
  }

  async renderDoom(): Promise<void> {
    const script = generateDoomScript(this.config);
    const scriptPath = join(this.tempDir, 'render_doom.py');
    writeFileSync(scriptPath, script);

    await this.runScript(scriptPath);
  }

  private runScript(scriptPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process = spawn(this.config.pythonPath, [scriptPath], {
        stdio: ['inherit', 'inherit', 'pipe'],
      });

      this.process.on('close', code => {
        this.process = null;
        if (code === 0) resolve();
        else reject(new Error(`Pygame exited with code ${code}`));
      });

      this.process.on('error', err => reject(err));
    });
  }

  close(): void {
    if (this.process && !this.process.killed) {
      this.process.kill();
      this.process = null;
    }
  }
}

export function createRenderer(config?: PygameConfig): PygameRenderer {
  return new PygameRenderer(config);
}
