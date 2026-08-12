# farm.py - Orquestra N repos para multiplicar storage ilimitado
# Ideia: 1 repo = 500MB artifact free. 10 repos = 5GB, 100 repos = 50GB ilimitado

import os, requests

# Lista de repos workers (você cria via API)
WORKER_REPOS = [
    "seuuser/opencode-worker-1",
    "seuuser/opencode-worker-2",
    "seuuser/opencode-worker-3",
    # ... adicione 100
]

TOKEN = os.getenv("GITHUB_TOKEN")

def dispatch_to_farm(filename, job_id):
    for repo in WORKER_REPOS:
        owner, name = repo.split("/")
        url = f"https://api.github.com/repos/{owner}/{name}/actions/workflows/process-binary.yml/dispatches"
        payload = {
            "ref": "main",
            "inputs": {"job_id": job_id, "filename": filename, "action": "run"}
        }
        r = requests.post(url, json=payload, headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json"
        })
        print(f"{repo}: {r.status_code}")
        if r.status_code == 204:
            break # conseguiu um worker

if __name__ == "__main__":
    dispatch_to_farm("binary.wasm", "job-123")

#!/bin/bash
# Script: Transforma Armazenamento em RAM / Processamento
# Uso: ./scripts/storage-as-ram.sh

echo "=== Transformando Storage em Processamento ==="
echo "Antes:" && free -h

# 1. Swap file - transforma disco em RAM virtual
echo "[1] Criando swap 16GB em /mnt/swapfile..."
sudo fallocate -l 16G /mnt/swapfile 2>/dev/null || sudo dd if=/dev/zero of=/mnt/swapfile bs=1G count=16
sudo chmod 600 /mnt/swapfile
sudo mkswap /mnt/swapfile
sudo swapon /mnt/swapfile

# 2. tmpfs RAM disk - RAM que parece storage
echo "[2] Criando RAM disk 8GB em /mnt/ramdisk..."
sudo mkdir -p /mnt/ramdisk
sudo mount -t tmpfs -o size=8G tmpfs /mnt/ramdisk

# 3. ZRAM - comprime RAM para caber mais
echo "[3] Ativando ZRAM..."
sudo modprobe zram 2>/dev/null || true
echo 2G | sudo tee /sys/block/zram0/disksize 2>/dev/null || true

# 4. Usar /dev/shm (já é tmpfs) como workspace ultra rápido
echo "[4] Usando /dev/shm como workspace..."
mkdir -p /dev/shm/opencode-workspace

echo "Depois:" && free -h && swapon --show && df -h /mnt/ramdisk /dev/shm

echo "Pronto: Storage virou RAM. Use /mnt/ramdisk e /dev/shm para processar binários sem pesar disco."

# buckets/huggingface_upload.py - Usa Hugging Face como bucket ilimitado de terceiros
from huggingface_hub import HfApi, upload_folder
import os

# Free: public best-effort ilimitado, private 100GB
# PRO $9/mo: 10TB public + 1TB private
# Cada arquivo até 500GB com Xet backend

api = HfApi(token=os.getenv("HF_TOKEN"))

REPO_ID = "seuuser/opencode-storage" # dataset repo
REPO_TYPE = "dataset" # dataset tem viewer, melhor para binários

# Cria repo se não existe
api.create_repo(REPO_ID, repo_type=REPO_TYPE, exist_ok=True, private=False)

# Upload pasta dumps como dataset
upload_folder(
    folder_path="docs/results",
    repo_id=REPO_ID,
    repo_type=REPO_TYPE,
    commit_message="feat: dump from browser via third-party"
)

print(f"Upload feito: https://huggingface.co/datasets/{REPO_ID}")
# Acesso via CDN: https://huggingface.co/datasets/{REPO_ID}/resolve/main/arquivo.bin

# buckets/kaggle_upload.py - Kaggle como bucket 200GB por dataset, público ilimitado
# Limite: 200GB por dataset, 50 arquivos top-level, privado total 200GB, público ilimitado

import os, json, subprocess, pathlib

DATASET_NAME = "seuuser-opencode-storage-part-001" # cada dataset 200GB
DATASET_PATH = pathlib.Path("docs/results")

# dataset-metadata.json
meta = {
    "title": "opencode-storage-part-001",
    "id": f"seuuser/{DATASET_NAME}",
    "licenses": [{"name": "mit"}],
    "resources": [{"path": "results", "description": "binários processados"}]
}

(DATASET_PATH / "dataset-metadata.json").write_text(json.dumps(meta, indent=2))

# Cria ou versiona
# kaggle datasets create -p docs/results --dir-mode tar
# kaggle datasets version -p docs/results -m "add more bins"

print("Kaggle: cada dataset público = 200GB free ilimitado. Crie N datasets para N*200GB")
print("10 datasets = 2TB free, 100 datasets = 20TB")