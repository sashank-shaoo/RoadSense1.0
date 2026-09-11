import 'package:flutter/material.dart';

class AnalysisCard extends StatelessWidget {
  final String fileName;
  final String details;

  const AnalysisCard({
    super.key,
    required this.fileName,
    required this.details,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 9),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1C27),
        borderRadius: BorderRadius.circular(11),
        border: Border.all(
          color: Colors.white10,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFF152A35),
              borderRadius: BorderRadius.circular(9),
            ),
            child: const Icon(
              Icons.video_file_outlined,
              color: Colors.white60,
              size: 22,
            ),
          ),

          const SizedBox(width: 11),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  fileName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  details,
                  style: const TextStyle(
                    color: Colors.white38,
                    fontSize: 9,
                  ),
                ),
              ],
            ),
          ),

          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 8,
              vertical: 5,
            ),
            decoration: BoxDecoration(
              color: const Color(0x3322C55E),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text(
              'Completed',
              style: TextStyle(
                color: Color(0xFF00E676),
                fontSize: 9,
              ),
            ),
          ),
        ],
      ),
    );
  }
}