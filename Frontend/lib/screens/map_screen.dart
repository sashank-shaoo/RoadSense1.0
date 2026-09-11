import 'package:flutter/material.dart';

import '../ widgets/map_filter_chips.dart';
import '../ widgets/road_map_view.dart';
import '../ widgets/selected_location_card.dart';
import 'road_damage_details_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  String selectedFilter = 'All';

  String selectedLocation = 'NH-16 • Bhubaneswar';
  String selectedSeverity = 'Critical';
  String selectedDamage = 'Large Pothole';
  String selectedConfidence = '96%';

  void _onFilterChanged(String filter) {
    setState(() {
      selectedFilter = filter;
    });
  }

  void _onMarkerTap(String severity) {
    setState(() {
      selectedSeverity =
          severity[0].toUpperCase() + severity.substring(1);

      switch (severity.toLowerCase()) {
        case 'critical':
          selectedLocation = 'NH-16 • Bhubaneswar';
          selectedDamage = 'Large Pothole';
          selectedConfidence = '96%';
          break;

        case 'severe':
          selectedLocation = 'Jaydev Vihar • Bhubaneswar';
          selectedDamage = 'Road Cracks';
          selectedConfidence = '91%';
          break;

        case 'moderate':
          selectedLocation = 'Patia • Bhubaneswar';
          selectedDamage = 'Surface Damage';
          selectedConfidence = '87%';
          break;

        case 'minor':
          selectedLocation = 'Saheed Nagar • Bhubaneswar';
          selectedDamage = 'Minor Cracks';
          selectedConfidence = '84%';
          break;
      }
    });
  }

  void _viewAnalysisDetails() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RoadDamageDetailsScreen(
          location: selectedLocation,
          damageType: selectedDamage,
          severity: selectedSeverity,
          confidence: int.parse(
            selectedConfidence.replaceAll('%', ''),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06111C),
      appBar: AppBar(
        backgroundColor: const Color(0xFF06111C),
        elevation: 0,
        title: const Text(
          'Road Map',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Road Condition Map',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'Monitor detected road damage across locations.',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 13,
                ),
              ),

              const SizedBox(height: 18),

              // Map
              RoadMapView(
                selectedSeverity: selectedSeverity,
                onMarkerTap: _onMarkerTap,
              ),

              const SizedBox(height: 18),

              // Filters
              const Text(
                'Filter by Severity',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),

              const SizedBox(height: 10),

              MapFilterChips(
                selectedFilter: selectedFilter,
                onFilterChanged: _onFilterChanged,
              ),

              const SizedBox(height: 18),

              // Selected location
              SelectedLocationCard(
                location: selectedLocation,
                severity: selectedSeverity,
                damageType: selectedDamage,
                confidence: selectedConfidence,
                onViewDetails: _viewAnalysisDetails,
              ),

              const SizedBox(height: 20),

              // Summary
              const Text(
                'Map Summary',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),

              const SizedBox(height: 12),

              Row(
                children: const [
                  Expanded(
                    child: _SummaryItem(
                      value: '127',
                      title: 'Total Issues',
                      icon: Icons.warning_amber_rounded,
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: _SummaryItem(
                      value: '12',
                      title: 'Critical',
                      icon: Icons.priority_high_rounded,
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: _SummaryItem(
                      value: '31',
                      title: 'Severe',
                      icon: Icons.report_problem_outlined,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final String value;
  final String title;
  final IconData icon;

  const _SummaryItem({
    required this.value,
    required this.title,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1720),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: const Color(0xFF00E676),
            size: 20,
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}