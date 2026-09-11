import 'package:flutter/material.dart';

class DistanceCard extends StatelessWidget {
  const DistanceCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: const Color(0xFF0D202B),
        border: Border.all(
          color: Colors.white10,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Total Distance Analyzed',
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 11,
                  ),
                ),

                const SizedBox(height: 6),

                const Text(
                  '18.4 km',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 5),

                const Row(
                  children: [
                    Icon(
                      Icons.trending_up,
                      color: Color(0xFF00E676),
                      size: 15,
                    ),
                    SizedBox(width: 4),
                    Text(
                      '+12% this week',
                      style: TextStyle(
                        color: Color(0xFF00E676),
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          SizedBox(
            width: 100,
            height: 50,
            child: CustomPaint(
              painter: _MiniChartPainter(),
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF00E676)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();

    path.moveTo(0, size.height * 0.8);

    path.cubicTo(
      size.width * .2,
      size.height * .2,
      size.width * .35,
      size.height * .8,
      size.width * .5,
      size.height * .45,
    );

    path.cubicTo(
      size.width * .65,
      size.height * .1,
      size.width * .8,
      size.height * .6,
      size.width,
      size.height * .15,
    );

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}
