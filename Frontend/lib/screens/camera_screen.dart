import 'package:flutter/material.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  bool isScanning = false;

  void _startScanning() {
    setState(() {
      isScanning = true;
    });

    Future.delayed(const Duration(seconds: 3), () {
      if (!mounted) return;

      setState(() {
        isScanning = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Road scan completed successfully.',
          ),
          backgroundColor: Color(0xFF087A45),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06111C),

      appBar: AppBar(
        backgroundColor: const Color(0xFF06111C),
        elevation: 0,
        title: const Text(
          'Road Scanner',
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
              Icons.flash_off_outlined,
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
              // =========================
              // HEADER
              // =========================

              const Text(
                'Scan Road Condition',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 23,
                  fontWeight: FontWeight.w800,
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                'Capture road footage and detect surface damage with AI.',
                style: TextStyle(
                  color: Colors.white54,
                  fontSize: 12,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 20),

              // =========================
              // CAMERA PREVIEW
              // =========================

              Container(
                width: double.infinity,
                height: 390,
                decoration: BoxDecoration(
                  color: const Color(0xFF0A1922),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.07),
                  ),
                ),
                child: Stack(
                  children: [
                    // Fake camera background
                    ClipRRect(
                      borderRadius: BorderRadius.circular(22),
                      child: Container(
                        width: double.infinity,
                        height: double.infinity,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Color(0xFF102832),
                              Color(0xFF07151D),
                              Color(0xFF030B10),
                            ],
                          ),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.videocam_outlined,
                            color: Colors.white12,
                            size: 75,
                          ),
                        ),
                      ),
                    ),

                    // Top status
                    Positioned(
                      top: 15,
                      left: 15,
                      right: 15,
                      child: Row(
                        mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                        children: [
                          _StatusChip(
                            icon: Icons.circle,
                            text: isScanning
                                ? 'SCANNING'
                                : 'READY',
                            color: isScanning
                                ? Colors.orangeAccent
                                : const Color(0xFF00E676),
                          ),

                          const _StatusChip(
                            icon: Icons.gps_fixed,
                            text: 'GPS',
                            color: Color(0xFF00E676),
                          ),
                        ],
                      ),
                    ),

                    // Scan frame
                    Positioned.fill(
                      child: Center(
                        child: Container(
                          width: 250,
                          height: 180,
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: const Color(0xFF00E676)
                                  .withOpacity(0.65),
                              width: 1.5,
                            ),
                            borderRadius:
                            BorderRadius.circular(18),
                          ),
                        ),
                      ),
                    ),

                    // AI scanning line
                    if (isScanning)
                      Positioned(
                        left: 45,
                        right: 45,
                        top: 190,
                        child: Container(
                          height: 2,
                          decoration: BoxDecoration(
                            color: const Color(0xFF00E676),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF00E676)
                                    .withOpacity(0.7),
                                blurRadius: 12,
                              ),
                            ],
                          ),
                        ),
                      ),

                    // Bottom camera info
                    Positioned(
                      left: 18,
                      right: 18,
                      bottom: 18,
                      child: Row(
                        mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                        children: [
                          const _CameraInfo(
                            icon: Icons.hd_outlined,
                            text: 'HD',
                          ),
                          _CameraInfo(
                            icon: Icons.location_on_outlined,
                            text: isScanning
                                ? 'GPS Active'
                                : 'GPS Ready',
                          ),
                          const _CameraInfo(
                            icon: Icons.auto_awesome,
                            text: 'AI',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // =========================
              // AI INFO CARD
              // =========================

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B1720),
                  borderRadius: BorderRadius.circular(17),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.06),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFF00E676)
                            .withOpacity(0.10),
                        borderRadius:
                        BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.auto_awesome,
                        color: Color(0xFF00E676),
                        size: 21,
                      ),
                    ),

                    const SizedBox(width: 12),

                    const Expanded(
                      child: Column(
                        crossAxisAlignment:
                        CrossAxisAlignment.start,
                        children: [
                          Text(
                            'AI Road Detection',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Potholes, cracks and surface damage',
                            style: TextStyle(
                              color: Colors.white54,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),

                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 9,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00E676)
                            .withOpacity(0.10),
                        borderRadius:
                        BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'READY',
                        style: TextStyle(
                          color: Color(0xFF00E676),
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // =========================
              // START SCAN BUTTON
              // =========================

              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton.icon(
                  onPressed:
                  isScanning ? null : _startScanning,
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                    const Color(0xFF00E676),
                    disabledBackgroundColor:
                    Colors.white12,
                    foregroundColor:
                    const Color(0xFF06111C),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius:
                      BorderRadius.circular(16),
                    ),
                  ),
                  icon: Icon(
                    isScanning
                        ? Icons.sync
                        : Icons.camera_alt_rounded,
                  ),
                  label: Text(
                    isScanning
                        ? 'Scanning Road...'
                        : 'Start Road Scan',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              const Center(
                child: Text(
                  'Keep the road clearly visible while scanning.',
                  style: TextStyle(
                    color: Colors.white30,
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

// ======================================================
// STATUS CHIP
// ======================================================

class _StatusChip extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;

  const _StatusChip({
    required this.icon,
    required this.text,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.40),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            size: 7,
            color: color,
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

// ======================================================
// CAMERA INFO
// ======================================================

class _CameraInfo extends StatelessWidget {
  final IconData icon;
  final String text;

  const _CameraInfo({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          color: Colors.white54,
          size: 15,
        ),
        const SizedBox(width: 5),
        Text(
          text,
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}