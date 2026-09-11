import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

import '../ widgets/create_report_card.dart';
import '../ widgets/recent_report_card.dart';
import '../ widgets/report_header.dart';
import '../ widgets/report_pie_chart.dart';
import '../ widgets/report_summary_card.dart';
import '../models/report.dart';
import '../services/api_exception.dart';
import '../services/report_service.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  String selectedFilter = 'All';
  bool _isCreatingReport = false;
  Report? _latestReport;

  final ImagePicker _imagePicker = ImagePicker();
  final ReportService _reportService = ReportService();

  void _onFilterChanged(String filter) {
    setState(() {
      selectedFilter = filter;
    });
  }

  Future<void> _createReport() async {
    final image = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (image == null || !mounted) return;

    setState(() => _isCreatingReport = true);
    try {
      final permission = await Geolocator.checkPermission();
      var locationPermission = permission;
      if (permission == LocationPermission.denied) {
        locationPermission = await Geolocator.requestPermission();
      }
      if (locationPermission == LocationPermission.denied ||
          locationPermission == LocationPermission.deniedForever) {
        throw const ApiException(
          statusCode: 403,
          message: 'Location permission is required to create a report.',
        );
      }

      final position = await Geolocator.getCurrentPosition();
      final report = await _reportService.createReport(
        filePath: image.path,
        latitude: position.latitude,
        longitude: position.longitude,
      );

      if (!mounted) return;
      setState(() => _latestReport = report);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Report ${report.id} processed: ${report.processingStatus}',
          ),
          backgroundColor: const Color(0xFF087A45),
        ),
      );
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.message)),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to create the report.')),
        );
      }
    } finally {
      if (mounted) setState(() => _isCreatingReport = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06111C),

      appBar: AppBar(
        backgroundColor: const Color(0xFF06111C),
        elevation: 0,
        title: const Text(
          'Reports',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(
              Icons.notifications_none_rounded,
              color: Colors.white70,
            ),
          ),
        ],
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            16,
            8,
            16,
            30,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header + Search + Filter
              ReportHeader(
                selectedFilter: selectedFilter,
                onFilterChanged: _onFilterChanged,
              ),

              const SizedBox(height: 18),

              // Summary
              const ReportSummaryCard(),

              const SizedBox(height: 18),

              // Pie Chart
              const ReportPieChart(),

              const SizedBox(height: 22),

              // Create Report
              CreateReportCard(
                onTap: _isCreatingReport ? () {} : _createReport,
              ),

              if (_latestReport?.imageUrl != null) ...[
                const SizedBox(height: 18),
                _UploadedReportImage(report: _latestReport!),
              ],

              const SizedBox(height: 25),

              // Recent Reports
              Row(
                mainAxisAlignment:
                MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Recent Reports',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),

                  Text(
                    selectedFilter,
                    style: const TextStyle(
                      color: Color(0xFF00E676),
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Report 1
              RecentReportCard(
                reportId: 'RS-2026-00127',
                location: 'NH-16 • Bhubaneswar',
                issue: 'Large Pothole',
                severity: 'Critical',
                date: 'Today',
                status: 'Pending',
                statusColor: Colors.orangeAccent,
              ),

              const SizedBox(height: 10),

              // Report 2
              RecentReportCard(
                reportId: 'RS-2026-00126',
                location: 'Jaydev Vihar • Bhubaneswar',
                issue: 'Road Cracks',
                severity: 'Severe',
                date: 'Yesterday',
                status: 'Submitted',
                statusColor: Colors.blueAccent,
              ),

              const SizedBox(height: 10),

              // Report 3
              RecentReportCard(
                reportId: 'RS-2026-00125',
                location: 'Patia • Bhubaneswar',
                issue: 'Surface Damage',
                severity: 'Moderate',
                date: '2 days ago',
                status: 'Resolved',
                statusColor: Colors.greenAccent,
              ),

              const SizedBox(height: 10),

              // Report 4
              RecentReportCard(
                reportId: 'RS-2026-00124',
                location: 'Saheed Nagar • Bhubaneswar',
                issue: 'Minor Cracks',
                severity: 'Minor',
                date: '3 days ago',
                status: 'Submitted',
                statusColor: Colors.blueAccent,
              ),

              const SizedBox(height: 20),

              const Center(
                child: Text(
                  'RoadSense • Road maintenance reporting',
                  style: TextStyle(
                    color: Colors.white24,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _UploadedReportImage extends StatelessWidget {
  final Report report;

  const _UploadedReportImage({required this.report});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1720),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Uploaded evidence',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              report.imageUrl!,
              width: double.infinity,
              height: 190,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const SizedBox(
                height: 190,
                child: Center(
                  child: Text(
                    'The temporary image URL has expired.',
                    style: TextStyle(color: Colors.white60),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}