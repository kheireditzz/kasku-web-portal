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

echo "=== [1/6] Meng-bundle React Component dengan esbuild ==="
node /data/data/com.termux/files/home/Nilaidbam/node_modules/esbuild/bin/esbuild \
  "$PROJECT_DIR/entry.tsx" \
  --bundle \
  --minify \
  --define:process.env.NODE_ENV=\"production\" \
  --loader:.jpg=dataurl \
  --loader:.png=dataurl \
  --outfile="$BUILD_DIR/assets/app.bundle.js"

echo "=== [2/6] Memperbarui asset static ke kasku_build ==="
cp "$PROJECT_DIR/public/app-logo.jpg" "$BUILD_DIR/assets/app-logo.jpg" 2>/dev/null || true

echo "=== [3/6] Meng-compile Resource & Generate R.java (AAPT2) ==="
mkdir -p "$BUILD_DIR/build/gen" "$BUILD_DIR/build/classes" "$BUILD_DIR/build/dex"
aapt2 compile --dir "$BUILD_DIR/res" -o "$BUILD_DIR/build/resources.zip"

aapt2 link "$BUILD_DIR/build/resources.zip" \
  -I "$ANDROID_JAR" \
  -A "$BUILD_DIR/assets" \
  --manifest "$BUILD_DIR/AndroidManifest.xml" \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  --version-code 102 \
  --version-name "1.1.2" \
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
cp "$BUILD_DIR/build/KasKu.apk" "$PROJECT_DIR/public/apk/kasku.apk" 2>/dev/null || true
cp "$BUILD_DIR/build/KasKu.apk" /sdcard/Download/KasKu.apk 2>/dev/null || true
cp "$BUILD_DIR/build/KasKu.apk" /storage/emulated/0/Download/KasKu.apk 2>/dev/null || true
cp "$BUILD_DIR/build/KasKu.apk" /data/data/com.termux/files/home/storage/downloads/KasKu.apk 2>/dev/null || true

echo "=========================================================="
echo "🎉 Build APK KasKu Sukses!"
echo "Lokasi APK: $PROJECT_DIR/KasKu.apk"
echo "Download HP: /sdcard/Download/KasKu.apk"
echo "Ukuran: $(du -h "$BUILD_DIR/build/KasKu.apk" | cut -f1)"
echo "=========================================================="
