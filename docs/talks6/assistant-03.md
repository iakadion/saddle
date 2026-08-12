# assistant

[Thinking] The user is asking a very complex question about using memory/storage from various platforms (GitHub, GitLab, Gitea, Forgejo, HuggingFace, Kaggle, ModelScope, etc.) to create a sandbox container platform that can run Linux, Docker, with RAM and storage, using free infrastructure from these platforms.
They want me to research 40 searches and provide a step-by-step implementation plan. This is a very ambitious project - essentially they want to build a cloud sandbox platform using free resources from various platforms.
Let me break down the key concepts:

Using storage from repos/buckets as both storage and RAM (memory conversion)

Using CI/CD pipelines from GitHub, GitLab, Gitea, Forgejo to run sandboxes

Building on Docker, Linux, and container technology

Converting storage into RAM through virtual memory and memory emulation

Leveraging free npm packages, CDNs like jsdelivr and esm.sh

Integrating database ORMs like Drizzle, Prisma, and MySQL2

Deploying across platforms like Vercel, Netlify, HuggingFace Spaces, and Kaggle


This is extremely ambitious, so I need to research how to use CI/CD pipelines as compute resources, convert storage to memory, and leverage these free platforms effectively.
I'm also looking into container sandboxes, memory emulation, open source projects that could help, npm packages for virtual memory, and database ORMs as storage layers, plus infrastructure options like Docker and Linux on free tiers.
The user wants 40 searches with a todo list and full implementation, but I'm in plan mode right now, so I need to research and build a comprehensive plan first.

[Thinking] Now let me start the research. I'll use multiple search agents in parallel to gather information.

[Thinking] I now have comprehensive research on all 6 major topics. Let me update the todo list and compile the final implementation plan. Let me also search for a few more specific topics to fill in gaps.

[Thinking] Now I need to compile all the research into a comprehensive implementation plan. Let me organize this into a clear, actionable plan.

[Thinking] The research is complete and I've provided a comprehensive implementation plan. Let me give a concise summary to the user.

Entendi seu projeto ambicioso. Vou pesquisar e criar um plano detalhado para essa plataforma de sandbox usando infraestrutura gratuita. Deixe-me fazer as buscas necessárias.

Iniciando as pesquisas. Vou buscar informações sobre todas as tecnologias e abordagens relevantes.

Excelente! As pesquisas estão completas. Vou agora compilar o plano completo de implementação.

PLANO COMPLETO: Plataforma de Sandbox com Infraestrutura Gratuita
VISÃO GERAL DO SISTEMA
┌─────────────────────────────────────────────────────────────────┐
│                    ZAI SANDBOX PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  CONTROL      │  │  COMPUTE     │  │  STORAGE/MEMORY      │  │
│  │  PLANE        │  │  LAYER       │  │  LAYER               │  │
│  │              │  │              │  │                      │  │
│  │  Cloudflare  │  │  GitHub      │  │  Cloudflare R2/KV    │  │
│  │  Workers     │  │  Actions     │  │  + tmpfs/zram        │  │
│  │  (orchestra- │  │  (4CPU/16GB) │  │  + SQLite/libSQL     │  │
│  │  tor)        │  │              │  │  + memfs/mmap        │  │
│  │              │  │  GitLab CI   │  │  + GitHub Artifacts   │  │
│  │  Vercel/     │  │  (2CPU/8GB)  │  │  + HuggingFace       │  │
│  │  Netlify     │  │              │  │  + Kaggle datasets   │  │
│  │  (API routes)│  │  Oracle Cloud│  │  + npm CDN           │  │
│  │              │  │  (2OCPU/12GB)│  │  (jsDelivr/esm.sh)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              SANDBOX ISOLATION LAYERS                    │  │
│  │  gVisor (user-space kernel) + cgroups v2 + seccomp      │  │
│  │  + AppArmor + OverlayFS + Podman rootless               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MEMORY HYBRID LAYER                        │  │
│  │  RAM (real) + zram (compressed) + swap + tmpfs          │  │
│  │  + mmap (storage->memory bridge) + SQLite VFS           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

FASE 1: ESTRUTURA DO PROJETO
1.1 Layout do Repositório
zai-sandbox/
├── packages/
│   ├── core/                    # Core sandbox engine (TypeScript)
│   │   ├── src/
│   │   │   ├── sandbox/
│   │   │   │   ├── manager.ts       # Sandbox lifecycle manager
│   │   │   │   ├── isolate.ts       # gVisor/process isolation
│   │   │   │   ├── resources.ts     # cgroups v2 resource limits
│   │   │   │   └── snapshot.ts      # Snapshot/restore (Firecracker style)
│   │   │   ├── memory/
│   │   │   │   ├── hybrid.ts        # RAM + zram + swap + tmpfs bridge
│   │   │   │   ├── mmap-bridge.ts   # mmap storage->memory conversion
│   │   │   │   ├── vfs.ts           # Virtual filesystem (memfs)
│   │   │   │   └── sqlite-vfs.ts    # SQLite-backed persistent VFS
│   │   │   ├── storage/
│   │   │   │   ├── r2.ts            # Cloudflare R2 object storage
│   │   │   │   ├── github-artifacts.ts
│   │   │   │   ├── huggingface.ts   # HuggingFace datasets
│   │   │   │   └── npm-cdn.ts       # jsDelivr/esm.sh loader
│   │   │   ├── orchestrator/
│   │   │   │   ├── github-actions.ts
│   │   │   │   ├── gitlab-ci.ts
│   │   │   │   ├── forgejo.ts
│   │   │   │   └── gitea.ts
│   │   │   ├── db/
│   │   │   │   ├── schema.ts        # Drizzle ORM schema
│   │   │   │   ├── turso.ts         # libSQL/Turso client
│   │   │   │   └── migrations/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── worker/                  # Sandbox worker process
│   │   ├── src/
│   │   │   ├── runner.ts        # Code execution runner
│   │   │   ├── shell.ts         # Linux shell emulation
│   │   │   └── network.ts       # Network isolation
│   │   └── package.json
│   └── web/                     # Web interface
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── lib/
│       └── package.json
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.worker
│   │   ├── Dockerfile.gvisor
│   │   └── docker-compose.yml
│   ├── k8s/
│   │   ├── sandbox-pod.yaml
│   │   ├── gvisor-runtimeclass.yaml
│   │   └── resource-quota.yaml
│   └── scripts/
│       ├── setup-gvisor.sh
│       ├── setup-cgroups.sh
│       └── setup-zram.sh
├── .github/
│   └── workflows/
│       ├── sandbox-compute.yml    # GitHub Actions como compute
│       ├── build-deploy.yml
│       └── cron-sandbox.yml
├── .gitlab-ci.yml
├── .forgejo/workflows/
│   └── sandbox.yml
├── package.json                  # Monorepo root
├── turbo.json
└── README.md

