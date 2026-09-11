class ApiException implements Exception {
  final int statusCode;
  final String message;
  final Object? details;

  const ApiException({
    required this.statusCode,
    required this.message,
    this.details,
  });

  @override
  String toString() => 'ApiException($statusCode): $message';
}
