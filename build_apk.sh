#!/data/data/com.termux/files/usr/bin/bash
set -e

PROJECT_DIR="/data/data/com.termux/files/home/kasku"
BUILD_DIR="/data/data/com.termux/files/home/kasku_build"
SDK_DIR="/data/data/com.termux/files/home/android-sdk"
ANDROID_JAR="$SDK_DIR/platforms/android-34/android.jar"
BUILD_TOOLS="$SDK_DIR/build-tools/36.0.0"
KEYSTORE="$PROJECT_DIR/kasku_android.keystore"
KEYSTORE_PASS="kasku123"
KEY_ALIAS="kasku"

echo "=== [0/6] Auto-Increment Version Checker ==="
# Baca versionCode lama dari AndroidManifest.xml
CURRENT_CODE=$(grep -o 'android:versionCode="[0-9]*"' "$BUILD_DIR/AndroidManifest.xml" | grep -o '[0-9]*' || echo "104")
# Baca versionName lama dari AndroidManifest.xml
CURRENT_NAME=$(grep -o 'android:versionName="[^"]*"' "$BUILD_DIR/AndroidManifest.xml" | cut -d'"' -f2 || echo "1.1.4")

if [ "$1" == "--same-version" ] || [ "$1" == "--no-bump" ]; then
    NEXT_CODE=$CURRENT_CODE
    NEXT_NAME=$CURRENT_NAME
    echo "⚡ Membangun ulang versi yang sama: v$NEXT_NAME (Code: $NEXT_CODE)"
