# buckets/rclone_terabox.sh - Rclone agregador 70+ storages, Terabox 1TB free por conta

# Rclone suporta: S3, GDrive, Dropbox, OneDrive, Terabox, HuggingFace, etc
# Você tem 3 contas Terabox 1TB cada = 3TB free

# Instala rclone
# curl https://rclone.org/install.sh | sudo bash

# Configura 3 contas Terabox
# rclone config -> new -> terabox -> auth

# Upload para Terabox conta 1
# rclone copy docs/results/ terabox1:opencode-storage/ --progress --transfers 8

# Upload para Terabox conta 2 (shard)
# rclone copy docs/results/ terabox2:opencode-storage/ --progress

# Upload para Terabox conta 3
# rclone copy docs/results/ terabox3:opencode-storage/ --progress

# Multi-cloud sync: copia de Terabox para HuggingFace para Kaggle
# rclone sync terabox1:opencode-storage/ huggingface:opencode-storage/
# rclone sync terabox1:opencode-storage/ kaggle:opencode-storage/

# Lista todos remotes
# rclone listremotes

# Rclone serve como CDN: rclone serve http terabox1:opencode-storage/ --addr :8080

echo "Terabox Free: 1TB por conta, arquivo max 4GB free, 20GB premium, 300 arquivos por vez"
echo "3 contas = 3TB free sem gastar sua máquina"
echo "Rclone backends: https://rclone.org/docs/#providers (70+)"

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
