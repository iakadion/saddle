# assistant

[Thinking] The user is asking me to research how to create a platform with container sandboxes using free infrastructure from Git hosting services (GitHub, GitLab, Forgejo, Gitea, Codeberg, etc.) and also mentioning Hugging Face, Kaggle, ModelScope, etc. They want to understand:

How to use free CI/CD pipelines from these platforms to run sandboxes with Linux, Docker, RAM, etc.
Whether it's possible to set up cron jobs, timelines, and pipelines that create sandboxes
How to leverage free compute resources (RAM, CPU) from these platforms
The technical implementation details

They also mention wanting to replicate something like "Zai" infrastructure with memory (RAM) and system resources.
Let me research this topic to provide comprehensive information. Since I'm in read-only mode, I can search the web and gather information to create a plan.
Let me search for information about:

Using GitHub Actions/GitLab CI/Forgejo Actions for running Docker containers with resource limits
Free tier limitations for CI/CD on these platforms
Alternative approaches for creating sandboxes using free infrastructure
Tools like Act (for running GitHub Actions locally), Woodpecker CI, etc.

[Thinking] Let me search for more specific information about the platforms mentioned and how to use them for sandbox/container execution.

[Thinking] Now let me search for more information about self-hosted runners and alternatives, as well as how to use these platforms for sandbox execution.

[Thinking] Now I have a good understanding of the landscape. Let me also search for information about ModelScope and other platforms to give a complete picture.

[Thinking] Now I have a comprehensive understanding of the landscape. Let me create a detailed plan for the user. The user wants to build a platform with container sandboxes using free infrastructure from various hosting services.
Let me organize the information and create a comprehensive plan.

Based on my research, here's a comprehensive plan for building a sandbox platform using free infrastructure from these services:

Plataforma de Sandbox com Infraestrutura Gratuita
1. Visão Geral das Opções



Plataforma
RAM Gratuita
CPU
Disk
Tempo Limite
Melhor Para



GitHub Actions
7GB
2 cores
14GB
6h/job
Pipelines CI/CD


GitLab CI
8GB
2 cores
30GB
50min/job
Pipelines completos


Codeberg (Woodpecker)
2-4GB
2-4 cores
-
2-4min
Builds leves


Hugging Face Spaces
16GB
2 cores
50GB
Sem limite*
Apps Docker


Kaggle Notebooks
29-30GB
4 cores
20GB
12h/session
ML/AI


Forgejo/Gitea (self-hosted)
Ilimitado**
Ilimitado**
Ilimitado**
Sem limite
Infraestrutura própria


*HF Free dorme após 48h de inatividade
**Depende do hardware do host

2. Arquitetura Recomendada
┌─────────────────────────────────────────────────────────┐
│                    SEU FRONTEND                         │
│              (Web UI / API / CLI)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌───────────────┐ ┌──────────┐ ┌───────────────────┐
│  GitHub       │ │ GitLab   │ │ Gitea/Forgejo     │
│  Actions      │ │ CI/CD    │ │ Actions (self)    │
│  (2000min/mês)│ │(400min/m)│ │ (ilimitado)       │
└───────┬───────┘ └────┬─────┘ └─────────┬─────────┘
        │              │                  │
        ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│              DOCKER SANDBOX CONTAINERS                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ User A  │  │ User B  │  │ User C  │  │ User D  │  │
│  │ 8GB RAM │  │ 4GB RAM │  │ 8GB RAM │  │ 2GB RAM │  │
│  │ Linux   │  │ Linux   │  │ Linux   │  │ Linux   │  │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────┘

3. Implementação Passo a Passo
Opção A: Self-Hosted (Mais Poderoso)
Stack:

Gitea ou Forgejo (Git hosting + CI/CD)
Woodpecker CI ou Gitea Actions (pipelines)
Docker (sandboxes)
SQLite/PostgreSQL/MySQL (banco de dados via Drizzle ORM ou Prisma)

Estrutura de Scripts:
sandbox-platform/
├── docker-compose.yml          # Orquestração principal
├── gitea/
│   ├── app.ini                 # Config do Gitea
│   └── Dockerfile
├── runner/
│   ├── config.yaml             # Config do runner (limits de RAM/CPU)
│   ├── Dockerfile
│   └── setup.sh
├── sandbox/
│   ├── Dockerfile              # Imagem base das sandboxes
│   ├── docker-entrypoint.sh    # Script de inicialização
│   └── sandbox-manager.js      # Gerencia criação/remoção
├── api/
│   ├── server.js               # API Node.js
│   ├── routes/
│   │   ├── sandbox.js          # CRUD de sandboxes
│   │   ├── pipeline.js         # Gerenciamento de pipelines
│   │   └── cron.js             # Cron jobs
│   └── db/
│       ├── schema.ts           # Drizzle ORM schema
│       └── index.ts
├── workflows/
│   ├── .gitea/workflows/
│   │   ├── create-sandbox.yml  # Workflow de criação
│   │   ├── destroy-sandbox.yml # Workflow de destruição
│   │   └── cron-cleanup.yml    # Limpeza periódica
│   └── .woodpecker/
│       └── sandbox.yml
└── package.json
docker-compose.yml:
version: '3.8'

