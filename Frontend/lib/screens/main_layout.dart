//
// import 'package:flutter/material.dart';
//
// import 'dashboard_screen.dart';
// import 'map_screen.dart';
//
//
// class MainLayout extends StatefulWidget {
//   const MainLayout({super.key});
//
//   @override
//   State<MainLayout> createState() => _MainLayoutState();
// }
//
// class _MainLayoutState extends State<MainLayout> {
//   int currentIndex = 0;
//
//   final List<Widget> screens = const [
//     DashboardScreen(),
//     MapScreen(),
//
//
//     // Abhi temporary screens
//     Center(
//       child: Text(
//         'Analyses',
//         style: TextStyle(
//           color: Colors.white,
//           fontSize: 20,
//         ),
//       ),
//     ),
//
//     Center(
//       child: Text(
//         'Reports',
//         style: TextStyle(
//           color: Colors.white,
//           fontSize: 20,
//         ),
//       ),
//     ),
//
//     Center(
//       child: Text(
//         'Profile',
//         style: TextStyle(
//           color: Colors.white,
//           fontSize: 20,
//         ),
//       ),
//     ),
//   ];
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: const Color(0xFF06131D),
//
//       // IMPORTANT
//       body: IndexedStack(
//         index: currentIndex,
//         children: screens,
//       ),
//
//       bottomNavigationBar: BottomNavigationBar(
//         currentIndex: currentIndex,
//
//         type: BottomNavigationBarType.fixed,
//
//         backgroundColor: const Color(0xFF071923),
//
//         selectedItemColor: const Color(0xFF00E676),
//         unselectedItemColor: Colors.white38,
//
//         selectedFontSize: 10,
//         unselectedFontSize: 10,
//
//         showUnselectedLabels: true,
//
//         onTap: (index) {
//           setState(() {
//             currentIndex = index;
//           });
//         },
//
//         items: const [
//           BottomNavigationBarItem(
//             icon: Icon(Icons.home_outlined),
//             activeIcon: Icon(Icons.home),
//             label: 'Home',
//           ),
//
//           BottomNavigationBarItem(
//             icon: Icon(Icons.map_outlined),
//             activeIcon: Icon(Icons.map),
//             label: 'Map',
//           ),
//
//           BottomNavigationBarItem(
//             icon: Icon(Icons.analytics_outlined),
//             activeIcon: Icon(Icons.analytics),
//             label: 'Analyses',
//           ),
//
//           BottomNavigationBarItem(
//             icon: Icon(Icons.description_outlined),
//             activeIcon: Icon(Icons.description),
//             label: 'Reports',
//           ),
//
//           BottomNavigationBarItem(
//             icon: Icon(Icons.person_outline),
//             activeIcon: Icon(Icons.person),
//             label: 'Profile',
//           ),
//         ],
//       ),
//     );
//   }
// }
import 'package:flutter/material.dart';

