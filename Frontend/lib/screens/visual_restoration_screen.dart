import 'package:flutter/material.dart';

import '../ widgets/before_after_comparison.dart';
import '../ widgets/restoration_processing_card.dart';
import '../ widgets/restoration_upload_card.dart';


class VisualRestorationScreen extends StatefulWidget {
  const VisualRestorationScreen({super.key});

  @override
  State<VisualRestorationScreen> createState() =>
      _VisualRestorationScreenState();
}

class _VisualRestorationScreenState
    extends State<VisualRestorationScreen> {
  String? selectedImage;

  bool isProcessing = false;
  bool restorationComplete = false;

  double progress = 0.0;

  String? restoredImage;

  void _selectImage() {
    // Temporary demo selection.
    // Later connect ImagePicker here.
    setState(() {
      selectedImage = 'assets/images/damaged_road.jpg';
      restorationComplete = false;
      restoredImage = null;
    });
  }

  Future<void> _startRestoration() async {
    if (selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please upload a damaged road image first.'),
        ),
      );
      return;
    }

    setState(() {
      isProcessing = true;
      restorationComplete = false;
      progress = 0.0;
    });

    // Temporary demo processing.
    // Later replace this with the actual AI API/model.
    for (int i = 1; i <= 10; i++) {
      await Future.delayed(
        const Duration(milliseconds: 300),
      );

      if (!mounted) return;

      setState(() {
        progress = i / 10;
      });
    }

    if (!mounted) return;

    setState(() {
      isProcessing = false;
      restorationComplete = true;

      // Temporary demo output.
      restoredImage = 'assets/images/restored_road.jpg';
    });
  }

  void _reset() {
    setState(() {
      selectedImage = null;
      restoredImage = null;
      isProcessing = false;
      restorationComplete = false;
      progress = 0.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06111C),
      appBar: AppBar(
        backgroundColor: const Color(0xFF06111C),
        elevation: 0,
        title: const Text(
          'AI Visual Restoration',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            16,
            8,
            16,
            24,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Visualize Road Restoration',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'See how a damaged road could look after restoration.',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 13,
                ),
              ),

              const SizedBox(height: 20),

              // Upload
              RestorationUploadCard(
                selectedImage: selectedImage,
                onUpload: _selectImage,
              ),

              const SizedBox(height: 18),

              // Start AI restoration
              if (selectedImage != null &&
                  !isProcessing &&
                  !restorationComplete)
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: _startRestoration,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00E676),
                      foregroundColor: const Color(0xFF06111C),
                      elevation: 0,
                      overlayColor: const Color(0x55500000),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(13),
                      ),
                    ),
                    icon: const Icon(
                      Icons.auto_awesome_rounded,
                    ),
                    label: const Text(
                      'Generate Restored View',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),

              // Processing
              RestorationProcessingCard(
                isProcessing: isProcessing,
                progress: progress,
              ),

              // Before / After
              if (restorationComplete) ...[
                BeforeAfterComparison(
                  beforeImage: selectedImage,
                  afterImage: restoredImage,
                ),

                const SizedBox(height: 16),

                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: OutlinedButton.icon(
                    onPressed: _reset,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: BorderSide(
                        color: Colors.white.withOpacity(0.12),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(
                      Icons.refresh_rounded,
                    ),
                    label: const Text(
                      'Analyze Another Image',
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 18),

              // Disclaimer
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B1720),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.06),
                  ),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.info_outline_rounded,
                      color: Colors.white38,
                      size: 18,
                    ),
                    SizedBox(width: 9),
                    Expanded(
                      child: Text(
                        'RoadSense provides an AI-generated visual '
                            'simulation for demonstration purposes. '
                            'It does not represent an exact engineering '
                            'repair prediction.',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 11,
                          height: 1.45,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}