import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class ReportPieChart extends StatelessWidget {
  const ReportPieChart({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1720),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: Colors.white.withOpacity(0.07),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Issue Distribution',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 4),

          const Text(
            'Road damage reports by severity',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 11,
            ),
          ),

          const SizedBox(height: 20),

          SizedBox(
            height: 210,
            child: Row(
              children: [
                Expanded(
                  child: PieChart(
                    PieChartData(
                      centerSpaceRadius: 48,
                      sectionsSpace: 3,
                      sections: [
                        PieChartSectionData(
                          value: 12,
                          title: '12',
                          color: Colors.redAccent,
                          radius: 55,
                          titleStyle: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        PieChartSectionData(
                          value: 31,
                          title: '31',
                          color: Colors.orange,
                          radius: 55,
                          titleStyle: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        PieChartSectionData(
                          value: 49,
                          title: '49',
                          color: Colors.amber,
                          radius: 55,
                          titleStyle: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        PieChartSectionData(
                          value: 35,
                          title: '35',
                          color: Colors.greenAccent,
                          radius: 55,
                          titleStyle: const TextStyle(
                            color: Color(0xFF06111C),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _LegendItem(
                      color: Colors.redAccent,
                      title: 'Critical',
                      value: '12',
                    ),
                    SizedBox(height: 12),
                    _LegendItem(
                      color: Colors.orange,
                      title: 'Severe',
                      value: '31',
                    ),
                    SizedBox(height: 12),
                    _LegendItem(
                      color: Colors.amber,
                      title: 'Moderate',
                      value: '49',
                    ),
                    SizedBox(height: 12),
                    _LegendItem(
                      color: Colors.greenAccent,
                      title: 'Minor',
                      value: '35',
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Divider(
            color: Colors.white10,
            height: 20,
          ),

          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Issues',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 12,
                ),
              ),
              Text(
                '127',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String title;
  final String value;

  const _LegendItem({
    required this.color,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 7),
        SizedBox(
          width: 65,
          child: Text(
            title,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 11,
            ),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}