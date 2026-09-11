import 'package:flutter/material.dart';

import '../services/api_exception.dart';
import '../services/auth_service.dart';
import 'main_layout.dart';

class EmailVerificationScreen extends StatefulWidget {
  final String email;

  const EmailVerificationScreen({
    required this.email,
    super.key,
  });

  @override
  State<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  final _otpController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (_otpController.text.trim().length != 6) {
      _showMessage('Enter the six-digit verification code.');
      return;
    }
    setState(() => _isLoading = true);
    try {
      await _authService.verifyEmail(
        email: widget.email,
        otp: _otpController.text.trim(),
      );
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const MainLayout()),
        (_) => false,
      );
    } on ApiException catch (error) {
      if (mounted) _showMessage(error.message);
    } catch (_) {
      if (mounted) _showMessage('Unable to connect to RoadSense.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resend() async {
    try {
      await _authService.resendVerificationOtp(widget.email);
      if (mounted) _showMessage('A new verification code was sent.');
    } on ApiException catch (error) {
      if (mounted) _showMessage(error.message);
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06111C),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Verify email'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 32),
            const Text(
              'Check your inbox',
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              'Enter the six-digit code sent to ${widget.email}.',
              style: const TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 28),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              style: const TextStyle(color: Colors.white, fontSize: 24),
              decoration: const InputDecoration(
                labelText: 'Verification code',
                counterText: '',
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _verify,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Verify email'),
              ),
            ),
            Center(
              child: TextButton(
                onPressed: _isLoading ? null : _resend,
                child: const Text('Resend code'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