services:
  gitea:
    image: gitea/gitea:latest
    container_name: gitea
    ports:
      - "3000:3000"
      - "2222:22"
    volumes:
      - gitea_data:/data
      - ./gitea/app.ini:/data/gitea/conf/app.ini:ro
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: unless-stopped

  woodpecker-server:
    image: woodpeckerci/woodpecker-server:latest
    container_name: woodpecker-server
    ports:
      - "8000:8000"
    volumes:
      - woodpecker_data:/var/lib/woodpecker
    environment:
      - WOODPECKER_OPEN=true
      - WOODPECKER_AGENT_SECRET=${AGENT_SECRET}
      - WOODPECKER_GITEA=true
      - WOODPECKER_GITEA_URL=http://gitea:3000
    depends_on:
      - gitea
    restart: unless-stopped

  woodpecker-agent:
    image: woodpeckerci/woodpecker-agent:latest
    container_name: woodpecker-agent
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WOODPECKER_SERVER=woodpecker-server:9000
      - WOODPECKER_AGENT_SECRET=${AGENT_SECRET}
    depends_on:
      - woodpecker-server
    restart: unless-stopped

  api:
    build: ./api
    container_name: api
    ports:
      - "4000:4000"
    volumes:
      - ./api:/app
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DATABASE_URL=sqlite:///data/sandboxes.db
      - GITEA_URL=http://gitea:3000
      - GITEA_TOKEN=${GITEA_TOKEN}
    depends_on:
      - gitea
    restart: unless-stopped

volumes:
  gitea_data:
  woodpecker_data:
Runner Config (config.yaml) - Limites de RAM/CPU:
runner:
  capacity: 2                    # Jobs simultâneos
  labels:
    - "sandbox-8gb:docker://sandbox-image:latest"
    - "sandbox-4gb:docker://sandbox-image:latest"
    - "sandbox-2gb:docker://sandbox-image:latest"

container:
  # Limites globais por job
  options: "--memory=8g --cpus=4 --pids-limit=512"
  docker_host: "-"
  valid_volumes:
    - '**'

cache:
  enabled: true
  dir: '/tmp/cache'
  host: ''
  port: 0
Sandbox Dockerfile:
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl wget git vim nano htop \
    nodejs npm python3 python3-pip \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Cria usuário non-root
RUN useradd -m -s /bin/bash sandbox
USER sandbox
WORKDIR /home/sandbox

# Script de inicialização
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
docker-entrypoint.sh:
#!/bin/bash
set -e

# Configura limites de memória se definidos
if [ -n "$SANDBOX_MEMORY_LIMIT" ]; then
    echo "Memory limit: $SANDBOX_MEMORY_LIMIT"
fi

