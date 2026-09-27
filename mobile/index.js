import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent memanggil AppRegistry.registerComponent('main', () => App);
// Ini WAJIB untuk Expo managed/standalone APK agar tidak crash/force close saat dibuka.
registerRootComponent(App);
