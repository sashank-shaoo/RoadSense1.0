import '../models/user.dart';
import 'api_client.dart';
import 'token_store.dart';

class AuthResult {
  final User user;
  final String? token;
  final String message;

  const AuthResult({
    required this.user,
    required this.message,
    this.token,
  });
}

class AuthService {
  final ApiClient _apiClient;
  final TokenStore _tokenStore;

  AuthService({
    ApiClient? apiClient,
    TokenStore? tokenStore,
  })  : _tokenStore = tokenStore ?? const TokenStore(),
        _apiClient = apiClient ??
            ApiClient(
              readToken: () => (tokenStore ?? const TokenStore()).read(),
            );

  Future<AuthResult> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/api/v1/users/register',
      body: {
        'name': name,
        'email': email,
        'password': password,
      },
    );
    return AuthResult(
      user: User.fromJson(response['user'] as Map<String, dynamic>),
      message: response['message']?.toString() ?? 'Registration successful',
    );
  }

  Future<AuthResult> verifyEmail({
    required String email,
    required String otp,
  }) async {
    final response = await _apiClient.post(
      '/api/v1/users/verify-email',
      body: {'email': email, 'otp': otp},
    );
    final token = response['token']?.toString();
    if (token != null) {
      await _tokenStore.write(token);
    }
    return AuthResult(
      user: User.fromJson(response['user'] as Map<String, dynamic>),
      token: token,
      message: response['message']?.toString() ?? 'Email verified',
    );
  }

  Future<void> resendVerificationOtp(String email) async {
    await _apiClient.post(
      '/api/v1/users/resend-otp',
      body: {'email': email},
    );
  }

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/api/v1/users/login',
      body: {'email': email, 'password': password},
    );
    final token = response['token']?.toString();
    if (token != null) {
      await _tokenStore.write(token);
    }
    return AuthResult(
      user: User.fromJson(response['user'] as Map<String, dynamic>),
      token: token,
      message: response['message']?.toString() ?? 'Login successful',
    );
  }

  Future<User> currentUser() async {
    final response = await _apiClient.get('/api/v1/users/me');
    return User.fromJson(response['user'] as Map<String, dynamic>);
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/api/v1/users/logout');
    } finally {
      await _tokenStore.clear();
    }
  }

  Future<bool> hasToken() async {
    final token = await _tokenStore.read();
    return token != null && token.isNotEmpty;
  }
}
