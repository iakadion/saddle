# assistant

[Thinking] The user is asking a very complex question about using free infrastructure from Git hosting services (GitHub, GitLab, Forgejo, Gitea, Codeberg, etc.) to create a sandbox platform with container support, memory management, and CI/CD pipelines. They want to understand if it's possible to use these services' free resources to:

Run Linux environments
Use memory (RAM) and storage
Create sandbox environments
Use CI/CD pipelines
Run containers6. Manage resources with quotas

Let me research this topic to provide accurate information about what's possible with these services. I should search for:

GitHub Actions free tier limits and capabilities
GitLab CI/CD free tier
Self-hosted options like Forgejo/Gitea
Projects that turn storage into RAM-like memory
Container sandbox implementations

Let me use the search tools to gather current information.

[Thinking] Now I have good information about GitHub, GitLab, and Forgejo/Gitea runners. Let me also search for memory-to-RAM conversion projects and sandbox implementations.

[Thinking] Now I have a comprehensive understanding of the landscape. Let me also search for some specific tools that convert storage to RAM and look for the init-fullstack script they were trying to run.

[Thinking] Now I have a comprehensive understanding. Let me compile all this information into a clear, actionable plan for the user. The user wants to:

Use free infrastructure from Git hosting services (GitHub, GitLab, Forgejo/Gitea, Codeberg) to create sandbox platforms
Understand how memory works (storage to RAM conversion)
Build a platform similar to Z.ai with container sandboxes
Use CI/CD pipelines to provision sandboxes
Convert storage to RAM-like memory using tools like zram, tmpfs, etc.

Let me provide a comprehensive response covering all these topics.

[Thinking] Now let me provide the comprehensive answer.

[Thinking] Good, let me continue with the memory explanation.

[Thinking] Now let me list the open source sandbox/microVM projects.

[Thinking] Now let me show the practical implementation with pipelines.

[Thinking] Now let me resolve the Windows script issue.

[Thinking] Now let me provide the summary with the key takeaways.

Vou te dar um panorama completo com tudo que pesquisei. É um tema complexo, mas totalmente viável.

1. Infraestrutura Gratuita dos Repositórios
GitHub Actions (Free)



Recurso
Limite



Minutos/mês (repositórios públicos)
Ilimitado e gratuito


Minutos/mês (repositórios privados)
2.000 min


RAM do runner Linux
4-16 GB (ubuntu-latest = 4 vCPU, 16 GB RAM)


Storage (artifacts)
500 MB


Cache
10 GB por repositório


Runner novo (jan/2026): 1 vCPU
5 GB RAM, 15 min timeout


Public repos = tudo gratuito. Você pode rodar Docker, Linux, qualquer coisa.
GitLab CI (Free)



Recurso
Limite



Compute minutes/mês
400 min (Free tier)


Runner small (default)
2 vCPU, 8 GB RAM, 30 GB storage


Runner medium
4 vCPU, 16 GB RAM, 50 GB storage


Runner large
8 vCPU, 32 GB RAM (Premium)


Runner xlarge
16 vCPU, 64 GB RAM (Premium)


Runner 2xlarge
32 vCPU, 128 GB RAM (Premium)


Forgejo/Gitea + Codeberg



Runner Label
CPU
RAM
Tempo



codeberg-tiny
1
2 GB
2 min


codeberg-small
2
4 GB
5 min


codeberg-medium
4
8 GB
10 min


Forgejo/Gitea Actions usam o mesmo YAML do GitHub Actions. Self-hosted runners: você controla tudo (RAM, CPU, disk).

