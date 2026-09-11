import 'package:flutter/material.dart';

class SelectedLocationCard extends StatelessWidget {
  final String location;
  final String severity;
  final String damageType;
  final String confidence;
  final VoidCallback? onViewDetails;

  const SelectedLocationCard({
    super.key,
    required this.location,
    required this.severity,
    required this.damageType,
    required this.confidence,
    this.onViewDetails,
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
        return Colors.white70;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1720),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Location
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0x1A00E676),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.location_on_rounded,
                  color: Color(0xFF00E676),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Selected Location',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      location,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Details
          Row(
            children: [
              Expanded(
                child: _InfoItem(
                  title: 'Damage',
                  value: damageType,
                ),
              ),
              Expanded(
                child: _InfoItem(
                  title: 'Severity',
                  value: severity.toUpperCase(),
                  valueColor: severityColor,
                ),
              ),
              Expanded(
                child: _InfoItem(
                  title: 'Confidence',
                  value: confidence,
                  valueColor: const Color(0xFF00E676),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // View details button
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton.icon(
              onPressed: onViewDetails,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00E676),
                foregroundColor: const Color(0xFF06111C),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(
                Icons.analytics_outlined,
                size: 18,
              ),
              label: const Text(
                'View Analysis Details',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final String title;
  final String value;
  final Color? valueColor;

  const _InfoItem({
    required this.title,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 11,
          ),
        ),
        const SizedBox(height: 5),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: valueColor ?? Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}