# Inicia o shell interativo ou comando customizado
if [ $# -eq 0 ]; then
    exec /bin/bash
else
    exec "$@"
fi
API - sandbox-manager.js:
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

class SandboxManager {
  async create(userId, options = {}) {
    const {
      memory = '4g',
      cpus = 2,
      disk = '10g',
      image = 'sandbox-image:latest'
    } = options;

    const container = await docker.createContainer({
      Image: image,
      HostConfig: {
        Memory: this.parseMemory(memory),
        NanoCpus: cpus * 1e9,
        PidsLimit: 512,
        Privileged: false,
        SecurityOpt: ['no-new-privileges'],
        Binds: [`/data/sandboxes/${userId}:/home/sandbox/data`]
      },
      Env: [
        `SANDBOX_MEMORY_LIMIT=${memory}`,
        `SANDBOX_USER=${userId}`
      ],
      Labels: {
        'sandbox.user': userId,
        'sandbox.created': new Date().toISOString()
      }
    });

    await container.start();
    return { id: container.id, status: 'running' };
  }

  async destroy(containerId) {
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
  }

  async list(userId) {
    const containers = await docker.listContainers({
      filters: { label: [`sandbox.user=${userId}`] }
    });
    return containers;
  }

  parseMemory(mem) {
    const units = { 'b': 1, 'k': 1024, 'm': 1024**2, 'g': 1024**3 };
    const match = mem.match(/^(\d+)([bkmg])$/i);
    return parseInt(match[1]) * (units[match[2].toLowerCase()] || 1);
  }
}

module.exports = new SandboxManager();
Cron Job - Cleanup (workflows/cron-cleanup.yml):
name: Cleanup Old Sandboxes

on:
  schedule:
    - cron: '0 */6 * * *'  # A cada 6 horas

jobs:
  cleanup:
    runs-on: sandbox-2gb
    steps:
      - name: Remove sandboxes antigas
        run: |
          docker ps -a --filter "label=sandbox" --format "{{.ID}} {{.CreatedAt}}" | \
          while read id created; do
            # Remove sandboxes com mais de 24h
            docker rm -f $id
          done

      - name: Limpa imagens não usadas
        run: docker image prune -f

Opção B: Usando Infraestrutura Gratuita (Sem Self-Host)
Estratégia: GitHub/GitLab como "orquestrador"
# .github/workflows/create-sandbox.yml
name: Create Sandbox

on:
  workflow_dispatch:
    inputs:
      user_id:
        description: 'User ID'
        required: true
      memory:
        description: 'Memory (2g, 4g, 8g)'
        default: '4g'
      cpu:
        description: 'CPU cores'
        default: '2'

jobs:
  create-sandbox:
    runs-on: ubuntu-latest
    container:
      image: docker:latest
      options: --privileged
    steps:
      - name: Setup Docker
        uses: docker/setup-buildx-action@v3

      - name: Create Sandbox Container
        run: |
          docker run -d \
            --name sandbox-${{ inputs.user_id }} \
            --memory ${{ inputs.memory }} \
            --cpus ${{ inputs.cpu }} \
            --label "user=${{ inputs.user_id }}" \
            --label "created=$(date -Iseconds)" \
            -v /data/${{ inputs.user_id }}:/home/sandbox/data \
            sandbox-image:latest

      - name: Expose SSH (opcional)
        run: |
          # Configura SSH tunnel via cloudflared ou ngrok
          docker exec sandbox-${{ inputs.user_id }} bash -c \
            "curl -s https://cloudflared.com/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && \
             cloudflared tunnel --url ssh://localhost:22"

      - name: Output Connection Info
        run: |
          echo "### Sandbox Created" >> $GITHUB_STEP_SUMMARY
          echo "- Container: sandbox-${{ inputs.user_id }}" | >> $GITHUB_STEP_SUMMARY
          echo "- Memory: ${{ inputs.memory }}" >> $GITHUB_STEP_SUMMARY
          echo "- CPU: ${{ inputs.cpu }}" >> $GITHUB_STEP_SUMMARY
Hugging Face Spaces (Docker Sandbox):
# HF Spaces aceitam Dockerfile diretamente
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl wget git vim \
    nodejs npm python3 python3-pip

# Expõe porta para web terminal
EXPOSE 7860

# Instala code-server (VS Code na web)
RUN curl -fsSL https://code-server.dev/install.sh | sh
CMD ["code-server", "--bind-agg", "0.0.0.0", "--port", "7860"]

4. Limites e Macetes
GitHub Actions (2000 min/mês grátis):
# Para maximizar minutos:
runs-on: ubuntu-latest  # Não use macos/windows (10x mais caro)
# Public repos = ilimitado grátis
# Private repos = 2000 min/mês
GitLab CI (400 compute minutes grátis):
# Usar runner small (1x cost factor):
tags:
  - saas-linux-small-amd64
# Evitar medium/large (2x-3x cost factor)
Codeberg Woodpecker (grátis para projetos públicos):
# Limites por job:
# tiny: 2 CPU, 2GB RAM, 2min runtime
# small: 4 CPU, 4GB RAM, 4min runtime
# Usar "lazy" runners para economizar
runs-on: codeberg-small
Hugging Face Spaces (16GB RAM grátis):
# CPU Basic: 2 vCPU, 16GB RAM, 50GB disk
# Dorme após 48h de inatividade
# Para manter vivo: cron job a cada 47h
Kaggle (29-30GB RAM grátis):
# 4 CPU cores, 30GB RAM
# Limite: 12h por sessão, 30h/semana (GPU)
# Usar kgz para controle via terminal

5. Database Schema (Drizzle ORM)
// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const sandboxes = sqliteTable('sandboxes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  status: text('status').notNull(), // running, stopped, destroyed
  containerId: text('container_id'),
  memory: text('memory').default('4g'),
  cpu: integer('cpu').default(2),
  platform: text('platform'), // github, gitlab, gitea, hf
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

export const pipelines = sqliteTable('pipelines', {
  id: text('id').primaryKey(),
  sandboxId: text('sandbox_id').references(() => sandboxes.id),
  trigger: text('trigger').notNull(), // manual, cron, webhook
  status: text('status').notNull(),
  output: text('output'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

6. Resumo das Possibilidades



Cenário
Viável?
Recomendação



Sandbox temporário (build/test)
Sim
GitHub/GitLab Actions


Sandbox persistente (desenvolvimento)
Parcial
HF Spaces + cron keep-alive


Sandbox com muita RAM (8GB+)
Sim
Kaggle (30GB) ou self-hosted


Sandbox com GPU
Sim
Kaggle (P100/T4 grátis) ou HF ZeroGPU


Sandbox ilimitado
Sim
Self-hosted Gitea/Forgejo


Pipeline automática
Sim
Todas suportam cron/webhooks



7. Próximos Passos Recomendados

Comece com Gitea + Woodpecker self-hosted (mais controle)
Use GitHub Actions para builds temporários (2000 min/mês grátis)
Hugging Face Spaces para apps web (16GB RAM grátis)
Kaggle para workloads pesados (30GB RAM + GPU grátis)
Implemente Drizzle ORM para gerenciar estado das sandboxes
Adicione cron jobs para cleanup automático

Quer que eu implemente alguma parte específica? Por exemplo:

O docker-compose.yml completo?
A API Node.js com Drizzle ORM?
Os workflows de CI/CD?
O gerenciador de sandboxes?
