import '../models/report.dart';
import 'api_client.dart';
import 'token_store.dart';

class ReportService {
  final ApiClient _apiClient;

  ReportService({ApiClient? apiClient, TokenStore? tokenStore})
      : _apiClient = apiClient ??
            ApiClient(readToken: () => (tokenStore ?? const TokenStore()).read());

  Future<Report> createReport({
    required String filePath,
    required double latitude,
    required double longitude,
  }) async {
    final response = await _apiClient.postMultipart(
      '/api/v1/createreport/',
      filePath: filePath,
      fields: {
        'latitude': latitude.toString(),
        'longitude': longitude.toString(),
      },
    );
    return Report.fromJson(response['report'] as Map<String, dynamic>);
  }
}
