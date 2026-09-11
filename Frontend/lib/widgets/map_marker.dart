import 'package:flutter/material.dart';

class MapMarker extends StatelessWidget {
  final String severity;
  final VoidCallback? onTap;

  const MapMarker({
    super.key,
    required this.severity,
    this.onTap,
  });

  Color get markerColor {
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
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: markerColor,
          border: Border.all(
            color: Colors.white,
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: markerColor.withOpacity(0.35),
              blurRadius: 10,
              spreadRadius: 2,
            ),
          ],
        ),
        child: const Icon(
          Icons.warning_rounded,
          color: Colors.white,
          size: 17,
        ),
      ),
    );
  }
}