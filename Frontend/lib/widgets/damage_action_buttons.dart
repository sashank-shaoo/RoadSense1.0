import 'package:flutter/material.dart';

class DamageActionButtons extends StatelessWidget {
  final VoidCallback? onViewMap;
  final VoidCallback? onGenerateRestoration;

  const DamageActionButtons({
    super.key,
    this.onViewMap,
    this.onGenerateRestoration,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // View on Map
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            onPressed: onViewMap,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00E676),
              foregroundColor: Colors.black,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            icon: const Icon(
              Icons.location_on_outlined,
              size: 20,
            ),
            label: const Text(
              'View on Map',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),

        const SizedBox(height: 12),

        // Generate Restoration
        SizedBox(
          width: double.infinity,
          height: 52,
          child: OutlinedButton.icon(
            onPressed: onGenerateRestoration,
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: BorderSide(
                color: Colors.white.withOpacity(0.15),
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            icon: const Icon(
              Icons.auto_awesome_outlined,
              size: 20,
            ),
            label: const Text(
              'Generate Restoration',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }
}