class ReportLocation {
  final double latitude;
  final double longitude;

  const ReportLocation({
    required this.latitude,
    required this.longitude,
  });

  factory ReportLocation.fromJson(Map<String, dynamic> json) {
    return ReportLocation(
      latitude: _toDouble(json['latitude']) ?? 0,
      longitude: _toDouble(json['longitude']) ?? 0,
    );
  }
}

class ReportDetection {
  final String damageClass;
  final double confidence;
  final List<double> boundingBox;

  const ReportDetection({
    required this.damageClass,
    required this.confidence,
    required this.boundingBox,
  });

  factory ReportDetection.fromJson(Map<String, dynamic> json) {
    final rawBox = json['bbox'] as List<dynamic>? ?? const [];
    return ReportDetection(
      damageClass: json['damage_class']?.toString() ??
          json['class']?.toString() ??
          'Unknown',
      confidence: _toDouble(json['confidence']) ?? 0,
      boundingBox: rawBox.map((value) => _toDouble(value) ?? 0).toList(),
    );
  }
}

class Report {
  final String id;
  final String filename;
  final String? imageUrl;
  final ReportLocation location;
  final String processingStatus;
  final String? status;
  final int? detectionCount;
  final String? highestSeverity;
  final double? damageScore;
  final String? failureReason;
  final DateTime? createdAt;
  final List<ReportDetection> detections;

  const Report({
    required this.id,
    required this.filename,
    this.imageUrl,
    required this.location,
    required this.processingStatus,
    this.status,
    this.detectionCount,
    this.highestSeverity,
    this.damageScore,
    this.failureReason,
    this.createdAt,
    this.detections = const [],
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    final rawDetections = json['detections'] as List<dynamic>? ?? const [];
    return Report(
      id: json['id']?.toString() ?? json['report_id']?.toString() ?? '',
      filename: json['original_filename']?.toString() ?? '',
      imageUrl: json['image_url']?.toString(),
      location: ReportLocation.fromJson(json),
      processingStatus: json['processing_status']?.toString() ?? 'PENDING',
      status: json['status']?.toString(),
      detectionCount: _toInt(json['detection_count']),
      highestSeverity: json['highest_severity']?.toString(),
      damageScore: _toDouble(json['damage_score']),
      failureReason: json['failure_reason']?.toString(),
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      detections: rawDetections
          .whereType<Map<String, dynamic>>()
          .map(ReportDetection.fromJson)
          .toList(),
    );
  }
}

double? _toDouble(Object? value) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '');
}

int? _toInt(Object? value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '');
}