FASE 2: MEMÓRIA HIBRIDA (Storage ↔ RAM)
2.1 Configuração do Sistema (Linux)
# === /infra/scripts/setup-zram.sh ===
#!/bin/bash

# Criar zram para RAM comprimida (50% da RAM real = ~2x efetiva)
modprobe zram num_devices=1
zramctl /dev/zram0 --algorithm zstd --size 8G
mkswap -U clear /dev/zram0
swapon --discard --priority 100 /dev/zram0

# Configurar tmpfs para /tmp (armazenamento rápido = "RAM virtual")
mount -t tmpfs -o size=4G,mode=1777,noexec,nosuid,nodev tmpfs /tmp

# Configurar sysctl para otimizar swap
cat >> /etc/sysctl.d/99-zai-memory.conf << 'EOF'
vm.swappiness=180
vm.watermark_boost_factor=0
vm.watermark_scale_factor=125
vm.page-cluster=0
vm.overcommit_memory=1
EOF
sysctl -p /etc/sysctl.d/99-zai-memory.conf

echo "Memory bridge configurado: zram(8G) + tmpfs(4G)"
2.2 Bridge Storage→RAM (Node.js)
// packages/core/src/memory/hybrid.ts

import { Volume } from 'memfs';
import { createClient } from '@libsql/client';
import * as mmap from 'mmap-io';
import * as fs from 'fs';

interface MemoryTier {
  name: string;
  type: 'ram' | 'zram' | 'tmpfs' | 'mmap' | 'sqlite' | 'r2';
  size: number;
  speed: number; // ns per access
}

interface SandboxMemory {
  // Tier 1: RAM real (microseconds)
  ram: Volume;
  
  // Tier 2: zram comprimido (RAM*2 efetiva)
  zram: string; // /dev/zram0 mount point
  
  // Tier 3: tmpfs no disco (memória virtual)
  tmpfs: string; // /tmp mount point
  
  // Tier 4: mmap storage→memory bridge
  mmapBridge: Map<string, mmap.MappedBuffer>;
  
  // Tier 5: SQLite VFS (persistente)
  sqliteVfs: any;
  
  // Tier 6: Object storage (R2/Artifacts)
  remoteStorage: any;
}

export class HybridMemoryManager {
  private tiers: MemoryTier[] = [
    { name: 'ram',     type: 'ram',    size: 16 * 1024 * 1024 * 1024, speed: 100 },
    { name: 'zram',    type: 'zram',   size: 8 * 1024 * 1024 * 1024,  speed: 500 },
    { name: 'tmpfs',   type: 'tmpfs',  size: 4 * 1024 * 1024 * 1024,  speed: 1000 },
    { name: 'mmap',    type: 'mmap',   size: 50 * 1024 * 1024 * 1024, speed: 5000 },
    { name: 'sqlite',  type: 'sqlite', size: 100 * 1024 * 1024 * 1024, speed: 10000 },
    { name: 'r2',      type: 'r2',     size: 10 * 1024 * 1024 * 1024,  speed: 50000 },
  ];

  private memfsVolume = Volume.fromJSON({});
  private mmapBuffers = new Map<string, any>();

  async init(): Promise<void> {
    // Mount tmpfs se disponível
    try {
      if (!fs.existsSync('/tmp/zai-sandbox')) {
        fs.mkdirSync('/tmp/zai-sandbox', { recursive: true });
      }
    } catch (e) {
      console.warn('tmpfs não disponível, usando RAM apenas');
    }
  }

  // Bridge: converte arquivo de storage em RAM via mmap
  async bridgeToMemory(filePath: string): Promise<Buffer> {
    const stat = fs.statSync(filePath);
    const fd = fs.openSync(filePath, 'r');
    
    // mmap converte disco → memória mapeada
    const buffer = mmap.map(
      stat.size,
      mmap.PROT_READ | mmap.PROT_WRITE,
      mmap.MAP_SHARED,
      fd,
      0
    );
    
    this.mmapBuffers.set(filePath, { buffer, fd, size: stat.size });
    return buffer;
  }

