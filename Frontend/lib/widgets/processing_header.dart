import 'package:flutter/material.dart';

class ProcessingHeader extends StatelessWidget {
  const ProcessingHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 76,
          height: 76,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFF00E676).withOpacity(0.10),
            border: Border.all(
              color: const Color(0xFF00E676).withOpacity(0.25),
            ),
          ),
          child: const Icon(
            Icons.auto_awesome,
            color: Color(0xFF00E676),
            size: 34,
          ),
        ),

        const SizedBox(height: 20),

        const Text(
          'AI Analysis in Progress',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),

        const SizedBox(height: 8),

        const Text(
          'Analyzing road footage and detecting surface damage.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white54,
            fontSize: 13,
            height: 1.5,
          ),
        ),
      ],
    );
  }
}