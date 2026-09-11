# roadsense

Flutter client for the RoadSense backend.

## Run locally

Install dependencies and start the app with an API URL appropriate for the target:

```text
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

Use `http://localhost:3000` for the iOS simulator or web. For a physical device,
use the development computer's LAN IP address and make sure port `3000` is reachable.

The app uses bearer JWT authentication, email OTP verification, GPS coordinates,
and multipart image uploads for reports. Android and iOS location permissions are
configured in their platform project files.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