  // Bridge: converte dados em RAM para persistência SQLite
  async persistToSQLite(key: string, data: Buffer): Promise<void> {
    const db = await createClient({ url: ':memory:' });
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sandbox_files (
        key TEXT PRIMARY KEY,
        data BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute({
      sql: 'INSERT OR REPLACE INTO sandbox_files (key, data) VALUES (?, ?)',
      args: [key, data]
    });
  }

  // Bridge: converte SQLite → RAM (carrega em memfs)
  async loadFromSQLite(key: string): Promise<Buffer | null> {
    const db = await createClient({ url: ':memory:' });
    const result = await db.execute({
      sql: 'SELECT data FROM sandbox_files WHERE key = ?',
      args: [key]
    });
    if (result.rows.length > 0) {
      return result.rows[0].data as Buffer;
    }
    return null;
  }

  // Bridge: converte npm package do CDN em memória
  async loadFromCDN(packageName: string, version: string): Promise<string> {
    const url = `https://esm.sh/${packageName}@${version}`;
    const response = await fetch(url);
    return await response.text();
  }

  // Bridge: converte GitHub artifact em memória
  async loadFromArtifact(owner: string, repo: string, artifactId: number): Promise<Buffer> {
    const token = process.env.GITHUB_TOKEN;
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Buffer.from(await response.arrayBuffer());
  }

  // Bridge: converte HuggingFace dataset em memória
  async loadFromHuggingFace(datasetId: string, filename: string): Promise<Buffer> {
    const url = `https://huggingface.co/datasets/${datasetId}/resolve/main/${filename}`;
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  }

  // Auto-escalonamento entre tiers
  async autoEscalate(key: string, size: number): Promise<void> {
    // Se cabe em RAM, usa memfs
    if (size < 64 * 1024 * 1024) { // < 64MB
      this.memfsVolume.writeFileSync(key, await this.loadFromSQLite(key) || Buffer.alloc(0));
    }
    // Se não, usa mmap
    else if (size < 1024 * 1024 * 1024) { // < 1GB
      const tempPath = `/tmp/zai-sandbox/${key}`;
      fs.writeFileSync(tempPath, await this.loadFromSQLite(key) || Buffer.alloc(0));
      await this.bridgeToMemory(tempPath);
    }
    // Se muito grande, mantém no SQLite/R2
  }

  getStats(): any {
    return {
      memfs: this.memfsVolume.toJSON(),
      mmapBuffers: Array.from(this.mmapBuffers.keys()),
      tiers: this.tiers,
    };
  }
}

FASE 3: SANDBOX COM CI/CD COMPUTE
3.1 GitHub Actions como Compute (o mais generoso)
# .github/workflows/sandbox-compute.yml
name: ZAI Sandbox Compute
on:
  workflow_dispatch:
    inputs:
      sandbox_id:
        description: 'Sandbox ID to run'
        required: true
      cpu:
        description: 'CPU cores (1-4)'
        default: '4'
      ram_gb:
        description: 'RAM in GB (1-16)'
        default: '16'
      code:
        description: 'Code to execute'
        required: true

jobs:
  sandbox:
    runs-on: ubuntu-latest  # 4 CPU, 16 GB RAM (public repo = ilimitado)
    timeout-minutes: 350     # ~6 horas máximo
    
    container:
      image: docker:latest
      options: --cpus=${{ inputs.cpu }} --memory=${{ inputs.ram_gb }}g
    
    services:
      docker:
        image: docker:dind
        options: --privileged
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup gVisor sandbox
        run: |
          # Instalar gVisor para isolamento
          curl -fsSL https://gvisor.dev/archive.key | gpg --dearmor -o /usr/share/keyrings/gvisor-archive-keyring.gpg
          echo "deb [arch=amd64 signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main" > /etc/apt/sources.list.d/gvisor.list
          apt-get update && apt-get install -y runsc
      
      - name: Setup memory bridge
        run: |
          # Criar zram (RAM comprimida)
          modprobe zram
          echo zstd > /sys/block/zram0/comp_algorithm
          echo 8G > /sys/block/zram0/disksize
          mkswap /dev/zram0
          swapon /dev/zram0
          
          # Criar tmpfs
          mount -t tmpfs -o size=4G tmpfs /tmp/sandbox
      
      - name: Execute sandbox code
        run: |
          # Rodar código no gVisor sandbox com cgroups
          docker run --rm \
            --runtime=runsc \
            --cpus=${{ inputs.cpu }} \
            --memory=${{ inputs.ram_gb }}g \
            --pids-limit=512 \
            --read-only \
            --tmpfs /tmp:size=2G \
            --volume /tmp/sandbox:/workspace \
            ubuntu:24.04 \
            bash -c "
              apt-get update && apt-get install -y nodejs npm &&
              echo '${{ inputs.code }}' > /workspace/code.js &&
              node /workspace/code.js
            "
      
      - name: Upload results to R2
        run: |
          # Salvar resultados no Cloudflare R2
          npx wrangler r2 object put sandbox-results/${{ inputs.sandbox_id }}/output.json \
            --file /tmp/sandbox/output.json \
            --remote
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: sandbox-${{ inputs.sandbox_id }}
          path: /tmp/sandbox/
          retention-days: 7
3.2 GitLab CI como Compute
# .gitlab-ci.yml
variables:
  SANDBOX_ID: "manual"
  CPU_LIMIT: "2"
  RAM_LIMIT: "8g"

stages:
  - sandbox

sandbox-run:
  stage: sandbox
  image: docker:latest
  tags:
    - saas-linux-small-amd64  # 2 CPU, 8 GB RAM
  services:
    - docker:dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  script:
    - |
      # Setup gVisor
      curl -fsSL https://gvisor.dev/archive.key | gpg --dearmor -o /usr/share/keyrings/gvisor-archive-keyring.gpg
      apt-get update && apt-get install -y runsc
      
      # Criar sandbox com isolamento
      docker run --rm \
        --runtime=runsc \
        --cpus=${CPU_LIMIT} \
        --memory=${RAM_LIMIT} \
        --read-only \
        --tmpfs /tmp:rw,size=2G \
        ubuntu:24.04 \
        bash -c "
          apt-get update && apt-get install -y nodejs npm &&
          node -e '${SANDBOX_CODE}'
        "
    
    # Salvar estado no Cloudflare R2
    - npx wrangler r2 object put sandbox/${SANDBOX_ID}/state.tar \
        --file state.tar --remote
  