import 'dashboard_screen.dart';
import 'map_screen.dart';
import 'camera_screen.dart';
import 'analyses_screen.dart';
import 'report_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int currentIndex = 0;

  final List<Widget> screens = const [
    DashboardScreen(),
    MapScreen(),
    CameraScreen(),
    AnalysesScreen(),
    ReportScreen(),

    // Temporary Reports Screen
    Center(
      child: Text(
        'Reports',
        style: TextStyle(
          color: Colors.white,
          fontSize: 20,
        ),
      ),
    ),
  ];

  void _changeTab(int index) {
    if (currentIndex == index) return;

    setState(() {
      currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06131D),

      // =================================================
      // MAIN SCREEN
      // =================================================

      body: IndexedStack(
        index: currentIndex,
        children: screens,
      ),

      // =================================================
      // BOTTOM NAVIGATION
      // =================================================

      bottomNavigationBar: SafeArea(
        top: false,
        child: Container(
          height: 78,
          margin: const EdgeInsets.fromLTRB(
            10,
            0,
            10,
            10,
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: 6,
            vertical: 6,
          ),
          decoration: BoxDecoration(
            color: const Color(0xFF071923),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: Colors.white.withOpacity(0.06),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.35),
                blurRadius: 20,
                offset: const Offset(0, 7),
              ),
            ],
          ),

          child: Row(
            children: [
              // ==========================================
              // HOME
              // ==========================================

              Expanded(
                child: _NavItem(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home,
                  label: 'Home',
                  selected: currentIndex == 0,
                  onTap: () => _changeTab(0),
                ),
              ),

              // ==========================================
              // MAP
              // ==========================================

              Expanded(
                child: _NavItem(
                  icon: Icons.map_outlined,
                  activeIcon: Icons.map,
                  label: 'Map',
                  selected: currentIndex == 1,
                  onTap: () => _changeTab(1),
                ),
              ),

              // ==========================================
              // CAMERA
              // ==========================================

              Expanded(
                child: _CameraNavItem(
                  selected: currentIndex == 2,
                  onTap: () => _changeTab(2),
                ),
              ),

              // ==========================================
              // ANALYSIS
              // ==========================================

              Expanded(
                child: _NavItem(
                  icon: Icons.analytics_outlined,
                  activeIcon: Icons.analytics,
                  label: 'Analysis',
                  selected: currentIndex == 3,
                  onTap: () => _changeTab(3),
                ),
              ),

              // ==========================================
              // REPORT
              // ==========================================

              Expanded(
                child: _NavItem(
                  icon: Icons.description_outlined,
                  activeIcon: Icons.description,
                  label: 'Report',
                  selected: currentIndex == 4,
                  onTap: () => _changeTab(4),
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
// NORMAL NAV ITEM
// ======================================================

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOutCubic,
        margin: const EdgeInsets.symmetric(horizontal: 3),
        padding: const EdgeInsets.symmetric(
          vertical: 7,
          horizontal: 2,
        ),
        decoration: BoxDecoration(
          color: selected
              ? const Color(0xFF00E676).withOpacity(0.10)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon animation
            AnimatedScale(
              scale: selected ? 1.12 : 1.0,
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOutBack,
              child: Icon(
                selected ? activeIcon : icon,
                size: 21,
                color: selected
                    ? const Color(0xFF00E676)
                    : Colors.white38,
              ),
            ),

            const SizedBox(height: 4),

            // Label
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 250),
              style: TextStyle(
                color: selected
                    ? const Color(0xFF00E676)
                    : Colors.white38,
                fontSize: 9,
                fontWeight: selected
                    ? FontWeight.w700
                    : FontWeight.w500,
              ),
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),

            const SizedBox(height: 3),

            // Active dot
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: selected ? 4 : 0,
              height: selected ? 4 : 0,
              decoration: const BoxDecoration(
                color: Color(0xFF00E676),
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ======================================================
// CAMERA NAV ITEM
// ======================================================

class _CameraNavItem extends StatelessWidget {
  final bool selected;
  final VoidCallback onTap;

  const _CameraNavItem({
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedScale(
            scale: selected ? 1.08 : 1.0,
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOutBack,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 280),
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: selected
                    ? const Color(0xFF00E676)
                    : const Color(0xFF0B222A),
                border: Border.all(
                  color: const Color(0xFF00E676),
                  width: 1.8,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00E676)
                        .withOpacity(
                      selected ? 0.45 : 0.15,
                    ),
                    blurRadius: selected ? 18 : 8,
                    spreadRadius: selected ? 2 : 0,
                  ),
                ],
              ),
              child: Icon(
                Icons.camera_alt_rounded,
                size: 23,
                color: selected
                    ? const Color(0xFF06131D)
                    : const Color(0xFF00E676),
              ),
            ),
          ),

          const SizedBox(height: 2),

          Text(
            'Camera',
            style: TextStyle(
              color: selected
                  ? const Color(0xFF00E676)
                  : Colors.white38,
              fontSize: 9,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}