# assistant

[Thinking] The user wants me to continue researching and create a comprehensive todo list of all the topics mentioned. They want me to research:

Git hosting platforms: GitHub, GitLab, Forgejo, Gitea, Codeberg
ML/AI platforms: Hugging Face, Kaggle, ModelScope
Databases: Drizzle ORM, Prisma, MySQL2
Node.js, Python, Rust frameworks
Memory emulation/bridging (storage to RAM conversion) - zram, tmpfs, frontswap, zswap
GPU emulation - virtio-gpu, virglrenderer, rutabaga_gfx
Docker sandboxes
Pipelines, cron jobs
Open source projects that do this alreadyLet me continue with more searches to be comprehensive.

[Thinking] Now let me search for more specific topics the user mentioned - npm packages, Python libraries, Rust tools, etc.

[Thinking] Now I have comprehensive research on all the topics. Let me also search for a few more specific topics the user mentioned:

Archbox and other sandbox alternatives
Open source projects that combine all these
npm packages for memory management

[Thinking] Now I have comprehensive research on all the topics. Let me compile a comprehensive todo list for the user.

Continuando a pesquisa completa. Vou buscar cada tópico mencionado:

Aqui está a TODO LIST COMPLETA de pesquisa, organizada por categorias:

TODO LIST DE PESQUISA COMPLETA
1. GIT HOSTING + CI/CD (Infraestrutura Gratuita)



#
Plataforma
RAM Gratuita
CPU
Disk
Tempo
URL



1.1
GitHub Actions
7GB
2 cores
14GB
6h/job
github.com/features/actions


1.2
GitLab CI
8GB
2 cores
30GB
50min/job
about.gitlab.com/pricing


1.3
Gitea Actions (self-hosted)
Ilimitado*
Ilimitado*
Ilimitado*
Sem limite
gitea.com


1.4
Forgejo Actions (self-hosted)
Ilimitado*
Ilimitado*
Ilimitado*
Sem limite
forgejo.org


1.5
Codeberg Woodpecker CI
2-4GB
2-4 cores
-
2-4min
codeberg.org


1.6
Codeberg Forgejo Actions
2-4GB
4 cores
4GB
4min
ci.codeberg.org


*Depende do hardware do host
2. ML/AI PLATFORMS (Compute Gratuito)



#
Plataforma
RAM Gratuita
CPU/GPU
Disk
Tempo
URL



2.1
Hugging Face Spaces
16GB
2 cores
50GB
Sem limite*
huggingface.co/docs/hub


2.2
Kaggle Notebooks
29-30GB
4 cores + P100/T4 GPU
20GB
12h/session, 30h/semana GPU
kaggle.com


2.3
ModelScope
Variável
CPU/GPU
Variável
Variável
modelscope.cn


2.4
HF ZeroGPU
16GB
H200 slices
50GB
3.5min/dia (free)
huggingface.co


*HF Free dorme após 48h de inatividade
3. SANDBOX/CONTAINER OPEN SOURCE (Projetos)



#
Projeto
Linguagem
Tipo
RAM
Boot Time
URL



3.1
CubeSandbox (TencentCloud)
Rust+Go
KVM MicroVM
<5MB overhead
<60ms
github.com/TencentCloud/CubeSandbox


3.2
Firecracker (AWS)
Rust
KVM MicroVM
<5MB
<150ms
github.com/firecracker-microvm/firecracker


3.3
E2B
TypeScript
Cloud sandbox
-
<100ms
e2b.dev


3.4
sandboxd
Go
Docker sandbox
-
~1s
github.com/tastyeffectco/sandboxd


3.5
Containarium
Go
LXC containers
Variável
~1s
github.com/footprintai/containarium


3.6
HiveBox
Rust
Linux namespaces
2-5MB
10-50ms
github.com/TetiAI/hivebox


3.7
Nucleus
Rust
OCI runtime
Mínimo
Rápido
github.com/sig-id/nucleus


3.8
Crucible
Go
Firecracker
<5MB
<170ms
github.com/gnana997/crucible