  rules:
    - if: $CI_PIPELINE_SOURCE == "api"
    - if: $CI_PIPELINE_SOURCE == "schedule"
3.3 Oracle Cloud Always Free (2 OCPU ARM + 12GB RAM)
# === Infraestrutura permanente no Oracle Cloud ===
# Criar instância Always Free: VM.Standard.A1.Flex (2 OCPU, 12 GB RAM)

# Instalar dependências
apt-get update && apt-get install -y docker.io podman gvisor

# Instalar gVisor
curl -fsSL https://gvisor.dev/archive.key | gpg --dearmor -o /usr/share/keyrings/gvisor-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main" > /etc/apt/sources.list.d/gvisor.list
apt-get update && apt-get install -y runsc

# Configurar zram (RAM comprimida)
modprobe zram
echo zstd > /sys/block/zram0/comp_algorithm
echo 6G > /sys/block/zram0/disksize
mkswap /dev/zram0
swapon /dev/zram0

# Configurar tmpfs
mount -t tmpfs -o size=4G tmpfs /tmp/sandbox

# Instalar e configurar Gitea com Actions Runner
docker run -d \
  --name gitea \
  -p 3000:3000 -p 2222:22 \
  -v gitea-data:/data \
  -v /etc/timezone:/etc/timezone:ro \
  -v /etc/localtime:/etc/localtime:ro \
  gitea/gitea:latest

# Instalar Gitea Actions Runner
docker run -d \
  --name gitea-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e GITEA_INSTANCE_URL=http://gitea:3000 \
  -e GITEA_RUNNER_REGISTRATION_TOKEN=<token> \
  gitea/act_runner:latest

FASE 4: ISOLAMENTO DO SANDBOX
4.1 gVisor (User-Space Kernel) - Sem KVM necessário
// packages/core/src/sandbox/isolate.ts

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';

interface SandboxConfig {
  id: string;
  cpu: number;
  ramGb: number;
  diskGb: number;
  network: boolean;
  code: string;
  language: 'javascript' | 'python' | 'bash';
  timeout: number; // ms
}

interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  memoryUsed: number;
  duration: number;
}

export class GVisorIsolate {
  private static readonly RUNSC = '/usr/local/bin/runsc';

  async create(config: SandboxConfig): Promise<string> {
    const containerId = `sandbox-${config.id}`;
    
    // Criar rootfs snapshot
    const rootfs = `/tmp/sandbox-rootfs/${config.id}`;
    fs.mkdirSync(rootfs, { recursive: true });
    
    // Copiar base image
    execSync(`cp -r /var/lib/gvisor/rootfs/* ${rootfs}/`);
    
    // Preparar workspace
    const workspace = `/tmp/sandbox-workspace/${config.id}`;
    fs.mkdirSync(workspace, { recursive: true });
    fs.writeFileSync(`${workspace}/code.${this.getExtension(config.language)}`, config.code);
    
    return containerId;
  }

  async run(config: SandboxConfig): Promise<SandboxResult> {
    const containerId = `sandbox-${config.id}`;
    const workspace = `/tmp/sandbox-workspace/${config.id}`;
    const startTime = Date.now();
    
    // Rodar com gVisor (isolamento em user-space, sem KVM)
    const cmd = [
      GVisorIsolate.RUNSC,
      'run',
      '--platform=systrap',  // user-space platform
      `--cpu=${config.cpu}`,
      `--ram=${config.ramGb}G`,
      '--network=none',      // Sem rede por padrão
      '--overlay2',           // OverlayFS para CoW
      `--rootfs=/var/lib/gvisor/rootfs/${config.id}`,
      containerId,
      'bash', '-c',
      `cd /workspace && ${this.getCommand(config)}`
    ].join(' ');

    try {
      const output = execSync(cmd, {
        timeout: config.timeout,
        encoding: 'utf-8',
        env: {
          ...process.env,
          NODE_PATH: '/usr/lib/node_modules',
        }
      });

      return {
        stdout: output,
        stderr: '',
        exitCode: 0,
        memoryUsed: this.getMemoryUsage(containerId),
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.status || 1,
        memoryUsed: this.getMemoryUsage(containerId),
        duration: Date.now() - startTime,
      };
    }
  }

  async destroy(containerId: string): Promise<void> {
    try {
      execSync(`${GVisorIsolate.RUNSC} delete --force ${containerId}`);
    } catch (e) {
      // Ignorar se já destruído
    }
    // Limpar workspace
    const id = containerId.replace('sandbox-', '');
    fs.rmSync(`/tmp/sandbox-workspace/${id}`, { recursive: true, force: true });
    fs.rmSync(`/tmp/sandbox-rootfs/${id}`, { recursive: true, force: true });
  }

  private getMemoryUsage(containerId: string): number {
    try {
      const cgroupPath = `/sys/fs/cgroup/system.slice/${containerId}/memory.current`;
      if (fs.existsSync(cgroupPath)) {
        return parseInt(fs.readFileSync(cgroupPath, 'utf-8'));
      }
    } catch (e) {}
    return 0;
  }

  private getExtension(lang: string): string {
    const exts: Record<string, string> = { javascript: 'js', python: 'py', bash: 'sh' };
    return exts[lang] || 'txt';
  }

  private getCommand(config: SandboxConfig): string {
    const cmds: Record<string, string> = {
      javascript: `node code.js`,
      python: `python3 code.py`,
      bash: `bash code.sh`,
    };
    return cmds[config.language] || `cat code.*`;
  }
}
4.2 cgroups v2 para Limitação de Recursos
// packages/core/src/sandbox/resources.ts

import * as fs from 'fs';
import { execSync } from 'child_process';

