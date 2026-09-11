import 'package:flutter/material.dart';

class RoadAnalysisCard extends StatelessWidget {
  final String title;
  final String location;
  final String severity;
  final String confidence;
  final Color severityColor;
  final IconData icon;

  const RoadAnalysisCard({
    super.key,
    required this.title,
    required this.location,
    required this.severity,
    required this.confidence,
    required this.severityColor,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1D27),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.white10,
        ),
      ),
      child: Row(
        children: [
          // --------------------------------
          // DAMAGE ICON
          // --------------------------------

          Container(
            width: 43,
            height: 43,
            decoration: BoxDecoration(
              color: severityColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              color: severityColor,
              size: 22,
            ),
          ),

          const SizedBox(width: 11),

          // --------------------------------
          // TITLE + LOCATION
          // --------------------------------

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  location,
                  style: const TextStyle(
                    color: Colors.white38,
                    fontSize: 9,
                  ),
                ),
              ],
            ),
          ),

          // --------------------------------
          // SEVERITY + CONFIDENCE
          // --------------------------------

          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                severity,
                style: TextStyle(
                  color: severityColor,
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 5),

              Text(
                '$confidence confidence',
                style: const TextStyle(
                  color: Colors.white38,
                  fontSize: 8,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}