3.9
Mitos
Go+Rust
Firecracker + K8s
<5MB
~27ms
github.com/mitos-run/mitos


3.10
arch-sandbox
Go
systemd-nspawn
Mínimo
Rápido
github.com/OminduD/arch-sandbox


3.11
gitvm
Go
Firecracker+Docker
Variável
~125ms
github.com/open-gitagent/gitvm


4. SANDCastle (TypeScript Sandbox Orchestrator)



#
Pacote
Descrição
URL



4.1
@ai-hero/sandcastle
Orquestra coding agents em sandboxes
npmjs.com/package/@ai-hero/sandcastle


4.2
sandbox-orchestrator
API Node.js para execução Docker
github.com/dea1j/sandbox-orchestrator


4.3
agentic-control
Orquestração multi-agent com sandbox
npmjs.com/package/@jbcom/agentic


5. DATABASES (ORMs)



#
ORM
Drivers Suportados
URL



5.1
Drizzle ORM
SQLite, PostgreSQL, MySQL, Turso, Neon, D1, etc.
orm.drizzle.team


5.2
Prisma
PostgreSQL, MySQL, SQLite, MongoDB
prisma.io


5.3
mysql2
MySQL nativo
npmjs.com/package/mysql2


6. MEMÓRIA: Storage → RAM Bridge



#
Tecnologia
Descrição
URL



6.1
zram
Dispositivo bloco RAM-comprimido
docs.kernel.org/admin-guide/blockdev/zram.html


6.2
zswap
Cache comprimido para swap
kernel.org/doc/html/v6.3/admin-guide/mm/zswap.html


6.3
tmpfs
Sistema de arquivos em RAM
(nativo Linux)


6.4
Frontswap
Interface "transcendent memory"
docs.kernel.org/6.0/mm/frontswap.html


6.5
zram-config
Utilitário completo zram (Raspberry Pi)
github.com/ecdye/zram-config


6.6
node-shared-mem
Shared memory para Node.js
npmjs.com/package/node-shared-mem


6.7
shmmap.js
mmap + POSIX shm para Node.js
npmjs.com/package/shmmap


6.8
shm-typed-array
IPC shared memory Node.js
npmjs.com/package/shm-typed-array


7. GPU EMULATION / VIRTUALIZATION



#
Projeto
Descrição
URL



7.1
virtio-gpu (QEMU)
GPU paravirtualizada
qemu.readthedocs.io


7.2
virglrenderer
OpenGL emulado via Gallium3D
gitlab.freedesktop.org/virgl


7.3
rutabaga_gfx
Abstração GPU cross-platform (Rust)
github.com/magma-gpu/rutabaga_gfx


7.4
vhost-device-gpu
Daemon GPU emulation (Rust)
crates.io/crates/vhost-device-gpu


7.5
virtio-win drivers
Drivers GPU para Windows guests
github.com/arehnman/kvm-guest-drivers-windows


8. PYTHON SANDBOX LIBRARIES



#
Pacote
Descrição
URL



8.1
python-sandbox (Onyx)
Execução Python segura em Docker
github.com/onyx-dot-app/python-sandbox


8.2
agt_sandbox (Microsoft)
Sandbox multi-backend (Docker/HyperLight/ACA)
pypi.org/project/agt_sandbox


8.3
onit-sandbox
MCP server sandbox Python
github.com/sibyl-oracles/onit-sandbox


8.4
mcp-sandbox
Python sandbox para LLMs
github.com/johanli233/mcp-sandbox


8.5
rlm-python
Execução código LLM com Docker sandbox
pypi.org/project/rlm-python


9. RUST SANDBOX CRATES



#
Crate
Descrição
URL



9.1
firecracker
SDK Rust para Firecracker API
crates.io/crates/firecracker


9.2
fctools
SDK modular Firecracker
crates.io/crates/fctools


9.3
firecracker-rs-sdk
SDK Firecracker (std/tokio/async-std)
github.com/xuehaonan27/firecracker-rs-sdk


