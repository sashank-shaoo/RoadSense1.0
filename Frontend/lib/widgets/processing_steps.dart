import 'package:flutter/material.dart';

class ProcessingSteps extends StatelessWidget {
  final int currentStep;

  const ProcessingSteps({
    super.key,
    required this.currentStep,
  });

  @override
  Widget build(BuildContext context) {
    final steps = [
      'Video processed',
      'Road frames scanned',
      'Damage detection',
      'Severity assessment',
    ];

    return Column(
      children: List.generate(
        steps.length,
            (index) {
          final isCompleted = index < currentStep;
          final isActive = index == currentStep;

          return Padding(
            padding: EdgeInsets.only(
              bottom: index == steps.length - 1 ? 0 : 16,
            ),
            child: Row(
              children: [
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isCompleted || isActive
                        ? const Color(0xFF00E676).withOpacity(0.12)
                        : Colors.white.withOpacity(0.05),
                    border: Border.all(
                      color: isCompleted || isActive
                          ? const Color(0xFF00E676)
                          : Colors.white12,
                    ),
                  ),
                  child: Icon(
                    isCompleted
                        ? Icons.check_rounded
                        : isActive
                        ? Icons.sync_rounded
                        : Icons.circle_outlined,
                    size: 16,
                    color: isCompleted || isActive
                        ? const Color(0xFF00E676)
                        : Colors.white30,
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Text(
                    steps[index],
                    style: TextStyle(
                      color: isCompleted || isActive
                          ? Colors.white
                          : Colors.white38,
                      fontSize: 13,
                      fontWeight: isActive
                          ? FontWeight.w600
                          : FontWeight.w400,
                    ),
                  ),
                ),

                if (isActive)
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Color(0xFF00E676),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}