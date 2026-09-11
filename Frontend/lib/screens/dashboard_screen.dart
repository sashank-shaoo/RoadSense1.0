
import 'package:flutter/material.dart';
import '../ widgets/analysis_card.dart';
import '../ widgets/distance_card.dart';
import '../ widgets/stat_card.dart';
import 'analyze_dashcam_screen.dart';
import 'analyses_screen.dart';



class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

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
          'RoadSense',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.notifications_none,
              color: Colors.white,
            ),
          ),
        ],
      ),

      // --------------------------------
      // BODY
      // --------------------------------

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            16,
            5,
            16,
            25,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              // --------------------------------
              // HEADER
              // --------------------------------

              const Text(
                'Road Infrastructure Overview',
                style: TextStyle(
                  color: Color(0xFF00E676),
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.2,
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'Monitor road conditions, analyze damage,\nand prioritize maintenance.',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 12,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 18),

              // --------------------------------
              // DISTANCE CARD
              // --------------------------------

              const DistanceCard(),

              const SizedBox(height: 14),

              // --------------------------------
              // STATISTICS
              // --------------------------------

              Row(
                children: [

                  Expanded(
                    child: StatCard(
                      icon: Icons.warning_amber_rounded,
                      title: 'Total Detections',
                      value: '127',
                    ),
                  ),

                  const SizedBox(width: 10),

                  Expanded(
                    child: StatCard(
                      icon: Icons.error_outline,
                      title: 'Critical',
                      value: '12',
                      iconColor: Colors.redAccent,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              Row(
                children: [

                  Expanded(
                    child: SmallStat(
                      title: 'Severe',
                      value: '31',
                      color: Colors.orange,
                    ),
                  ),

                  const SizedBox(width: 8),

                  Expanded(
                    child: SmallStat(
                      title: 'Moderate',
                      value: '49',
                      color: Colors.amber,
                    ),
                  ),

                  const SizedBox(width: 8),

                  Expanded(
                    child: SmallStat(
                      title: 'Minor',
                      value: '35',
                      color: Colors.greenAccent,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 18),

              // --------------------------------
              // ANALYZE DASHCAM
              // --------------------------------

              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                      const AnalyzeDashcamScreen(),
                    ),
                  );
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF087A45),
                        Color(0xFF00C853),
                      ],
                    ),
                  ),
                  child: Row(
                    children: [

                      Container(
                        width: 45,
                        height: 45,
                        decoration: BoxDecoration(
                          color: Colors.white12,
                          borderRadius:
                          BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.videocam_outlined,
                          color: Colors.white,
                          size: 25,
                        ),
                      ),

                      const SizedBox(width: 12),

                      const Expanded(
                        child: Column(
                          crossAxisAlignment:
                          CrossAxisAlignment.start,
                          children: [

                            Text(
                              'Analyze Dashcam Footage',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),

                            SizedBox(height: 4),

                            Text(
                              'Upload video and start AI analysis',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const Icon(
                        Icons.arrow_forward_ios,
                        color: Colors.white,
                        size: 18,
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 22),

              // --------------------------------
              // RECENT ANALYSES
              // --------------------------------

              Row(
                mainAxisAlignment:
                MainAxisAlignment.spaceBetween,
                children: [

                  const Text(
                    'Recent Analyses',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  TextButton(
                    onPressed: () {},
                    child: const Text(
                      'View All',
                      style: TextStyle(
                        color: Color(0xFF00E676),
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 5),

              const AnalysisCard(
                fileName: 'Mumbai_Drive_01.mp4',
                details: '18.4 km • 2 hours ago',
              ),

              const AnalysisCard(
                fileName: 'NH48_Trip.mp4',
                details: '32.7 km • 5 hours ago',
              ),

              const AnalysisCard(
                fileName: 'City_Roads.mp4',
                details: '12.1 km • 1 day ago',
              ),
            ],
          ),
        ),
      ),
    );
  }
}