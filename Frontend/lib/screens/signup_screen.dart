import 'package:flutter/material.dart';

import '../services/api_exception.dart';
import '../services/auth_service.dart';
import 'email_verification_screen.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreeToTerms = false;
  bool _isLoading = false;

  final AuthService _authService = AuthService();

  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController =
  TextEditingController();

  @override
  void dispose() {
    nameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_agreeToTerms) {
      _showMessage('Please accept Terms & Conditions');
      return;
    }
    if (passwordController.text != confirmPasswordController.text) {
      _showMessage('Passwords do not match');
      return;
    }
    if (nameController.text.trim().length < 2 ||
        emailController.text.trim().isEmpty ||
        passwordController.text.length < 6) {
      _showMessage('Enter a valid name, email, and password.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.register(
        name: nameController.text.trim(),
        email: emailController.text.trim(),
        password: passwordController.text,
      );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => EmailVerificationScreen(
            email: emailController.text.trim(),
          ),
        ),
      );
    } on ApiException catch (error) {
      if (mounted) _showMessage(error.message);
    } catch (_) {
      if (mounted) _showMessage('Unable to connect to RoadSense.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  InputDecoration inputDecoration({
    required IconData icon,
    required String label,
    required String hint,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      prefixIcon: Icon(
        icon,
        color: Colors.white70,
        size: 20,
      ),
      suffixIcon: suffixIcon,

      labelText: label,
      hintText: hint,

      labelStyle: const TextStyle(
        color: Colors.white70,
        fontSize: 11,
      ),

      hintStyle: const TextStyle(
        color: Colors.white38,
        fontSize: 12,
      ),

      filled: true,
      fillColor: const Color(0xFF0D1B27),

      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(
          color: Color(0xFF263746),
        ),
      ),

      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(
          color: Color(0xFF00E676),
          width: 1.2,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,

        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF020B12),
              Color(0xFF061927),
              Color(0xFF031018),
            ],
          ),
        ),

        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 20,
            ),

            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: size.height - 40,
              ),

              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  const SizedBox(height: 20),

                  // --------------------------------
                  // BACK BUTTON
                  // --------------------------------

                  IconButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),

                  const SizedBox(height: 5),

                  // --------------------------------
                  // TITLE
                  // --------------------------------

                  const Text(
                    'Create Account',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 5),

                  RichText(
                    text: const TextSpan(
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white60,
                      ),
                      children: [
                        TextSpan(
                          text: 'Join ',
                        ),
                        TextSpan(
                          text: 'RoadSense',
                          style: TextStyle(
                            color: Color(0xFF00E676),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        TextSpan(
                          text: ' and help make roads safer.',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // --------------------------------
                  // LOGO
                  // --------------------------------

                  Center(
                    child: Column(
                      children: [

                        Image.asset(
                          'assets/images/road_logo_for_s.png',
                          width: 85,
                          height: 85,
                          fit: BoxFit.contain,
                        ),

                        const SizedBox(height: 3),

                        RichText(
                          text: const TextSpan(
                            style: TextStyle(
                              fontSize: 25,
                              fontWeight: FontWeight.bold,
                            ),
                            children: [
                              TextSpan(
                                text: 'Road',
                                style: TextStyle(
                                  color: Colors.white,
                                ),
                              ),
                              TextSpan(
                                text: 'Sense',
                                style: TextStyle(
                                  color: Color(0xFF00E676),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // --------------------------------
                  // FULL NAME
                  // --------------------------------

                  TextField(
                    controller: nameController,
                    keyboardType: TextInputType.name,

                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                    ),

                    decoration: inputDecoration(
                      icon: Icons.person_outline,
                      label: 'Full Name',
                      hint: 'Enter your full name',
                    ),
                  ),

                  const SizedBox(height: 12),

                  // --------------------------------
                  // EMAIL
                  // --------------------------------

                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,

                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                    ),

                    decoration: inputDecoration(
                      icon: Icons.email_outlined,
                      label: 'Email Address',
                      hint: 'Enter your email',
                    ),
                  ),

                  const SizedBox(height: 12),

                  // --------------------------------
                  // PASSWORD
                  // --------------------------------

                  TextField(
                    controller: passwordController,
                    obscureText: _obscurePassword,

                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                    ),

                    decoration: inputDecoration(
                      icon: Icons.lock_outline,
                      label: 'Password',
                      hint: 'Create a password',

                      suffixIcon: IconButton(
                        onPressed: () {
                          setState(() {
                            _obscurePassword =
                            !_obscurePassword;
                          });
                        },

                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: Colors.white54,
                          size: 19,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // --------------------------------
                  // CONFIRM PASSWORD
                  // --------------------------------

                  TextField(
                    controller: confirmPasswordController,
                    obscureText: _obscureConfirmPassword,

                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                    ),

                    decoration: inputDecoration(
                      icon: Icons.lock_reset_outlined,
                      label: 'Confirm Password',
                      hint: 'Confirm your password',

                      suffixIcon: IconButton(
                        onPressed: () {
                          setState(() {
                            _obscureConfirmPassword =
                            !_obscureConfirmPassword;
                          });
                        },

                        icon: Icon(
                          _obscureConfirmPassword
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: Colors.white54,
                          size: 19,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // --------------------------------
                  // TERMS
                  // --------------------------------

                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [

                      Checkbox(
                        value: _agreeToTerms,

                        activeColor:
                        const Color(0xFF00C853),

                        checkColor: Colors.white,

                        side: const BorderSide(
                          color: Colors.white54,
                        ),

                        onChanged: (value) {
                          setState(() {
                            _agreeToTerms = value ?? false;
                          });
                        },
                      ),

                      Expanded(
                        child: RichText(
                          text: const TextSpan(
                            style: TextStyle(
                              color: Colors.white60,
                              fontSize: 10,
                            ),
                            children: [
                              TextSpan(
                                text: 'I agree to the ',
                              ),
                              TextSpan(
                                text: 'Terms & Conditions',
                                style: TextStyle(
                                  color: Color(0xFF00E676),
                                ),
                              ),
                              TextSpan(
                                text: ' and ',
                              ),
                              TextSpan(
                                text: 'Privacy Policy',
                                style: TextStyle(
                                  color: Color(0xFF00E676),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // --------------------------------
                  // CREATE ACCOUNT
                  // --------------------------------

                  SizedBox(
                    width: double.infinity,
                    height: 48,

                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _register,

                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                        const Color(0xFF00C853),

                        foregroundColor: Colors.white,

                        shape: RoundedRectangleBorder(
                          borderRadius:
                          BorderRadius.circular(8),
                        ),

                        elevation: 0,
                      ),

                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text(
                              'Create Account',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // --------------------------------
                  // DIVIDER
                  // --------------------------------

                  Row(
                    children: [

                      const Expanded(
                        child: Divider(
                          color: Colors.white12,
                        ),
                      ),

                      const Padding(
                        padding:
                        EdgeInsets.symmetric(
                          horizontal: 12,
                        ),
                        child: Text(
                          'or continue with',
                          style: TextStyle(
                            color: Colors.white54,
                            fontSize: 11,
                          ),
                        ),
                      ),

                      const Expanded(
                        child: Divider(
                          color: Colors.white12,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // --------------------------------
                  // GOOGLE
                  // --------------------------------

                  _socialButton(
                    icon: Icons.g_mobiledata,
                    text: 'Continue with Google',
                    onTap: () {},
                  ),

                  const SizedBox(height: 10),

                  // --------------------------------
                  // APPLE
                  // --------------------------------

                  _socialButton(
                    icon: Icons.apple,
                    text: 'Continue with Apple',
                    onTap: () {},
                  ),

                  const SizedBox(height: 22),

                  // --------------------------------
                  // LOGIN
                  // --------------------------------

                  Center(
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          color: Colors.white60,
                          fontSize: 11,
                        ),
                        children: [
                          const TextSpan(
                            text: 'Already have an account? ',
                          ),

                          WidgetSpan(
                            child: GestureDetector(
                              onTap: () {
                                Navigator.pop(context);
                              },
                              child: const Text(
                                'Log In',
                                style: TextStyle(
                                  color: Color(0xFF00E676),
                                  fontWeight: FontWeight.w600,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 15),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // --------------------------------
  // SOCIAL BUTTON
  // --------------------------------

  Widget _socialButton({
    required IconData icon,
    required String text,
    required VoidCallback onTap,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 45,

      child: OutlinedButton(
        onPressed: onTap,

        style: OutlinedButton.styleFrom(
          backgroundColor: const Color(0xFF0D1B27),

          side: const BorderSide(
            color: Color(0xFF263746),
          ),

          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),

        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [

            Icon(
              icon,
              color: Colors.white,
              size: 22,
            ),

            const SizedBox(width: 10),

            Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}