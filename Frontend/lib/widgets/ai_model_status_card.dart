import 'package:flutter/material.dart';

class AiModelStatusCard extends StatelessWidget {
  const AiModelStatusCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1D27),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.white10,
        ),
      ),
      child: Row(
        children: [
          // AI ICON
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0x2200E676),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.psychology_outlined,
              color: Color(0xFF00E676),
              size: 25,
            ),
          ),

          const SizedBox(width: 12),

          // AI DETAILS
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'RoadSense AI',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),

                SizedBox(height: 4),

                Text(
                  'Detection model is active',
                  style: TextStyle(
                    color: Colors.white54,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),

          // STATUS
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 9,
              vertical: 5,
            ),
            decoration: BoxDecoration(
              color: const Color(0x2200E676),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                Icon(
                  Icons.circle,
                  color: Color(0xFF00E676),
                  size: 7,
                ),

                SizedBox(width: 5),

                Text(
                  'ACTIVE',
                  style: TextStyle(
                    color: Color(0xFF00E676),
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}