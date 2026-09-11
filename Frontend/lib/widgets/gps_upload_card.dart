import 'package:flutter/material.dart';

class GpsUploadCard extends StatelessWidget {
  final String? selectedGps;
  final VoidCallback onSelectGps;

  const GpsUploadCard({
    super.key,
    required this.selectedGps,
    required this.onSelectGps,
  });

  @override
  Widget build(BuildContext context) {
    final bool isSelected = selectedGps != null;

    return GestureDetector(
      onTap: onSelectGps,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: const Color(0xFF0D1C27),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF00E676)
                : Colors.white12,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 43,
              height: 43,
              decoration: BoxDecoration(
                color: const Color(0xFF102C35),
                borderRadius: BorderRadius.circular(9),
              ),
              child: const Icon(
                Icons.location_on_outlined,
                color: Color(0xFF00E676),
                size: 22,
              ),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    selectedGps ?? 'Attach GPS Dataset',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    isSelected
                        ? 'Location data attached'
                        : 'Synchronize coordinates with video',
                    style: const TextStyle(
                      color: Colors.white38,
                      fontSize: 9,
                    ),
                  ),
                ],
              ),
            ),

            Icon(
              isSelected
                  ? Icons.check_circle
                  : Icons.add_circle_outline,
              color: const Color(0xFF00E676),
              size: 21,
            ),
          ],
        ),
      ),
    );
  }
}