2. Conversão Storage → RAM
zram (Linux Kernel)
O módulo zram cria dispositivos de bloco comprimidos dentro da RAM. É exatamente o que você quer:
# Criar swap comprimido em RAM
modprobe zram
echo lz4 > /sys/block/zram0/comp_algorithm
echo 4G > /sys/block/zram0/disksize
mkswap /dev/zram0
swapon /dev/zram0
Resultado: 4 GB de storage físico → ~8-12 GB de "RAM virtual" comprimida (razão 2:1 a 3:1 com lz4/zstd).
tmpfs
Sistema de arquivos que mora inteiramente em RAM:
# Montar 2GB de storage como RAM
mount -t tmpfs -o size=2G tmpfs /mnt/ramdisk
zram-config (projeto open source)
github.com/ecdye/zram-config - Configuração completa de zram para swap + diretórios + logs. Economiza writes em SD/eMMC e dá velocidade de RAM.
Na prática (nos runners GitHub/GitLab):
Os runners já usam RAM real (8-16 GB). O truque é:

Usar tmpfs para o workspace (tudo em RAM)
Usar zram como swap comprimido
Usar overlayfs com upper em tmpfs para writes efêmeros

3. Projetos Open Source de Sandbox/microVM
Para rodar Linux isolado:



Projeto
O que faz
RAM por fork
Velocidade



kern
Sandbox daemonless, ~1.5 MB binary, rootless
~0 RAM extra
~1.9ms cold start


quicksand
QEMU VMs para AI agents, Python API
Configurável
~100ms restore


exec-sandbox
QEMU microVMs com snapshots L1/L2/L3
192MB default
~100ms L1, ~400ms L2


mitos
Firecracker microVMs no Kubernetes
~3 MiB/fork (CoW)
~27ms warm-claim


rust-nano-vm
VMM Rust puro, snapshots KVM
~0.5 MiB/fork
~12ms cold start


crucible
Firecracker, Go binary, fork/snapshot
~13 MiB/fork
~125ms (reflink)


boxlite
microVM embutível, Python/Node SDK
Configurável
Rápido


claude-vm
QEMU sandbox para Claude Code
Configurável
Segundos


Para GitHub Actions efêmeros:



Projeto
O que faz



outrunner
Ephemeral runners com Docker/libvirt/Tart


ephemerd
Single binary, containerd embutido, Linux/Win/Mac


ez-gh-actions
Rust binary, Docker+sysbox, cgroup limits


createos-sandbox-ghar
microVM KVM no Cloudflare Workers free tier

4. Implementação Prática
Opção A: GitHub Actions + Docker Sandbox (mais simples)
# .github/workflows/sandbox.yml
name: Sandbox Environment

on:
  repository_dispatch:
    types: [create-sandbox]
  workflow_dispatch:
    inputs:
      sandbox_id:
        description: 'Sandbox ID'
        required: true
      memory_limit:
        description: 'RAM limit (e.g., 8G)'
        default: '8G'
      cpu_limit:
        description: 'CPU limit'
        default: '4'

jobs:
  sandbox:
    runs-on: ubuntu-latest  # 4 vCPU, 16 GB RAM grátis
    container:
      image: ubuntu:22.04
      options: >
        --memory ${{ github.event.inputs.memory_limit || '8G' }}
        --cpus ${{ github.event.inputs.cpu_limit || '4' }}
        --tmpfs /tmp:size=4G
        --tmpfs /run:size=2G
    
    steps:
      - name: Setup zram
        run: |
          modprobe zram
          echo lz4 > /sys/block/zram0/comp_algorithm
          echo 8G > /sys/block/zram0/disksize
          mkswap /dev/zram0
          swapon /dev/zram0
          
      - name: Setup tmpfs workspace
        run: |
          mount -t tmpfs -o size=4G tmpfs /workspace
          cd /workspace
          
      - name: Clone repo
        uses: actions/checkout@v4
        with:
          path: /workspace
          
      - name: Run sandbox
        run: |
          cd /workspace
          # Seu código aqui
          ls -la
          free -h
          df -h
Opção B: Forgejo/Gitea Actions + Self-hosted Runner (mais controle)
# .forgejo/workflows/sandbox.yml
name: Self-hosted Sandbox

on:
  push:
    branches: [main]