interface ResourceLimits {
  cpuQuota: string;      // Ex: "400000 100000" = 4 cores
  memoryMax: string;     // Ex: "8589934592" = 8GB
  memoryHigh: string;    // Ex: "6442450944" = 6GB
  pidsMax: number;       // Ex: 512
  ioMax: string;         // Ex: "8:0 rbps=104857600 wbps=104857600"
}

export class CGroupsManager {
  private cgroupPath: string;

  constructor(sandboxId: string) {
    this.cgroupPath = `/sys/fs/cgroup/zai-sandbox-${sandboxId}`;
  }

  async setup(limits: ResourceLimits): Promise<void> {
    // Criar cgroup
    fs.mkdirSync(this.cgroupPath, { recursive: true });

    // Habilitar controladores
    fs.writeFileSync(`${this.cgroupPath}/cgroup.subtree_control`, '+memory +cpu +pids +io');

    // Configurar limites de memória
    fs.writeFileSync(`${this.cgroupPath}/memory.max`, limits.memoryMax);
    fs.writeFileSync(`${this.cgroupPath}/memory.high`, limits.memoryHigh);
    fs.writeFileSync(`${this.cgroupPath}/memory.swap.max`, '0'); // Sem swap

    // Configurar limites de CPU
    fs.writeFileSync(`${this.cgroupPath}/cpu.max`, limits.cpuQuota);

    // Configurar limites de processos
    fs.writeFileSync(`${this.cgroupPath}/pids.max`, limits.pidsMax.toString());

    // Configurar limites de I/O
    fs.writeFileSync(`${this.cgroupPath}/io.max`, limits.ioMax);

    // Matar processos se exceder OOM
    fs.writeFileSync(`${this.cgroupPath}/memory.oom.group`, '1');
  }

  async addProcess(pid: number): Promise<void> {
    fs.writeFileSync(`${this.cgroupPath}/cgroup.procs`, pid.toString());
  }

  async getStats(): Promise<{
    memoryCurrent: number;
    memoryPeak: number;
    cpuUsage: number;
    pidsCurrent: number;
  }> {
    return {
      memoryCurrent: parseInt(fs.readFileSync(`${this.cgroupPath}/memory.current`, 'utf-8')),
      memoryPeak: parseInt(fs.readFileSync(`${this.cgroupPath}/memory.peak`, 'utf-8') || '0'),
      cpuUsage: parseInt(fs.readFileSync(`${this.cgroupPath}/cpu.stat`, 'utf-8').split('\n')[0].split(' ')[1]),
      pidsCurrent: parseInt(fs.readFileSync(`${this.cgroupPath}/pids.current`, 'utf-8')),
    };
  }

  async destroy(): Promise<void> {
    // Matar todos os processos
    try {
      execSync(`kill -9 $(cat ${this.cgroupPath}/cgroup.procs) 2>/dev/null`);
    } catch (e) {}
    // Remover cgroup
    fs.rmdirSync(this.cgroupPath, { recursive: true } as any);
  }
}

FASE 5: ORM/DB COMO STORAGE
5.1 Drizzle ORM + Turso/libSQL
// packages/core/src/db/schema.ts

import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const sandboxes = sqliteTable('sandboxes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  status: text('status').notNull(), // 'running' | 'stopped' | 'paused'
  cpu: integer('cpu').default(2),
  ramGb: integer('ram_gb').default(8),
  diskGb: integer('disk_gb').default(10),
  rootfs: blob('rootfs'),           // Filesystem snapshot em SQLite
  workspace: blob('workspace'),     // Workspace files em SQLite
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const sandboxFiles = sqliteTable('sandbox_files', {
  id: text('id').primaryKey(),
  sandboxId: text('sandbox_id').references(() => sandboxes.id),
  path: text('path').notNull(),
  content: blob('content').notNull(),  // Arquivo como BLOB no SQLite
  size: integer('size'),
  modifiedAt: text('modified_at').default('CURRENT_TIMESTAMP'),
});

export const sandboxSnapshots = sqliteTable('sandbox_snapshots', {
  id: text('id').primaryKey(),
  sandboxId: text('sandbox_id').references(() => sandboxes.id),
  name: text('name').notNull(),
  rootfs: blob('rootfs').notNull(),    // Snapshot completo do filesystem
  memory: blob('memory'),             // Estado da memória
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
// packages/core/src/db/turso.ts

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sandboxes, sandboxFiles } from './schema';

// Conexão com Turso (SQLite distribuído, 5GB grátis)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,   // libsql://your-db.turso.io
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema: { sandboxes, sandboxFiles } });

// Converter filesystem inteiro para SQLite (Storage → "RAM")
export async function filesystemToSQLite(sandboxId: string, files: Map<string, Buffer>) {
  for (const [path, content] of files) {
    const id = `${sandboxId}:${path}`;
    await db.insert(sandboxFiles).values({
      id,
      sandboxId,
      path,
      content,
      size: content.length,
    }).onConflictDoUpdate({
      target: sandboxFiles.id,
      set: { content, size: content.length, modifiedAt: new Date().toISOString() },
    });
  }
}

// Converter SQLite para filesystem (SQLite → "RAM")
export async function sqliteToFilesystem(sandboxId: string): Promise<Map<string, Buffer>> {
  const files = await db.select().from(sandboxFiles).where(
    eq(sandboxFiles.sandboxId, sandboxId)
  );
  
  const result = new Map<string, Buffer>();
  for (const file of files) {
    result.set(file.path, file.content as Buffer);
  }
  return result;
}

FASE 6: CARREGAMENTO VIA CDN (npm packages instantâneos)
// packages/core/src/storage/npm-cdn.ts

interface CDNPackage {
  name: string;
  version: string;
  files: Map<string, string>;
}

export class NPMLoader {
  private cache = new Map<string, CDNPackage>();

