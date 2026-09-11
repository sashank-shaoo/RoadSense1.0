
import 'dart:async';

import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'main_layout.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _textController;
  late AnimationController _loadingController;

  late Animation<double> _logoScale;
  late Animation<double> _logoFade;

  late Animation<double> _textFade;
  late Animation<Offset> _textSlide;
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();

    // Logo animation
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _logoScale = CurvedAnimation(
      parent: _logoController,
      curve: Curves.easeOutBack,
    );

    _logoFade = CurvedAnimation(
      parent: _logoController,
      curve: Curves.easeIn,
    );

    // Text animation
    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _textFade = CurvedAnimation(
      parent: _textController,
      curve: Curves.easeIn,
    );

    _textSlide = Tween<Offset>(
      begin: const Offset(0, 0.25),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _textController,
        curve: Curves.easeOut,
      ),
    );

    // Loading animation
    _loadingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();

    // Start animations
    _startAnimation();
  }

  // Future<void> _startAnimation() async {
  //   await _logoController.forward();
  //
  //   if (!mounted) return;
  //
  //   await Future.delayed(
  //     const Duration(milliseconds: 150),
  //   );
  //
  //   if (!mounted) return;
  //
  //   await _textController.forward();
  // }
  Future<void> _startAnimation() async {
    await _logoController.forward();

    if (!mounted) return;

    await Future.delayed(
      const Duration(milliseconds: 150),
    );

    if (!mounted) return;

    await _textController.forward();

    if (!mounted) return;

    await Future.delayed(
      const Duration(seconds: 2),
    );

    if (!mounted) return;

    var hasSession = false;
    if (await _authService.hasToken()) {
      try {
        await _authService.currentUser();
        hasSession = true;
      } catch (_) {
        await _authService.logout();
      }
    }

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) =>
            hasSession ? const MainLayout() : const LoginScreen(),
      ),
    );
  }

  @override
  void dispose() {
    _logoController.dispose();
    _textController.dispose();
    _loadingController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF020B12),
              Color(0xFF061927),
              Color(0xFF031018),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // =========================
              // Animated Logo
              // =========================
              FadeTransition(
                opacity: _logoFade,
                child: ScaleTransition(
                  scale: _logoScale,
                  child: Image.asset(
                    'assets/images/road_logo2.png',
                    width: 250,
                    height: 250,
                    fit: BoxFit.contain,
                  ),
                ),
              ),

              const SizedBox(height: 25),

              // =========================
              // Animated App Name
              // =========================
              FadeTransition(
                opacity: _textFade,
                child: SlideTransition(
                  position: _textSlide,
                  child: RichText(
                    text: const TextSpan(
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.bold,
                      ),
                      children: [
                        TextSpan(
                          text: 'Road',
                          style: TextStyle(
                            color: Colors.white,
                          ),
                        ),
                        TextSpan(
                          text: 'Sense',
                          style: TextStyle(
                            color: Color(0xFF00E676),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 8),

              // =========================
              // Animated Tagline
              // =========================
              FadeTransition(
                opacity: _textFade,
                child: SlideTransition(
                  position: _textSlide,
                  child: const Text(
                    'Spotting Trouble Before It Spreads',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 70),

              // =========================
              // Animated Loading Bar
              // =========================
              SizedBox(
                width: 90,
                child: AnimatedBuilder(
                  animation: _loadingController,
                  builder: (context, child) {
                    return LinearProgressIndicator(
                      minHeight: 4,
                      borderRadius: BorderRadius.circular(10),
                      backgroundColor: Colors.white12,
                      value: _loadingController.value,
                      valueColor:
                      const AlwaysStoppedAnimation<Color>(
                        Color(0xFF00E676),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}