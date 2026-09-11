import 'package:flutter/material.dart';
import 'package:roadsense/screens/analyze_dashcam_screen.dart';
import 'package:roadsense/screens/map_screen.dart';
import 'package:roadsense/screens/road_damage_details_screen.dart';
import 'package:roadsense/screens/visual_restoration_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/analyses_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/ai_processing_screen.dart';
void main() {
  runApp(const RoadSenseApp());
}

class RoadSenseApp extends StatelessWidget {
  const RoadSenseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'RoadSense',

      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF06111C),

        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF00E676),
          brightness: Brightness.dark,
        ),

        fontFamily: 'Roboto',
      ),

       home:
           // DashboardScreen()
       // SignupScreen(),
      //LoginScreen()
      //  AnalysesScreen()
      //   AnalyzeDashcamScreen()
      //  MapScreen()
       // VisualRestorationScreen()
       //  RoadDamageDetailsScreen()
      SplashScreen()
      //AiProcessingScreen()

    );
  }
}

// --------------------------------------------------
// SPLASH SCREEN
// --------------------------------------------------