  // Carregar pacote via esm.sh (transforma em ES module automaticamente)
  async loadPackage(name: string, version: string): Promise<string> {
    const key = `${name}@${version}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!.files.get('index.js')!;
    }

    // Buscar via esm.sh
    const url = `https://esm.sh/${name}@${version}`;
    const response = await fetch(url);
    const code = await response.text();

    this.cache.set(key, {
      name,
      version,
      files: new Map([['index.js', code]]),
    });

    return code;
  }

  // Carregar múltiplos pacotes via import maps (browser)
  async generateImportMap(packages: Array<{ name: string; version: string }>): Promise<object> {
    const imports: Record<string, string> = {};
    
    for (const pkg of packages) {
      imports[pkg.name] = `https://esm.sh/${pkg.name}@${pkg.version}`;
      imports[`${pkg.name}/`] = `https://esm.sh/${pkg.name}@${pkg.version}/`;
    }
    
    return { imports };
  }

  // Carregar pacote via jsDelivr (backup, mais rápido)
  async loadViaJsDelivr(name: string, version: string, file: string = ''): Promise<string> {
    const url = file 
      ? `https://cdn.jsdelivr.net/npm/${name}@${version}/${file}`
      : `https://cdn.jsdelivr.net/npm/${name}@${version}`;
    
    const response = await fetch(url);
    return await response.text();
  }

  // Carregar pacote do GitHub (para packages não publicados no npm)
  async loadFromGitHub(owner: string, repo: string, path: string): Promise<string> {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
    const response = await fetch(url);
    return await response.text();
  }
}

FASE 7: ORQUESTAÇÃO MULTI-PLATAFORMA
// packages/core/src/orchestrator/multi-platform.ts

interface ComputeProvider {
  name: string;
  cpu: number;
  ramGb: number;
  maxDuration: number; // ms
  cost: 'free' | 'paid';
  execute: (config: SandboxConfig) => Promise<SandboxResult>;
}

export class MultiPlatformOrchestrator {
  private providers: ComputeProvider[] = [
    // 1. GitHub Actions (ILIMITADO para repos públicos)
    {
      name: 'github-actions',
      cpu: 4,
      ramGb: 16,
      maxDuration: 6 * 60 * 60 * 1000, // 6 horas
      cost: 'free',
      execute: async (config) => {
        // Trigger GitHub Actions workflow
        const response = await fetch(`https://api.github.com/repos/${config.repo}/actions/workflows/${config.workflow}/dispatches`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: { sandbox_id: config.id, code: config.code },
          }),
        });
        // Poll para resultado
        return this.pollGitHubResult(config.repo, config.id);
      },
    },

    // 2. GitLab CI (400 min/mês grátis)
    {
      name: 'gitlab-ci',
      cpu: 2,
      ramGb: 8,
      maxDuration: 3 * 60 * 60 * 1000, // 3 horas
      cost: 'free',
      execute: async (config) => {
        // Trigger GitLab pipeline via API
        const response = await fetch(`https://gitlab.com/api/v4/projects/${config.projectId}/pipeline`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GITLAB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: 'main',
            variables: [
              { key: 'SANDBOX_ID', value: config.id },
              { key: 'SANDBOX_CODE', value: config.code },
            ],
          }),
        });
        return this.pollGitLabResult(config.projectId, config.id);
      },
    },

    // 3. Oracle Cloud Always Free (permanente, 2 OCPU ARM, 12GB RAM)
    {
      name: 'oracle-cloud',
      cpu: 2,
      ramGb: 12,
      maxDuration: Infinity, // Sem limite
      cost: 'free',
      execute: async (config) => {
        // SSH no Oracle Cloud VM
        const ssh = `ssh -i ~/.ssh/oracle_key opc@${process.env.ORACLE_IP}`;
        // Executar sandbox via gVisor
        return execSync(`${ssh} "docker run --runtime=runsc ... ${config.code}"`);
      },
    },

    // 4. HuggingFace Spaces (2 CPU, 16GB RAM grátis)
    {
      name: 'huggingface',
      cpu: 2,
      ramGb: 16,
      maxDuration: 24 * 60 * 60 * 1000, // 24 horas (sleep após idle)
      cost: 'free',
      execute: async (config) => {
        // Deploy como Gradio app
        const appCode = `
import gradio as gr
import subprocess, json

def run_sandbox(code):
    result = subprocess.run(['python3', '-c', code], capture_output=True, text=True, timeout=300)
    return result.stdout + result.stderr

demo = gr.Interface(fn=run_sandbox, inputs="code", outputs="text")
demo.launch()
`;
        // Push para HuggingFace Space
        const api = new HfApi();
        await api.uploadFolder({
          folderPath: './space',
          repoId: `user/sandbox-${config.id}`,
          repoType: 'space',
        });
      },
    },

    // 5. Kaggle (4 CPU, 29GB RAM, GPU grátis)
    {
      name: 'kaggle',
      cpu: 4,
      ramGb: 29,
      maxDuration: 12 * 60 * 60 * 1000, // 12 horas
      cost: 'free',
      execute: async (config) => {
        // Criar Kaggle notebook
        const kernelMeta = {
          id: `sandbox-${config.id}`,
          title: `Sandbox ${config.id}`,
          code_file: 'kernel.py',
          language: 'python',
          kernel_type: 'notebook',
          is_private: false,
        };
        // Push e executar
        execSync(`kaggle kernels push -p ./kernel_dir`);
      },
    },
  ];

  // Auto-selecionar melhor provider baseado nos requisitos
  selectProvider(requirements: { cpu: number; ramGb: number; duration: number }): ComputeProvider {
    const suitable = this.providers.filter(p => 
      p.cpu >= requirements.cpu &&
      p.ramGb >= requirements.ramGb &&
      p.maxDuration >= requirements.duration
    );
    
    // Priorizar: Oracle Cloud (permanente) > GitHub (ilimitado) > GitLab > HuggingFace > Kaggle
    const priority = ['oracle-cloud', 'github-actions', 'huggingface', 'gitlab-ci', 'kaggle'];
    
    for (const name of priority) {
      const provider = suitable.find(p => p.name === name);
      if (provider) return provider;
    }
    
    throw new Error('Nenhum provider adequado encontrado');
  }
}

