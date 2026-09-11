import 'package:flutter/material.dart';

class BeforeAfterComparison extends StatelessWidget {
  final String? beforeImage;
  final String? afterImage;

  const BeforeAfterComparison({
    super.key,
    this.beforeImage,
    this.afterImage,
  });

  @override
  Widget build(BuildContext context) {
    if (beforeImage == null || afterImage == null) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
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
          const Row(
            children: [
              Icon(
                Icons.compare_rounded,
                color: Color(0xFF00E676),
                size: 20,
              ),
              SizedBox(width: 8),
              Text(
                'Restoration Preview',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),

          const Text(
            'Visual simulation of the restored road condition',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 12,
            ),
          ),

          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _ImagePanel(
                  title: 'BEFORE',
                  imagePath: beforeImage!,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ImagePanel(
                  title: 'AFTER',
                  imagePath: afterImage!,
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(
              color: const Color(0x1414D68B),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.info_outline_rounded,
                  color: Color(0xFF00E676),
                  size: 17,
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'This is an AI-generated visual simulation, '
                        'not an exact engineering prediction.',
                    style: TextStyle(
                      color: Colors.white60,
                      fontSize: 11,
                      height: 1.4,
                    ),
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

class _ImagePanel extends StatelessWidget {
  final String title;
  final String imagePath;

  const _ImagePanel({
    required this.title,
    required this.imagePath,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: title == 'AFTER'
                ? const Color(0xFF00E676)
                : Colors.white70,
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 7),

        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: AspectRatio(
            aspectRatio: 1.15,
            child: _buildImage(),
          ),
        ),
      ],
    );
  }

  Widget _buildImage() {
    if (imagePath.startsWith('http')) {
      return Image.network(
        imagePath,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _imagePlaceholder(),
      );
    }

    return Image.asset(
      imagePath,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => _imagePlaceholder(),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      color: const Color(0xFF111E27),
      child: const Center(
        child: Icon(
          Icons.image_not_supported_outlined,
          color: Colors.white30,
          size: 30,
        ),
      ),
    );
  }
}