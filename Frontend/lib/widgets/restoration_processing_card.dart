import 'package:flutter/material.dart';

class RestorationProcessingCard extends StatelessWidget {
  final bool isProcessing;
  final double progress;

  const RestorationProcessingCard({
    super.key,
    required this.isProcessing,
    this.progress = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    if (!isProcessing) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1720),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: const Color(0x3300E676),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0x1A00E676),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: Color(0xFF00E676),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI Restoration in Progress',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Analyzing and reconstructing road surface...',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: progress > 0 ? progress : null,
              minHeight: 7,
              backgroundColor: Colors.white.withOpacity(0.08),
              valueColor: const AlwaysStoppedAnimation<Color>(
                Color(0xFF00E676),
              ),
            ),
          ),

          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'AI Processing',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 11,
                ),
              ),
              Text(
                '${(progress.clamp(0.0, 1.0) * 100).round()}%',
                style: const TextStyle(
                  color: Color(0xFF00E676),
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          const _ProcessingStep(
            icon: Icons.search_rounded,
            title: 'Detecting road damage',
            completed: true,
          ),

          const SizedBox(height: 10),

          const _ProcessingStep(
            icon: Icons.auto_awesome_rounded,
            title: 'Reconstructing road surface',
            completed: false,
          ),

          const SizedBox(height: 10),

          const _ProcessingStep(
            icon: Icons.image_rounded,
            title: 'Generating restored view',
            completed: false,
          ),
        ],
      ),
    );
  }
}

class _ProcessingStep extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool completed;

  const _ProcessingStep({
    required this.icon,
    required this.title,
    required this.completed,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          completed
              ? Icons.check_circle_rounded
              : icon,
          color: completed
              ? const Color(0xFF00E676)
              : Colors.white38,
          size: 17,
        ),
        const SizedBox(width: 9),
        Text(
          title,
          style: TextStyle(
            color: completed
                ? Colors.white70
                : Colors.white38,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}