FASE 8: GERENCIAMENTO DE ESTADO (Sandbox Pausado/Retomado)
// packages/core/src/sandbox/manager.ts

import { HybridMemoryManager } from '../memory/hybrid';
import { GVisorIsolate } from './isolate';
import { CGroupsManager } from './resources';
import { db, filesystemToSQLite, sqliteToFilesystem } from '../db/turso';

interface SandboxState {
  id: string;
  status: 'running' | 'paused' | 'stopped';
  cpu: number;
  ramGb: number;
  rootfsSnapshot: Buffer;    // Snapshot do filesystem em memória
  memorySnapshot: Buffer;    // Estado da RAM em memória
  workspaceFiles: Map<string, Buffer>;
}

export class SandboxManager {
  private memory = new HybridMemoryManager();
  private isolate = new GVisorIsolate();
  private activeCGroups = new Map<string, CGroupsManager>();

  async create(config: SandboxConfig): Promise<string> {
    const id = `sandbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 1. Inicializar memória híbrida
    await this.memory.init();

    // 2. Criar filesystem base (carregar de CDN se necessário)
    const baseFiles = new Map<string, Buffer>();
    
    // Carregar Node.js runtime do CDN se necessário
    const nodeRuntime = await this.memory.loadFromCDN('node', '20.0.0');
    baseFiles.set('/usr/bin/node', Buffer.from(nodeRuntime));

    // 3. Salvar filesystem no SQLite (persistência)
    await filesystemToSQLite(id, baseFiles);

    // 4. Criar sandbox com gVisor
    const containerId = await this.isolate.create({
      ...config,
      id,
    });

    // 5. Configurar limites de recursos
    const cgroups = new CGroupsManager(id);
    await cgroups.setup({
      cpuQuota: `${config.cpu * 100000} 100000`,
      memoryMax: `${config.ramGb * 1024 * 1024 * 1024}`,
      memoryHigh: `${(config.ramGb - 2) * 1024 * 1024 * 1024}`, // 2GB below max
      pidsMax: 512,
      ioMax: '8:0 rbps=104857600 wbps=104857600',
    });
    this.activeCGroups.set(id, cgroups);

    // 6. Criar entry no banco
    await db.insert(sandboxes).values({
      id,
      userId: config.userId || 'anonymous',
      status: 'running',
      cpu: config.cpu,
      ramGb: config.ramGb,
    });

    return id;
  }

  async pause(sandboxId: string): Promise<void> {
    // 1. Pausar processo no gVisor
    await this.isolate.pause(sandboxId);

    // 2. Capturar snapshot da memória
    const cgroups = this.activeCGroups.get(sandboxId);
    const memStats = await cgroups!.getStats();
    const memSnapshot = Buffer.alloc(memStats.memoryPeak);
    // ... copiar memória do cgroup para buffer

    // 3. Capturar snapshot do filesystem
    const files = await sqliteToFilesystem(sandboxId);
    const rootfsSnapshot = Buffer.from(JSON.stringify(Array.from(files.entries())));

    // 4. Salvar snapshots no SQLite
    await db.insert(sandboxSnapshots).values({
      id: `snapshot-${sandboxId}`,
      sandboxId,
      name: 'pause-snapshot',
      rootfs: rootfsSnapshot,
      memory: memSnapshot,
    });

    // 5. Atualizar status
    await db.update(sandboxes)
      .set({ status: 'paused' })
      .where(eq(sandboxes.id, sandboxId));

    // 6. Liberar recursos
    await cgroups!.destroy();
    this.activeCGroups.delete(sandboxId);
  }

  async resume(sandboxId: string): Promise<void> {
    // 1. Carregar snapshot do SQLite
    const [snapshot] = await db.select()
      .from(sandboxSnapshots)
      .where(eq(sandboxSnapshots.sandboxId, sandboxId))
      .orderBy(desc(sandboxSnapshots.createdAt))
      .limit(1);

    // 2. Restaurar filesystem
    const files = new Map<string, Buffer>(JSON.parse(snapshot.rootfs.toString()));
    await filesystemToSQLite(sandboxId, files);

    // 3. Criar novo sandbox
    const [sandbox] = await db.select().from(sandboxes).where(eq(sandboxes.id, sandboxId));
    await this.create({
      id: sandboxId,
      cpu: sandbox.cpu!,
      ramGb: sandbox.ramGb!,
      code: '', // Código restaurado do workspace
      language: 'javascript',
      timeout: 3600000,
    });

    // 4. Restaurar memória via mmap
    const mmapBridge = await this.memory.bridgeToMemory(
      `/tmp/sandbox-memory/${sandboxId}`
    );
    // ... restaurar estado da memória do snapshot
  }

  async destroy(sandboxId: string): Promise<void> {
    // 1. Destruir gVisor sandbox
    await this.isolate.destroy(`sandbox-${sandboxId}`);

    // 2. Destruir cgroups
    const cgroups = this.activeCGroups.get(sandboxId);
    if (cgroups) {
      await cgroups.destroy();
      this.activeCGroups.delete(sandboxId);
    }

    // 3. Manter snapshots no SQLite (para future resume)
    await db.update(sandboxes)
      .set({ status: 'stopped' })
      .where(eq(sandboxes.id, sandboxId));
  }
}

FASE 9: PACOTE NPM + DEPLOY
9.1 Package.json
{
  "name": "@zai/sandbox",
  "version": "1.0.0",
  "description": "Open-source sandbox platform using free infrastructure",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "test": "vitest",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "memfs": "^4.64.0",
    "@platformatic/vfs": "^1.0.0",
    "drizzle-orm": "^0.38.0",
    "@libsql/client": "^0.6.0",
    "better-sqlite3": "^11.0.0",
    "tinypool": "^1.0.0",
    "isolated-vm": "^5.0.0",
    "mmap-io": "^1.0.0",
    "@huggingface/hub": "^1.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.28.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "turbo": "^2.4.0"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  },
  "files": ["dist", "README.md"]
}
9.2 GitHub Actions Workflow Principal
# .github/workflows/build-deploy.yml
name: Build & Deploy ZAI Sandbox

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm test
      
      - name: Publish to npm
        if: github.ref == 'refs/heads/main'
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

FASE 10: RESUMO DE RECURSOS GRATUITOS



Plataforma
CPU
RAM
Duração
Armazenamento
Melhor Para



GitHub Actions (repo público)
4 vCPU
16 GB
6h/job
14 GB SSD
Compute principal (ILIMITADO)


Oracle Cloud Always Free
2 OCPU ARM
12 GB
Permanente
200 GB
Servidor permanente


HuggingFace Spaces
2 vCPU
16 GB
Indefinido
50 GB
ML/AI sandboxes


Kaggle
4 cores
29 GB
12h/session
20 GB
GPU (T4 32GB VRAM)


GitLab CI
2 vCPU
8 GB
3h/job
30 GB
Compute secundário


Cloudflare Workers
Serverless
128 MB
Indefinido
10 GB R2
API/Orquestração


Vercel
1 vCPU
2 GB
300s
1 GB
Frontend/API


Turso/libSQL
-
-
-
5 GB grátis
Storage SQLite


jsDelivr/esm.sh
-
-
-
-
CDN instantâneo


Memória Total Disponível (Grátis)



Tier
Fonte
RAM/Storage
Como Usar



RAM real
GitHub Actions
16 GB
gVisor sandbox


RAM comprimida
zram
~32 GB (2x)
/dev/zram0


tmpfs
Linux
4 GB
/tmp sandbox


mmap
Storage→RAM
Ilimitado
Arquivos mapeados


SQLite VFS
Turso
5 GB
Arquivos como BLOBs


Object Storage
Cloudflare R2
10 GB
Snapshots


ARM VM
Oracle Cloud
12 GB RAM
Sempre ligado


GPU
Kaggle
32 GB VRAM
30h/semana


Total potencial: ~16 GB RAM real + 32 GB zram + 12 GB Oracle + 32 GB GPU VRAM = ~92 GB de "memória"

COMO RODAR (Passo a Passo)
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/zai-sandbox.git
cd zai-sandbox

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com:
# - GITHUB_TOKEN
# - GITLAB_TOKEN
# - TURSO_DATABASE_URL
# - TURSO_AUTH_TOKEN
# - CLOUDFLARE_ACCOUNT_ID
# - CLOUDFLARE_R2_TOKEN
# - HUGGINGFACE_TOKEN

# 4. Criar schema no Turso
npx drizzle-kit push

# 5. Build do projeto
npm run build

# 6. Criar um sandbox
node -e "
const { SandboxManager } = require('./dist');
const manager = new SandboxManager();
const id = await manager.create({
  cpu: 4,
  ramGb: 16,
  code: 'console.log(\"Hello from ZAI Sandbox!\")',
  language: 'javascript',
  timeout: 60000,
});
console.log('Sandbox criado:', id);
"

# 7. Deploy no Oracle Cloud (sempre disponível)
ssh opc@seu-oracle-ip 'bash -s' < infra/scripts/setup-gvisor.sh

# 8. Configurar GitHub Actions
# Copiar .github/workflows/sandbox-compute.yml

# 9. Publicar como npm package
npm publish --access public

Este plano combina todas as suas ideias: memória de armazenamento convertida para RAM (via mmap, tmpfs, zram, SQLite VFS), compute gratuito (GitHub Actions, Oracle Cloud, HuggingFace, Kaggle), isolamento (gVisor, cgroups, seccomp), armazenamento (Cloudflare R2, Turso, GitHub Artifacts), e orquestração multi-plataforma. Tudo isso como um projeto open source publicado no npm.

Pesquisa completa! Aqui está o resumo:
40 Pesquisas Realizadas - Resumo
Infraestrutura Gratuita Disponível



Recurso
Fonte
Quanto



4 CPU + 16GB RAM
GitHub Actions (repo público)
Ilimitado


2 OCPU + 12GB RAM
Oracle Cloud Always Free
Permanente


2 CPU + 16GB RAM
HuggingFace Spaces
Indefinido


4 cores + 29GB RAM + GPU 32GB
Kaggle
30h/semana


2 CPU + 8GB RAM
GitLab CI
400 min/mês


5GB SQLite
Turso/libSQL
Grátis


10GB Object Storage
Cloudflare R2
Grátis


CDN ilimitado
jsDelivr/esm.sh
Grátis


Memória Total Potencial: ~92 GB

16 GB RAM real (GitHub Actions)
~32 GB zram (RAM comprimida 2x)
12 GB Oracle Cloud (permanente)
32 GB GPU VRAM (Kaggle)

Isolamento

gVisor - kernel em user-space (sem KVM)
cgroups v2 - limitação de CPU/RAM
seccomp/AppArmor - filtros de segurança
OverlayFS - filesystem em camadas
Podman rootless - sem daemon

Storage→RAM

mmap - converte arquivos em memória mapeada
tmpfs - disco como RAM
zram - RAM comprimida
SQLite VFS - arquivos como BLOBs em memória
memfs - filesystem virtual em RAM

O plano completo está acima com todos os códigos, configs, e passo a passo. Quer que eu implemente alguma parte específica?
