import 'package:flutter/material.dart';

class DamageInfoCard extends StatelessWidget {
  final String location;
  final String damageType;
  final String severity;
  final int confidence;

  const DamageInfoCard({
    super.key,
    required this.location,
    required this.damageType,
    required this.severity,
    required this.confidence,
  });

  Color get severityColor {
    switch (severity.toLowerCase()) {
      case 'critical':
        return Colors.redAccent;
      case 'severe':
        return Colors.orange;
      case 'moderate':
        return Colors.amber;
      case 'minor':
        return Colors.greenAccent;
      default:
        return Colors.white54;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Location
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.location_on_outlined,
                color: Color(0xFF00E676),
                size: 21,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  location,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Damage Type
          Text(
            damageType,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 12),

          // Severity + Confidence
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: severityColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: severityColor.withOpacity(0.35),
                  ),
                ),
                child: Text(
                  severity.toUpperCase(),
                  style: TextStyle(
                    color: severityColor,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),

              const Spacer(),

              const Text(
                'AI Confidence ',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 12,
                ),
              ),

              Text(
                '$confidence%',
                style: const TextStyle(
                  color: Color(0xFF00E676),
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}