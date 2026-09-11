import 'package:flutter/material.dart';
import '../services/api_exception.dart';
import '../services/auth_service.dart';
import 'signup_screen.dart';
import 'main_layout.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _obscurePassword = true;
  bool _isLoading = false;

  final AuthService _authService = AuthService();

  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (emailController.text.trim().isEmpty ||
        passwordController.text.isEmpty) {
      _showMessage('Enter your email and password.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.login(
        email: emailController.text.trim(),
        password: passwordController.text,
      );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MainLayout()),
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

                  const SizedBox(height: 30),

                  // --------------------------------
                  // HEADER
                  // --------------------------------

                  const Text(
                    'Welcome Back!',
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
                          text: 'Log in to continue\n',
                        ),
                        TextSpan(
                          text: 'to ',
                        ),
                        TextSpan(
                          text: 'RoadSense',
                          style: TextStyle(
                            color: Color(0xFF00E676),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // --------------------------------
                  // LOGO
                  // --------------------------------

                  Center(
                    child: Column(
                      children: [

                        Image.asset(
                          'assets/images/road_logo_for_s.png',
                          width: 95,
                          height: 95,
                          fit: BoxFit.contain,
                        ),

                        const SizedBox(height: 5),

                        RichText(
                          text: const TextSpan(
                            style: TextStyle(
                              fontSize: 27,
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

                        const SizedBox(height: 4),

                        const Text(
                          'Spotting Trouble Before It Spreads',
                          style: TextStyle(
                            color: Colors.white60,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

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
                      hint: 'Enter your password',

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

                  // --------------------------------
                  // FORGOT PASSWORD
                  // --------------------------------

                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {},
                      child: const Text(
                        'Forgot Password?',
                        style: TextStyle(
                          color: Color(0xFF00E676),
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ),

                  // --------------------------------
                  // LOGIN BUTTON
                  // --------------------------------

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00E676),
                        foregroundColor: Colors.white,
                        overlayColor: const Color(0xAA800000),
                      ),
                      onPressed: _isLoading ? null : _login,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text(
                        'Log In',
                        style: TextStyle(
                          color: Colors.white,
                        ),
                      ),
                    ),



                  ),

                  const SizedBox(height: 20),

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

                      Padding(
                        padding:
                        const EdgeInsets.symmetric(
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

                  const SizedBox(height: 25),

                  // --------------------------------
                  // SIGN UP
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
                            text:
                            "Don't have an account? ",
                          ),
                          WidgetSpan(
                            child: GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const SignupScreen(),
                                  ),
                                );
                              },
                              child: const Text(
                                'Sign Up',
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