jobs:
  sandbox:
    runs-on: self-hosted  # Seu runner com Docker
    container:
      image: catthehacker/ubuntu:act-latest
      options: --memory 8G --cpus 4 --tmpfs /tmp:size=4G
    
    steps:
      - name: Setup
        run: |
          # zram se disponível
          if modprobe zram 2>/dev/null; then
            echo lz4 > /sys/block/zram0/comp_algorithm
            echo 8G > /sys/block/zram0/disksize
            mkswap /dev/zram0 && swapon /dev/zram0
          fi
          
      - uses: actions/checkout@v4
      - run: npm install && npm test
Opção C: GitLab CI + Hosted Runner (8 GB RAM grátis)
# .gitlab-ci.yml
sandbox:
  tags:
    - saas-linux-small-amd64  # 2 vCPU, 8 GB RAM
  image: ubuntu:22.04
  variables:
    MEMORY_LIMIT: "7G"
  before_script:
    - apt-get update && apt-get install -y zram-tools
    - zramctl /dev/zram0 --algorithm lz4 --size 4G --type swap
  script:
    - free -h
    - df -h
    - # Seu código aqui
Opção D: Codeberg Woodpecker CI (mínimo 2 GB RAM)
# .woodpecker.yml
pipeline:
  sandbox:
    image: ubuntu:22.04
    commands:
      - apt-get update && apt-get install -y zram-config
      - free -h
      - # Seu código aqui

5. Script init-fullstack.sh no Windows
Baixei e analisei o script. Ele faz:

Baixa um tarball de https://z-cdn.chatglm.cn/fullstack/code_1773298087387.tar
Extrai em /home/z/my-project
Roda .zscripts/dev.sh em background

Para rodar no Windows (PowerShell):
# Opção 1: Git Bash (se tiver Git instalado)
& "C:\Program Files\Git\bin\bash.exe" -c "curl -s https://z-cdn.chatglm.cn/fullstack/init-fullstack_1773298087387.sh | bash"

# Opção 2: WSL
wsl bash -c "curl -s https://z-cdn.chatglm.cn/fullstack/init-fullstack_1773298087387.sh | bash"

# Opção 3: Criar equivalente PowerShell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.zai"
Invoke-WebRequest -Uri "https://z-cdn.chatglm.cn/fullstack/code_1773298087387.tar" -OutFile "$env:USERPROFILE\.zai\code.tar"
tar xf "$env:USERPROFILE\.zai\code.tar" -C "$env:USERPROFILE\.zai"

Resumo: É Possível? SIM
Arquitetura da sua plataforma:
┌─────────────────────────────────────────────────────┐
│                  SEU FRONTEND                        │
│  (usuário clica "Criar Sandbox")                    │
└──────────────────┬──────────────────────────────────┘
                   │ API call
                   ▼
┌─────────────────────────────────────────────────────┐
│           ORQUESTRADOR (Cloudflare Worker grátis)    │
│  - Cria repositório no Forgejo/Gitea                │
│  - Dispara workflow via API                          │
│  - Monitora status                                   │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐  ┌────────┐  ┌────────┐
│GitHub  │  │GitLab  │  │Forgejo │
│Actions │  │CI      │  │Actions │
│(grátis)│  │(400min)│  │(self)  │
└───┬────┘  └───┬────┘  └───┬────┘
    │           │           │
    ▼           ▼           ▼
┌─────────────────────────────────────────────────────┐
│            RUNNER (VM/Container efêmero)             │
│  - 4-16 GB RAM (grátis nos free tiers)              │
│  - Docker com --memory 8G --cpus 4                  │
│  - zram para RAM comprimida                         │
│  - tmpfs para workspace em RAM                      │
│  - Linux completo rodando                           │
└─────────────────────────────────────────────────────┘
Keys para o macete:

GitHub Actions em repos públicos = ilimitado e grátis com 16 GB RAM
zram converte storage em RAM comprimida (2-3x mais eficiente)
tmpfs coloca arquivos direto em RAM (zero I/O disco)
Docker --memory limita e isola cada sandbox
Cloudflare Workers free tier orquestra tudo sem custo
Forgejo self-hosted dá controle total sobre recursos

Quer que eu implemente alguma dessas opções específicas?
