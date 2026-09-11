import 'package:flutter/material.dart';

class RecentReportCard extends StatelessWidget {
  final String reportId;
  final String location;
  final String issue;
  final String severity;
  final String date;
  final String status;
  final Color statusColor;
  final VoidCallback? onTap;

  const RecentReportCard({
    super.key,
    required this.reportId,
    required this.location,
    required this.issue,
    required this.severity,
    required this.date,
    required this.status,
    required this.statusColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: const Color(0xFF0B1720),
          borderRadius: BorderRadius.circular(17),
          border: Border.all(
            color: Colors.white.withOpacity(0.07),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.description_outlined,
                  color: Color(0xFF00E676),
                  size: 19,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    reportId,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                _StatusBadge(
                  text: status,
                  color: statusColor,
                ),
              ],
            ),

            const SizedBox(height: 14),

            Text(
              issue,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 6),

            Row(
              children: [
                const Icon(
                  Icons.location_on_outlined,
                  color: Colors.white38,
                  size: 14,
                ),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    location,
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                _InfoItem(
                  icon: Icons.warning_amber_rounded,
                  text: severity,
                ),
                const SizedBox(width: 16),
                _InfoItem(
                  icon: Icons.calendar_today_outlined,
                  text: date,
                ),

                const Spacer(),

                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Colors.white30,
                  size: 14,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String text;
  final Color color;

  const _StatusBadge({
    required this.text,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withOpacity(0.25),
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoItem({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          color: Colors.white38,
          size: 13,
        ),
        const SizedBox(width: 5),
        Text(
          text,
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}