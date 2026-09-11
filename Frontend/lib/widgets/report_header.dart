import 'package:flutter/material.dart';

class ReportHeader extends StatelessWidget {
  final String selectedFilter;
  final ValueChanged<String> onFilterChanged;

  const ReportHeader({
    super.key,
    required this.selectedFilter,
    required this.onFilterChanged,
  });

  @override
  Widget build(BuildContext context) {
    const filters = [
      'All',
      'Pending',
      'Submitted',
      'Resolved',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Road Damage Reports',
          style: TextStyle(
            color: Colors.white,
            fontSize: 23,
            fontWeight: FontWeight.w800,
          ),
        ),

        const SizedBox(height: 6),

        const Text(
          'Manage road issues and maintenance reports.',
          style: TextStyle(
            color: Colors.white54,
            fontSize: 12,
            height: 1.4,
          ),
        ),

        const SizedBox(height: 18),

        // Search
        Container(
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF0B1720),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: Colors.white.withOpacity(0.07),
            ),
          ),
          child: const TextField(
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
            decoration: InputDecoration(
              hintText: 'Search reports, location or ID',
              hintStyle: TextStyle(
                color: Colors.white30,
                fontSize: 12,
              ),
              prefixIcon: Icon(
                Icons.search_rounded,
                color: Colors.white38,
                size: 20,
              ),
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(
                vertical: 14,
              ),
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Filters
        SizedBox(
          height: 36,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: filters.length,
            separatorBuilder: (_, __) =>
            const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final filter = filters[index];
              final selected = selectedFilter == filter;

              return GestureDetector(
                onTap: () => onFilterChanged(filter),
                child: AnimatedContainer(
                  duration: const Duration(
                    milliseconds: 220,
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: selected
                        ? const Color(0xFF00E676)
                        : const Color(0xFF0B1720),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: selected
                          ? const Color(0xFF00E676)
                          : Colors.white12,
                    ),
                  ),
                  child: Text(
                    filter,
                    style: TextStyle(
                      color: selected
                          ? const Color(0xFF06111C)
                          : Colors.white54,
                      fontSize: 10,
                      fontWeight: selected
                          ? FontWeight.w700
                          : FontWeight.w500,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}