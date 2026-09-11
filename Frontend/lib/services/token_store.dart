import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStore {
  static const key = 'roadsense_access_token';

  final FlutterSecureStorage _storage;

  const TokenStore({FlutterSecureStorage storage = const FlutterSecureStorage()})
      : _storage = storage;

  Future<String?> read() => _storage.read(key: key);

  Future<void> write(String token) => _storage.write(key: key, value: token);

  Future<void> clear() => _storage.delete(key: key);
}
