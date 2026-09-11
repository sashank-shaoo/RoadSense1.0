import 'package:flutter/material.dart';
import 'map_marker.dart';

class RoadMapView extends StatelessWidget {
  final String? selectedSeverity;
  final Function(String severity)? onMarkerTap;

  const RoadMapView({
    super.key,
    this.selectedSeverity,
    this.onMarkerTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 360,
      decoration: BoxDecoration(
        color: const Color(0xFF0B1720),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Map background
          Positioned.fill(
            child: CustomPaint(
              painter: RoadMapPainter(),
            ),
          ),

          // Map markers
          Positioned(
            top: 75,
            left: 85,
            child: MapMarker(
              severity: 'critical',
              onTap: () => onMarkerTap?.call('critical'),
            ),
          ),

          Positioned(
            top: 135,
            right: 95,
            child: MapMarker(
              severity: 'severe',
              onTap: () => onMarkerTap?.call('severe'),
            ),
          ),

          Positioned(
            bottom: 85,
            left: 145,
            child: MapMarker(
              severity: 'moderate',
              onTap: () => onMarkerTap?.call('moderate'),
            ),
          ),

          Positioned(
            bottom: 55,
            right: 55,
            child: MapMarker(
              severity: 'minor',
              onTap: () => onMarkerTap?.call('minor'),
            ),
          ),

          // Location label
          Positioned(
            top: 18,
            left: 18,
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 8,
              ),
              decoration: BoxDecoration(
                color: const Color(0xDD06111C),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: Colors.white.withOpacity(0.08),
                ),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.location_on_rounded,
                    color: Color(0xFF00E676),
                    size: 16,
                  ),
                  SizedBox(width: 6),
                  Text(
                    'Bhubaneswar',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Map controls
          Positioned(
            right: 14,
            top: 14,
            child: Column(
              children: [
                _MapControl(
                  icon: Icons.add,
                  onTap: () {},
                ),
                const SizedBox(height: 6),
                _MapControl(
                  icon: Icons.remove,
                  onTap: () {},
                ),
              ],
            ),
          ),

          // Current location button
          Positioned(
            right: 14,
            bottom: 14,
            child: _MapControl(
              icon: Icons.my_location_rounded,
              onTap: () {},
            ),
          ),
        ],
      ),
    );
  }
}

class _MapControl extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _MapControl({
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: const Color(0xEE0B1720),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: Colors.white.withOpacity(0.08),
          ),
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 19,
        ),
      ),
    );
  }
}

class RoadMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final backgroundPaint = Paint()
      ..color = const Color(0xFF0B1720);

    canvas.drawRect(
      Offset.zero & size,
      backgroundPaint,
    );

    // Grid
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.035)
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 35) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x, size.height),
        gridPaint,
      );
    }

    for (double y = 0; y < size.height; y += 35) {
      canvas.drawLine(
        Offset(0, y),
        Offset(size.width, y),
        gridPaint,
      );
    }

    // Main roads
    final roadPaint = Paint()
      ..color = const Color(0xFF263640)
      ..strokeWidth = 22
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final mainRoad = Path();

    mainRoad.moveTo(-20, size.height * 0.75);
    mainRoad.cubicTo(
      size.width * 0.25,
      size.height * 0.55,
      size.width * 0.55,
      size.height * 0.70,
      size.width + 20,
      size.height * 0.25,
    );

    canvas.drawPath(mainRoad, roadPaint);

    // Secondary roads
    final secondaryRoadPaint = Paint()
      ..color = const Color(0xFF1D2B34)
      ..strokeWidth = 11
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final road1 = Path();
    road1.moveTo(size.width * 0.15, -10);
    road1.lineTo(size.width * 0.40, size.height + 10);

    canvas.drawPath(road1, secondaryRoadPaint);

    final road2 = Path();
    road2.moveTo(size.width * 0.70, -10);
    road2.cubicTo(
      size.width * 0.62,
      size.height * 0.30,
      size.width * 0.78,
      size.height * 0.65,
      size.width * 0.95,
      size.height + 10,
    );

    canvas.drawPath(road2, secondaryRoadPaint);

    // Road center lines
    final centerPaint = Paint()
      ..color = Colors.white.withOpacity(0.12)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final centerRoad = Path();

    centerRoad.moveTo(-20, size.height * 0.75);
    centerRoad.cubicTo(
      size.width * 0.25,
      size.height * 0.55,
      size.width * 0.55,
      size.height * 0.70,
      size.width + 20,
      size.height * 0.25,
    );

    canvas.drawPath(centerRoad, centerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
}