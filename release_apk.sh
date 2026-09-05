#!/data/data/com.termux/files/usr/bin/bash
set -e

PROJECT_DIR="/data/data/com.termux/files/home/kasku"
cd "$PROJECT_DIR"

echo "=========================================================="
echo "🚀 [1/5] Menjalankan build APK KasKu terbaru..."
echo "=========================================================="
bash ./build_apk.sh

# Baca versionName terbaru dari AndroidManifest.xml
VERSION=$(grep -o 'android:versionName="[^"]*"' /data/data/com.termux/files/home/kasku_build/AndroidManifest.xml | cut -d'"' -f2 || echo "1.1.95")
echo "📦 Versi yang dirilis: v$VERSION"

echo "=========================================================="
echo "📋 [2/5] Menyamakan file APK dan path downloadUrl..."
echo "=========================================================="
# Pastikan nama file APK sama persis dengan yang ada di version.json (/apk/KasKu.apk)
cp KasKu.apk public/apk/KasKu.apk
cp KasKu.apk public/apk/kasku.apk

APK_SIZE_BYTES=$(wc -c < KasKu.apk | tr -d ' ')
APK_SIZE_HUMAN=$(du -h KasKu.apk | cut -f1)

echo "Ukuran APK: $APK_SIZE_HUMAN ($APK_SIZE_BYTES bytes)"

echo "=========================================================="
echo "📝 [3/5] Mengatur version.json..."
echo "=========================================================="
# Update metadata rilis di version.json
# Secara default, rilis baru ditandai sebagai optional update
# (minRequiredVersion tetap dapat ditentukan manual atau menggunakan parameter argumen ke-1)
python3 -c "
import json, sys

path = 'public/version.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

ver = '$VERSION'
data['latestVersion'] = ver

# Cek argumen CLI opsional: jika diberikan minReqVer misal ./release_apk.sh 1.1.95
if len(sys.argv) > 1 and sys.argv[1].strip():
    data['minRequiredVersion'] = sys.argv[1].strip()
    data['forceUpdate'] = (data['minRequiredVersion'] == ver)
else:
    # Pertahankan minRequiredVersion yang sudah ada jika tidak ingin memaksa update
    pass

if data.get('releases') and len(data['releases']) > 0:
    data['releases'][0]['fileSize'] = '$APK_SIZE_HUMAN'
    data['releases'][0]['downloadUrl'] = '/apk/KasKu.apk'

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('Status version.json:')
print('latestVersion:', data.get('latestVersion'))
print('minRequiredVersion:', data.get('minRequiredVersion'))
print('forceUpdate:', data.get('forceUpdate'))
" "$@"

echo "=========================================================="
echo "📤 [4/5] Melakukan Git Commit & Push ke origin/main..."
echo "=========================================================="
git add -A
git commit -m "Release KasKu APK v$VERSION" || echo "Tidak ada perubahan baru untuk di-commit"
git push origin main

echo "=========================================================="
echo "✅ [5/5] Rilis v$VERSION Sukses Di-push ke GitHub & Vercel!"
echo "Website kasku.kheireditz.my.id sedang melakukan auto-deploy."
echo "=========================================================="