10. NODE.JS FRAMEWORKS + FERRAMENTAS



#
Pacote
Descrição
URL



10.1
dockerode
Cliente Docker para Node.js
npmjs.com/package/dockerode


10.2
docker-compose
Orquestração Docker
npmjs.com/package/docker-compose


10.3
@huggingface/inference
API Hugging Face
npmjs.com/package/@huggingface/inference


11. Z.AI / ChatGLM INFRAESTRUTURA



#
Projeto
Descrição
URL



11.1
GLM-5
Modelo Z.AI com deploy Docker
github.com/zai-org/GLM-5


11.2
Z.ai2api
Proxy OpenAI-compatible
github.com/hmjz100/Z.ai2api


11.3
GLM-ZAI-2API
Proxy Go para Z.AI
github.com/D3-vin/GLM-ZAI-2API


11.4
Oxide-Agent
Bot Telegram com sandbox Rust
github.com/0FL01/Oxide-Agent


11.5
sandcastle-zai
Sandcastle com provider Z.AI
github.com/ShavedTundra/sandcastle-zai


12. MULTI-AGENT ORCHESTRATION



#
Projeto
Descrição
URL



12.1
Clawix
Multi-agent com Docker isolamento
github.com/ClawixAI/clawix


12.2
stateful-agentic-sandbox
Node.js + Python sandbox
github.com/Daniel5569/stateful-agentic-sandbox-orchestrator


12.3
E2B alternatives
Comparativo completo
amux.io/guides/ai-agent-sandboxing


13. DOCKER HARDENING



#
Recurso
Comando/Flag



13.1
Network isolation
--network=none


13.2
Drop capabilities
--cap-drop=ALL


13.3
No privilege escalation
--security-opt=no-new-privileges


13.4
Read-only rootfs
--read-only


13.5
Memory limit
--memory=8g


13.6
CPU limit
--cpus=4


13.7
PID limit
--pids-limit=512


13.8
gVisor runtime
--runtime=runsc


14. PROJETOS COMPARATIVOS (quem faz o quê)



Projeto
Isolamento
Startup
Overhead
Self-hosted
Open Source



Docker
Namespaces
<1s
<2% CPU
Sim
Apache 2.0


Firecracker
KVM MicroVM
<150ms
<5MB
Sim
Apache 2.0


CubeSandbox
KVM + eBPF
<60ms
<5MB
Sim
Apache 2.0


HiveBox
NS + seccomp + Landlock
10-50ms
2-5MB
Sim
MIT


Crucible
Firecracker
<170ms
<5MB
Sim
Apache 2.0


gVisor
Syscall emulation
<1s
5-15%
Sim
Apache 2.0


E2B
Firecracker (cloud)
<100ms
<5MB
Parcial
Parcial


15. DEPLOYMENT + ORCHESTRATION



#
Ferramenta
Descrição



15.1
Docker Compose
Orquestração local multi-container


15.2
Kubernetes
Orquestração clusters


15.3
Nomad
Orquestração HashiCorp


15.4
systemd-nspawn
Containers leves Linux


15.5
LXC/Incus
System containers



RESUMO: ESTRATÉGIA RECOMENDADA
Para sandbox gratuito com infraestrutura de terceiros:

GitHub/GitLab Actions para builds temporários
Hugging Face Spaces para apps web persistentes
Kaggle para workloads pesados com GPU

Para sandbox self-hosted (mais controle):

CubeSandbox (melhor: <60ms boot, <5MB overhead, E2B-compatible)
Firecracker (proven: AWS Lambda usa)
HiveBox (mais leve: 2-5MB, 10-50ms)
sandboxd (mais simples: Go, Docker, SQLite)

Para memória virtual:

zram + tmpfs (nativo Linux)
node-shared-mem / shmmap.js (Node.js)

Para banco de dados:

Drizzle ORM (mais leve, TypeScript)
Prisma (mais features)

Para GPU virtual:

virglrenderer (OpenGL)
rutabaga_gfx (cross-platform)

Quer que eu implemente alguma parte específica?
