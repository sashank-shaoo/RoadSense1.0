import 'package:flutter/material.dart';

import '../ widgets/ai_assessment_card..dart';
import '../ widgets/damage_action_buttons.dart';
import '../ widgets/damage_evidence_card.dart';
import '../ widgets/damage_info_card.dart';
import 'map_screen.dart';
import 'visual_restoration_screen.dart';

class RoadDamageDetailsScreen extends StatelessWidget {
  final String location;
  final String damageType;
  final String severity;
  final int confidence;

  const RoadDamageDetailsScreen({
    super.key,
    required this.location,
    required this.damageType,
    required this.severity,
    required this.confidence,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06111C),

      appBar: AppBar(
        backgroundColor: const Color(0xFF06111C),
        elevation: 0,
        title: const Text(
          'Road Damage Details',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        iconTheme: const IconThemeData(
          color: Colors.white,
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DamageInfoCard(
                location: location,
                damageType: damageType,
                severity: severity,
                confidence: confidence,
              ),

              const SizedBox(height: 16),

              const DamageEvidenceCard(
                imagePath: 'assets/images/damaged_road.jpg',
              ),

              const SizedBox(height: 16),

              AiAssessmentCard(
                assessment:
                'The AI model detected significant surface deformation. '
                    'The damaged area may require immediate inspection and maintenance.',
                confidence: confidence,
              ),

              const SizedBox(height: 20),

              // DamageActionButtons(
              //   onViewMap: () {
              //     Navigator.pop(context);
              //   },
              //
              //   onGenerateRestoration: () {
              //     ScaffoldMessenger.of(context).showSnackBar(
              //       const SnackBar(
              //         content: Text(
              //           'Opening AI Visual Restoration...',
              //         ),
              //       ),
              //     );
              //   },
              // ),
              DamageActionButtons(
                onViewMap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const MapScreen(),
                    ),
                  );
                },

                onGenerateRestoration: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const VisualRestorationScreen(),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}