else
    NEXT_CODE=$((CURRENT_CODE + 1))
    # Hitung patch version berikutnya (contoh: 1.1.4 -> 1.1.5)
    NEXT_NAME=$(python3 -c "
v = '$CURRENT_NAME'.split('.')
if len(v) == 3 and v[2].isdigit():
    v[2] = str(int(v[2]) + 1)
    print('.'.join(v))
else:
    print('$CURRENT_NAME')
")
    echo "🚀 Meningkatkan Versi: v$CURRENT_NAME (Code: $CURRENT_CODE) ➔ v$NEXT_NAME (Code: $NEXT_CODE)"
fi

# 1. Update AndroidManifest.xml
sed -i "s/android:versionCode=\"[0-9]*\"/android:versionCode=\"$NEXT_CODE\"/g" "$BUILD_DIR/AndroidManifest.xml"
sed -i "s/android:versionName=\"[^\"]*\"/android:versionName=\"$NEXT_NAME\"/g" "$BUILD_DIR/AndroidManifest.xml"

# 2. Update konstanta APP_CURRENT_VERSION di page.tsx
sed -i "s/const APP_CURRENT_VERSION = '[^']*'/const APP_CURRENT_VERSION = '$NEXT_NAME'/g" "$PROJECT_DIR/app/app/page.tsx"

# 3. Update public/version.json (Hanya jika versi bertambah)
if [ "$1" != "--same-version" ] && [ "$1" != "--no-bump" ]; then
python3 -c "
import json, os

path = '$PROJECT_DIR/public/version.json'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data['latestVersion'] = '$NEXT_NAME'
    data['minRequiredVersion'] = '$NEXT_NAME'
    
    # Tambah rilis baru di paling atas
    new_release = {
        'version': '$NEXT_NAME',
        'releaseDate': '$(date +%Y-%m-%d)',
        'fileSize': '372 KB',
        'downloadUrl': '/apk/KasKu.apk',
        'isLatest': True,
        'minAndroid': 'Android 7.0 (Nougat)+',
        'highlights': [
            'Pembaruan otomatis build KasKu v$NEXT_NAME',
            'Peningkatan kestabilan AI Voice & UI',
            'Optimasi performa & penyimpanan kas'
        ]
    }
    for r in data.get('releases', []):
        r['isLatest'] = False
    data['releases'] = [new_release] + data.get('releases', [])
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
"
fi

echo "=== [1/6] Meng-bundle React Component dengan esbuild & Tailwind CSS ==="
node /data/data/com.termux/files/home/Nilaidbam/node_modules/tailwindcss/lib/cli.js \
  -i "$PROJECT_DIR/app/globals.css" \
  -o "$BUILD_DIR/assets/styles.css" \
  --minify || true

node /data/data/com.termux/files/home/Nilaidbam/node_modules/esbuild/bin/esbuild \
  "$PROJECT_DIR/entry.tsx" \
  --bundle \
  --minify \
  --define:process.env.NODE_ENV=\"production\" \
  --loader:.jpg=dataurl \
  --loader:.png=dataurl \
  --outfile="$BUILD_DIR/assets/app.bundle.js"

echo "=== [2/6] Memperbarui asset static ke kasku_build ==="
cp "$PROJECT_DIR/public/index.html" "$BUILD_DIR/assets/index.html" 2>/dev/null || true
cp "$PROJECT_DIR/public/app-logo.jpg" "$BUILD_DIR/assets/app-logo.jpg" 2>/dev/null || true
cp "$PROJECT_DIR/public/app-logo.png" "$BUILD_DIR/assets/app-logo.png" 2>/dev/null || true
sed -i "s/app\.bundle\.js?v=[0-9]*/app\.bundle\.js?v=$NEXT_CODE/g" "$BUILD_DIR/assets/index.html" 2>/dev/null || true
sed -i "s/styles\.css?v=[0-9]*/styles\.css?v=$NEXT_CODE/g" "$BUILD_DIR/assets/index.html" 2>/dev/null || true

echo "=== [3/6] Meng-compile Resource & Generate R.java (AAPT2) ==="
mkdir -p "$BUILD_DIR/build/gen" "$BUILD_DIR/build/classes" "$BUILD_DIR/build/dex"
aapt2 compile --dir "$BUILD_DIR/res" -o "$BUILD_DIR/build/resources.zip"

aapt2 link "$BUILD_DIR/build/resources.zip" \
  -I "$ANDROID_JAR" \
  -A "$BUILD_DIR/assets" \
  --manifest "$BUILD_DIR/AndroidManifest.xml" \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  --version-code "$NEXT_CODE" \
  --version-name "$NEXT_NAME" \
  --java "$BUILD_DIR/build/gen" \
  -o "$BUILD_DIR/build/kasku_unaligned.apk" \
  --auto-add-overlay

echo "=== [4/6] Meng-compile Java Source & D8 Dex ==="
javac -d "$BUILD_DIR/build/classes" -cp "$ANDROID_JAR" \
  $(find "$BUILD_DIR/src" "$BUILD_DIR/build/gen" -name "*.java")

java -cp "$BUILD_TOOLS/lib/d8.jar" com.android.tools.r8.D8 \
  --min-api 24 \
  --lib "$ANDROID_JAR" \
  --output "$BUILD_DIR/build/dex" \
  $(find "$BUILD_DIR/build/classes" -name "*.class")

echo "=== [5/6] Memasukkan DEX ke APK & Zipalign ==="
cp "$BUILD_DIR/build/kasku_unaligned.apk" "$BUILD_DIR/build/kasku_with_dex.apk"
cd "$BUILD_DIR/build/dex"
jar uf "$BUILD_DIR/build/kasku_with_dex.apk" classes.dex
cd "$PROJECT_DIR"

python3 "/data/data/com.termux/files/home/FloatingFlow/zipalign_py.py" \
  "$BUILD_DIR/build/kasku_with_dex.apk" \
  "$BUILD_DIR/build/kasku_aligned.apk"

echo "=== [6/6] Menandatangani APK Resmi (v1 + v2 + v3) ==="
java -cp "$BUILD_TOOLS/lib/apksigner.jar" com.android.apksigner.ApkSignerTool sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:"$KEYSTORE_PASS" \
  --key-pass pass:"$KEYSTORE_PASS" \
  --ks-key-alias "$KEY_ALIAS" \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --out "$BUILD_DIR/build/KasKu.apk" \
  "$BUILD_DIR/build/kasku_aligned.apk"

# Verifikasi Signature
java -cp "$BUILD_TOOLS/lib/apksigner.jar" com.android.apksigner.ApkSignerTool verify --verbose "$BUILD_DIR/build/KasKu.apk"

# Copy ke direktori project kasku, download portal, dan folder Download HP
cp "$BUILD_DIR/build/KasKu.apk" "$PROJECT_DIR/KasKu.apk"
cp "$BUILD_DIR/build/KasKu.apk" "$PROJECT_DIR/public/apk/KasKu.apk" 2>/dev/null || true
cp "$BUILD_DIR/build/KasKu.apk" "$PROJECT_DIR/public/apk/kasku.apk" 2>/dev/null || true
cp "$BUILD_DIR/build/KasKu.apk" /sdcard/Download/KasKu.apk 2>/dev/null || true
cp "$BUILD_DIR/build/KasKu.apk" /storage/emulated/0/Download/KasKu.apk 2>/dev/null || true
cp "$BUILD_DIR/build/KasKu.apk" /data/data/com.termux/files/home/storage/downloads/KasKu.apk 2>/dev/null || true

echo "=========================================================="
echo "🎉 Build APK KasKu Sukses! (Versi Baru: v$NEXT_NAME | Code: $NEXT_CODE)"
echo "Lokasi APK: $PROJECT_DIR/KasKu.apk"
echo "Download HP: /sdcard/Download/KasKu.apk"
echo "Ukuran: $(du -h "$BUILD_DIR/build/KasKu.apk" | cut -f1)"
echo "=========================================================="
