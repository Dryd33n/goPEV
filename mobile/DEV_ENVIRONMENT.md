# goPEV Mobile — Development Environment

## Your setup
OS: Windows
Primary test device: Android (physical)
iOS: via EAS cloud builds + TestFlight (no Mac required)

---

## IDE
WebStorm (JetBrains)
Open goPEV/ repo root — not the mobile/ subfolder.

### Required plugins (same as web)
- Prettier
- ESLint
- .env files support

---

## Required tooling

### 1. Volta + Node 20 (same as web)
```powershell
winget install Volta.Volta
volta install node@20
volta install pnpm
```

### 2. Android Studio
Required for: Android SDK, ADB, AVD emulator.
You do not need to write any Kotlin or Java — install it purely for the tooling.

Download: developer.android.com/studio

After installing:
- Open Android Studio → More Actions → SDK Manager
- Install Android SDK Platform 34 (Android 14)
- Install Android SDK Build-Tools 34
- Install Google Play Intel x86 Atom System Image (for emulator)

Add to Windows PATH (System Environment Variables):
```
C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools
C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\tools
```

Verify:
```bash
adb --version  # should print Android Debug Bridge version x.x.x
```

### 3. EAS CLI
```bash
pnpm add -g eas-cli
eas login   # log in with your Expo account (expo.dev)
```

### 4. Java (required by Android build tools)
Android Studio installs a bundled JDK. If you get Java errors:
```powershell
winget install Microsoft.OpenJDK.17
```

---

## Android physical device setup (primary workflow)

1. On your Android phone:
   - Settings → About Phone → tap Build Number 7 times (enables Developer Options)
   - Settings → Developer Options → enable USB Debugging
   - Settings → Developer Options → enable Install via USB

2. Connect phone via USB cable

3. On your PC, accept the "Allow USB debugging?" prompt on the phone

4. Verify connection:
   ```bash
   adb devices
   # should list your device, e.g.:
   # R3CN20XXXXX    device
   ```

---

## Android emulator setup (optional, for when phone isn't nearby)

In Android Studio → Device Manager → Create Virtual Device:
- Hardware: Pixel 7
- System image: API 34 (Android 14) x86_64
- AVD Name: Pixel_7_API_34

Enable hardware acceleration (required for usable performance):
- Windows with Intel CPU: install HAXM from SDK Manager
- Windows with AMD CPU: enable Hyper-V in Windows Features

Start emulator: Android Studio → Device Manager → play button
Or from terminal: `emulator -avd Pixel_7_API_34`

Note: GPS in the emulator is unreliable. Always test location features on a
real physical device.

---

## First-time mobile setup

```bash
cd mobile
pnpm install
cp .env.example .env.local
# fill in EXPO_PUBLIC_MAPBOX_TOKEN and EXPO_PUBLIC_API_URL
```

### Finding your local IP for EXPO_PUBLIC_API_URL
```powershell
ipconfig
# find IPv4 Address under your Wi-Fi adapter
# e.g. 192.168.1.42
```

Set in .env.local:
```
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000
```

Your phone and PC must be on the same Wi-Fi network.

---

## Development workflow

### Option A — Expo Go (JS-only, no native modules)
Works for early UI development before @rnmapbox/maps is added.
```bash
pnpm start
# scan QR code with Expo Go app on your phone
```
Once @rnmapbox/maps is installed, Expo Go stops working — switch to Option B.

### Option B — EAS Development Build (required after adding Mapbox)
Build once, then use fast refresh for all subsequent JS changes.

```bash
# build dev client APK and install on device (takes ~10 min, run once)
eas build --profile development --platform android --local
# or cloud build:
eas build --profile development --platform android

# after dev build is installed, start Metro:
pnpm start
# press 'a' to open on Android device
```

The dev build is a real APK installed on your phone. After it's installed,
you only rebuild when native dependencies change — JS changes hot-reload instantly.

### When to rebuild the dev client
Rebuild (eas build --profile development) when you:
- Add a new native module (new package with android/ or ios/ native code)
- Change app.json plugins
- Update @rnmapbox/maps or expo-location version

You do NOT need to rebuild for:
- JS/TS code changes
- Adding a new screen or component
- Changing styles or logic

---

## iOS development from Windows

You cannot run the iOS simulator on Windows. Your options:

### Option 1 — EAS cloud build + TestFlight (recommended)
```bash
# build iOS IPA in EAS cloud (requires Apple Developer account, $99/year)
eas build --profile development --platform ios

# installs via TestFlight or direct link on a physical iPhone
```
After the dev build is on the iPhone, hot reload works over Wi-Fi from your Windows machine.

### Option 2 — MacStadium / GitHub Actions Mac runner
Rent a cloud Mac for Xcode access. Overkill for MVP — use EAS.

### What you need for iOS
- Apple Developer account: developer.apple.com ($99/year)
- At least one physical iPhone for testing — no way around this
- EAS manages provisioning profiles and certificates automatically

---

## EAS setup (one-time)

```bash
cd mobile
eas build:configure   # generates eas.json
```

For iOS builds, EAS will ask for your Apple ID — it handles the rest
(provisioning profiles, certificates, signing).

---

## Google Play deployment

1. Create Google Play Console account: play.google.com/console ($25 one-time)

2. Build production AAB:
   ```bash
   eas build --profile production --platform android
   ```

3. First upload: Play Console → Create app → Internal Testing → upload AAB
   (Internal Testing has no review — available to testers in minutes)

4. Promote: Internal → Closed Testing → Open Testing → Production
   Each promotion triggers Google review (1–3 days first time)

---

## App Store deployment

1. Apple Developer account required ($99/year)

2. Build production IPA:
   ```bash
   eas build --profile production --platform ios
   ```

3. Submit via EAS:
   ```bash
   eas submit --platform ios
   ```
   This uploads to App Store Connect without needing Xcode or Transporter.

4. Enable TestFlight for internal testers — no review needed
5. Submit for App Store review — 1–3 days, location apps get extra scrutiny
   Have your privacy policy URL ready.

---

## Debugging tips

### Metro bundler not connecting to device
- Make sure phone and PC are on the same Wi-Fi network
- Disable Windows Firewall for the Metro port (8081) temporarily to test
- Try: adb reverse tcp:8081 tcp:8081 (tunnels Metro over USB instead of Wi-Fi)

### @rnmapbox/maps blank screen
- Verify EXPO_PUBLIC_MAPBOX_TOKEN is set and starts with pk.
- Check RNMapboxMaps.setAccessToken() is called in app/_layout.tsx before any map renders
- This requires a dev build — will not work in Expo Go

### Location permission denied
- On Android: Settings → Apps → goPEV → Permissions → Location → Allow all the time
- In development, permissions reset on reinstall — re-grant after each dev build

### EXPO_PUBLIC_API_URL connection refused
- Confirm web dev server is running (pnpm dev in web/)
- Confirm you used your machine's LAN IP (ipconfig), not localhost or 127.0.0.1
- Confirm phone and PC are on the same Wi-Fi network (not one on Wi-Fi, one on ethernet)

### TypeScript errors in WebStorm for React Native types
- Ensure WebStorm Node interpreter points to Volta's node (~/.volta/bin/node)
- Run pnpm install from mobile/ and restart the WebStorm TypeScript service
