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

echo "=========================================================="
echo "🚀 MEMULAI DUAL BUILD: 1) KASKU STANDAR  2) KASIR POS APK"
echo "=========================================================="

CURRENT_CODE=$(grep -o 'android:versionCode="[0-9]*"' "$BUILD_DIR/AndroidManifest.xml" | grep -o '[0-9]*' || echo "203")
CURRENT_NAME=$(grep -o 'android:versionName="[^"]*"' "$BUILD_DIR/AndroidManifest.xml" | cut -d'"' -f2 || echo "1.1.103")

# 1. BUNDLE REACT ASSETS TERLEBIH DAHULU
echo "=== [1/5] Meng-bundle React Component dengan esbuild & Tailwind CSS ==="
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

cp "$PROJECT_DIR/public/index.html" "$BUILD_DIR/assets/index.html" 2>/dev/null || true
cp "$PROJECT_DIR/public/app-logo.jpg" "$BUILD_DIR/assets/app-logo.jpg" 2>/dev/null || true
cp "$PROJECT_DIR/public/app-logo.png" "$BUILD_DIR/assets/app-logo.png" 2>/dev/null || true
sed -i "s/app\.bundle\.js?v=[0-9]*/app\.bundle\.js?v=$CURRENT_CODE/g" "$BUILD_DIR/assets/index.html" 2>/dev/null || true
sed -i "s/styles\.css?v=[0-9]*/styles\.css?v=$CURRENT_CODE/g" "$BUILD_DIR/assets/index.html" 2>/dev/null || true

function compile_and_sign() {
  local APK_OUTPUT_NAME="$1"
  local APP_TITLE="$2"
  local STARTUP_MODE="$3"

  echo ">>> Membangun APK: $APK_OUTPUT_NAME ($APP_TITLE) [Mode: $STARTUP_MODE] <<<"

  # Fresh index.html for each build
  cp "$PROJECT_DIR/public/index.html" "$BUILD_DIR/assets/index.html" 2>/dev/null || true
  sed -i "s/app\.bundle\.js?v=[0-9]*/app\.bundle\.js?v=$CURRENT_CODE/g" "$BUILD_DIR/assets/index.html" 2>/dev/null || true
  sed -i "s/styles\.css?v=[0-9]*/styles\.css?v=$CURRENT_CODE/g" "$BUILD_DIR/assets/index.html" 2>/dev/null || true

  # Update strings.xml app_name
  sed -i "s|<string name=\"app_name\">.*</string>|<string name=\"app_name\">$APP_TITLE</string>|g" "$BUILD_DIR/res/values/strings.xml"

  # Update index.html script mode injection
  if [ "$STARTUP_MODE" == "kasir" ]; then
    sed -i "s|<head>|<head><script>localStorage.setItem('kasku_launch_mode', 'kasir');</script>|g" "$BUILD_DIR/assets/index.html"
  else
    sed -i "s|<head>|<head><script>localStorage.setItem('kasku_launch_mode', 'overview');</script>|g" "$BUILD_DIR/assets/index.html"
  fi

  # Compile Resources
  mkdir -p "$BUILD_DIR/build/gen" "$BUILD_DIR/build/classes" "$BUILD_DIR/build/dex"
  rm -f "$BUILD_DIR/build/resources.zip"
  aapt2 compile --dir "$BUILD_DIR/res" -o "$BUILD_DIR/build/resources.zip"

  aapt2 link "$BUILD_DIR/build/resources.zip" \
    -I "$ANDROID_JAR" \
    -A "$BUILD_DIR/assets" \
    --manifest "$BUILD_DIR/AndroidManifest.xml" \
    --min-sdk-version 24 \
    --target-sdk-version 34 \
    --version-code "$CURRENT_CODE" \
    --version-name "$CURRENT_NAME" \
    --java "$BUILD_DIR/build/gen" \
    -o "$BUILD_DIR/build/kasku_unaligned.apk" \
    --auto-add-overlay

  # Compile Java
  javac -d "$BUILD_DIR/build/classes" -cp "$ANDROID_JAR" \
    $(find "$BUILD_DIR/src" "$BUILD_DIR/build/gen" -name "*.java")

  java -cp "$BUILD_TOOLS/lib/d8.jar" com.android.tools.r8.D8 \
    --min-api 24 \
    --lib "$ANDROID_JAR" \
    --output "$BUILD_DIR/build/dex" \
    $(find "$BUILD_DIR/build/classes" -name "*.class")

  cp "$BUILD_DIR/build/kasku_unaligned.apk" "$BUILD_DIR/build/kasku_with_dex.apk"
  cd "$BUILD_DIR/build/dex"
  jar uf "$BUILD_DIR/build/kasku_with_dex.apk" classes.dex
  cd "$PROJECT_DIR"

  python3 "/data/data/com.termux/files/home/FloatingFlow/zipalign_py.py" \
    "$BUILD_DIR/build/kasku_with_dex.apk" \
    "$BUILD_DIR/build/kasku_aligned.apk"

  java -cp "$BUILD_TOOLS/lib/apksigner.jar" com.android.apksigner.ApkSignerTool sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:"$KEYSTORE_PASS" \
    --key-pass pass:"$KEYSTORE_PASS" \
    --ks-key-alias "$KEY_ALIAS" \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out "$BUILD_DIR/build/$APK_OUTPUT_NAME" \
    "$BUILD_DIR/build/kasku_aligned.apk"

  # Salin ke penyimpanan
  cp "$BUILD_DIR/build/$APK_OUTPUT_NAME" "$PROJECT_DIR/$APK_OUTPUT_NAME"
  cp "$BUILD_DIR/build/$APK_OUTPUT_NAME" "$PROJECT_DIR/public/apk/$APK_OUTPUT_NAME" 2>/dev/null || true
  cp "$BUILD_DIR/build/$APK_OUTPUT_NAME" "/sdcard/Download/$APK_OUTPUT_NAME" 2>/dev/null || true
  cp "$BUILD_DIR/build/$APK_OUTPUT_NAME" "/storage/emulated/0/Download/$APK_OUTPUT_NAME" 2>/dev/null || true
  cp "$BUILD_DIR/build/$APK_OUTPUT_NAME" "/data/data/com.termux/files/home/storage/downloads/$APK_OUTPUT_NAME" 2>/dev/null || true

  echo "✅ Selesai build: $APK_OUTPUT_NAME (Tersedia di /sdcard/Download/$APK_OUTPUT_NAME)"
}

# 1. Build KasKu (Menu Utama: Kas & Pembukuan, Kasir di Pengaturan)
compile_and_sign "KasKu.apk" "KasKu" "overview"

# 2. Build Kasir (Menu Utama: Kasir POS Langsung)
compile_and_sign "Kasir.apk" "Kasir POS" "kasir"

echo "=========================================================="
echo "🎉 SEMUA BUILD SUKSES LENGKAP!"
echo "1. APK KasKu (Menu Utama Kas)   : /sdcard/Download/KasKu.apk"
echo "2. APK Kasir (Menu Utama Kasir) : /sdcard/Download/Kasir.apk"
echo "=========================================================="
