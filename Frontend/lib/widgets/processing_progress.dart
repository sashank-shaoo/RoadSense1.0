import 'package:flutter/material.dart';

class ProcessingProgress extends StatelessWidget {
  final double progress;

  const ProcessingProgress({
    super.key,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    final percentage = (progress * 100).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Processing footage',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              '$percentage%',
              style: const TextStyle(
                color: Color(0xFF00E676),
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),

        const SizedBox(height: 10),

        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 7,
            backgroundColor: Colors.white10,
            valueColor: const AlwaysStoppedAnimation<Color>(
              Color(0xFF00E676),
            ),
          ),
        ),
      ],
    );
  }
}