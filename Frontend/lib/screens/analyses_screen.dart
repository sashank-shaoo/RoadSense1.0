import 'package:flutter/material.dart';

import '../ widgets/ai_model_status_card.dart';
import '../ widgets/analysis_stat_card.dart';
import '../ widgets/road_analysis_card.dart';
import 'road_damage_details_screen.dart';


class AnalysesScreen extends StatelessWidget {
  const AnalysesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06131D),

      // --------------------------------
      // APP BAR
      // --------------------------------

      appBar: AppBar(
        backgroundColor: const Color(0xFF06131D),
        elevation: 0,
        title: const Text(
          'AI Analyses',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // --------------------------------
      // BODY
      // --------------------------------

      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // --------------------------------
            // HEADER
            // --------------------------------

            const Text(
              'Road Condition Analysis',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 6),

            const Text(
              'AI-powered detection and severity assessment',
              style: TextStyle(
                color: Colors.white54,
                fontSize: 12,
              ),
            ),

            const SizedBox(height: 22),

            // --------------------------------
            // SUMMARY CARDS
            // --------------------------------

            Row(
              children: [
                Expanded(
                  child: AnalysisStatCard(
                    icon: Icons.analytics_outlined,
                    value: '127',
                    title: 'Total',
                    iconColor: const Color(0xFF00E676),
                  ),
                ),

                const SizedBox(width: 10),

                Expanded(
                  child: AnalysisStatCard(
                    icon: Icons.warning_amber_rounded,
                    value: '12',
                    title: 'Critical',
                    iconColor: Colors.redAccent,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: AnalysisStatCard(
                    icon: Icons.error_outline,
                    value: '31',
                    title: 'Severe',
                    iconColor: Colors.orange,
                  ),
                ),

                const SizedBox(width: 10),

                Expanded(
                  child: AnalysisStatCard(
                    icon: Icons.check_circle_outline,
                    value: '84',
                    title: 'Moderate / Minor',
                    iconColor: Colors.amber,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 25),

            // --------------------------------
            // AI MODEL STATUS
            // --------------------------------

            const Text(
              'AI Model Status',
              style: TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),

            const SizedBox(height: 10),

            const AiModelStatusCard(),

            const SizedBox(height: 25),

            // --------------------------------
            // RECENT ANALYSES
            // --------------------------------

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Analyses',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),

                TextButton(
                  onPressed: () {},
                  child: const Text(
                    'View All',
                    style: TextStyle(
                      color: Color(0xFF00E676),
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 5),

            // --------------------------------
            // ANALYSIS RESULTS
            // --------------------------------

            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const RoadDamageDetailsScreen(
                      location: 'NH-16 • Bhubaneswar',
                      damageType: 'Large Pothole',
                      severity: 'Critical',
                      confidence: 96,
                    ),
                  ),
                );
              },
              child: const RoadAnalysisCard(
                title: 'Large Pothole',
                location: 'NH-16 • Bhubaneswar',
                severity: 'CRITICAL',
                confidence: '96%',
                severityColor: Colors.redAccent,
                icon: Icons.warning_rounded,
              ),
            ),

            const SizedBox(height: 10),

            const RoadAnalysisCard(
              title: 'Road Cracks',
              location: 'Jaydev Vihar • Bhubaneswar',
              severity: 'SEVERE',
              confidence: '91%',
              severityColor: Colors.orange,
              icon: Icons.broken_image_outlined,
            ),

            const SizedBox(height: 10),

            const RoadAnalysisCard(
              title: 'Surface Damage',
              location: 'Patia • Bhubaneswar',
              severity: 'MODERATE',
              confidence: '87%',
              severityColor: Colors.amber,
              icon: Icons.traffic_outlined,
            ),

            const SizedBox(height: 15),
          ],
        ),
      ),
    );
  }
}