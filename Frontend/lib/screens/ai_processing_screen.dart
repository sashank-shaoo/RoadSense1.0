import 'dart:async';

import 'package:flutter/material.dart';

import '../ widgets/processing_header.dart';
import '../ widgets/processing_progress.dart';
import '../ widgets/processing_steps.dart';
import 'analyses_screen.dart';

class AiProcessingScreen extends StatefulWidget {
  const AiProcessingScreen({super.key});

  @override
  State<AiProcessingScreen> createState() =>
      _AiProcessingScreenState();
}

class _AiProcessingScreenState
    extends State<AiProcessingScreen> {

  double progress = 0.0;
  int currentStep = 0;

  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startProcessing();
  }

  void _startProcessing() {
    _timer = Timer.periodic(
      const Duration(milliseconds: 100),
          (timer) {
        if (!mounted) return;

        setState(() {
          progress += 0.01;

          if (progress >= 1.0) {
            progress = 1.0;
            currentStep = 4;
            timer.cancel();

            Future.delayed(
              const Duration(seconds: 1),
                  () {
                if (!mounted) return;

                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                    const AnalysesScreen(),
                  ),
                );
              },
            );
          } else if (progress >= 0.75) {
            currentStep = 3;
          } else if (progress >= 0.50) {
            currentStep = 2;
          } else if (progress >= 0.25) {
            currentStep = 1;
          } else {
            currentStep = 0;
          }
        });
      },
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06111C),

      appBar: AppBar(
        backgroundColor: const Color(0xFF06111C),
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'AI Processing',
          style: TextStyle(
            color: Colors.white,
            fontSize: 17,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            18,
            25,
            18,
            30,
          ),
          child: Column(
            children: [

              const ProcessingHeader(),

              const SizedBox(height: 35),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B1720),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.06),
                  ),
                ),
                child: Column(
                  children: [

                    ProcessingProgress(
                      progress: progress,
                    ),

                    const SizedBox(height: 28),

                    ProcessingSteps(
                      currentStep: currentStep,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              const Text(
                'Please keep the application open while the analysis is running.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white38,
                  fontSize: 11,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}