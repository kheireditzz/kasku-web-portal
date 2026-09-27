import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

const APP_URL = 'https://kasku.kheireditz.my.id/app';
const HEADER_BG_COLOR = '#F8FAFC'; // Warna sama persis dengan header KasKu (Slate-50)

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle hardware Back button on Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Cegah keluar langsung, kembali ke halaman sebelumnya
      }
      return false; // Keluar aplikasi jika di halaman awal
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Status Bar dengan warna persis seperti header (#F8FAFC) dan icon gelap agar terbaca jelas */}
      <StatusBar barStyle="dark-content" backgroundColor={HEADER_BG_COLOR} />

      {/* Main WebView Container */}
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: APP_URL }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setHasError(true);
            setErrorMessage(nativeEvent.description || 'Gagal memuat halaman.');
            setIsLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.statusCode >= 400) {
              setHasError(true);
              setErrorMessage(`Server mengembalikan error ${nativeEvent.statusCode}.`);
              setIsLoading(false);
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          cacheEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          applicationNameForUserAgent="KasKuApp/1.3.1 (Android Native Standalone)"
        />

        {/* Loading Indicator Overlay (Warna senada dengan header/latar KasKu) */}
        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingTitle}>KasKu</Text>
              <Text style={styles.loadingSubtitle}>Memuat aplikasi keuangan...</Text>
            </View>
          </View>
        )}

        {/* Error / Offline Screen */}
        {hasError && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <View style={styles.errorIconCircle}>
                <Text style={styles.errorIconText}>⚠️</Text>
              </View>
              <Text style={styles.errorTitle}>Koneksi Terputus</Text>
              <Text style={styles.errorDesc}>
                {errorMessage || 'Tidak dapat terhubung ke server KasKu. Pastikan perangkat Anda terhubung ke internet.'}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={handleReload}
              >
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HEADER_BG_COLOR, // Warna sama persis dengan header (#F8FAFC)
  },
  container: {
    flex: 1,
    backgroundColor: HEADER_BG_COLOR,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: HEADER_BG_COLOR,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HEADER_BG_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 24,
  },
  loadingTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    letterSpacing: 0.5,
  },
  loadingSubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HEADER_BG_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 20,
  },
  errorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  errorIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 28,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#10b981', // Tailwind emerald-500
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
