import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'api_exception.dart';

class ApiClient {
  final http.Client _httpClient;
  final Future<String?> Function() _readToken;

  ApiClient({
    http.Client? httpClient,
    required Future<String?> Function() readToken,
  })  : _httpClient = httpClient ?? http.Client(),
        _readToken = readToken;

  Future<Map<String, dynamic>> get(String path) async {
    final response = await _httpClient
        .get(_uri(path), headers: await _headers())
        .timeout(ApiConfig.requestTimeout);
    return _decode(response);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final response = await _httpClient
        .post(
          _uri(path),
          headers: await _headers(json: true),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(ApiConfig.requestTimeout);
    return _decode(response);
  }

  Future<Map<String, dynamic>> postMultipart(
    String path, {
    required String filePath,
    required Map<String, String> fields,
  }) async {
    final request = http.MultipartRequest('POST', _uri(path));
    request.headers.addAll(await _headers());
    request.fields.addAll(fields);
    request.files.add(await http.MultipartFile.fromPath('file', filePath));

    final response = await _httpClient.send(request).timeout(
          ApiConfig.requestTimeout,
        );
    return _decode(await http.Response.fromStream(response));
  }

  Uri _uri(String path) {
    final base = ApiConfig.baseUrl.endsWith('/')
        ? ApiConfig.baseUrl.substring(0, ApiConfig.baseUrl.length - 1)
        : ApiConfig.baseUrl;
    return Uri.parse('$base$path');
  }

  Future<Map<String, String>> _headers({bool json = false}) async {
    final headers = <String, String>{'Accept': 'application/json'};
    if (json) {
      headers['Content-Type'] = 'application/json';
    }

    final token = await _readToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Map<String, dynamic> _decode(http.Response response) {
    final decoded = response.body.isEmpty
        ? <String, dynamic>{}
        : jsonDecode(response.body);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = decoded is Map<String, dynamic>
          ? decoded['error']?.toString() ??
              decoded['message']?.toString() ??
              'Request failed'
          : 'Request failed';
      throw ApiException(
        statusCode: response.statusCode,
        message: message,
        details: decoded is Map<String, dynamic> ? decoded['error'] : null,
      );
    }

    if (decoded is! Map<String, dynamic>) {
      throw const ApiException(
        statusCode: 500,
        message: 'The server returned an invalid response',
      );
    }
    return decoded;
  }

  void close() => _httpClient.close();
}
