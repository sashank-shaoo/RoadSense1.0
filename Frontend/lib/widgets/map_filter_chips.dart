import 'package:flutter/material.dart';

class MapFilterChips extends StatelessWidget {
  final String selectedFilter;
  final ValueChanged<String> onFilterChanged;

  const MapFilterChips({
    super.key,
    required this.selectedFilter,
    required this.onFilterChanged,
  });

  static const List<String> filters = [
    'All',
    'Critical',
    'Severe',
    'Moderate',
    'Minor',
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 42,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final filter = filters[index];
          final isSelected = selectedFilter == filter;

          return GestureDetector(
            onTap: () => onFilterChanged(filter),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 10,
              ),
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(0xFF00E676)
                    : const Color(0xFF111E27),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFF00E676)
                      : Colors.white.withOpacity(0.08),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (filter != 'All') ...[
                    Icon(
                      Icons.circle,
                      size: 8,
                      color: _getFilterColor(filter),
                    ),
                    const SizedBox(width: 7),
                  ],
                  Text(
                    filter,
                    style: TextStyle(
                      color: isSelected
                          ? const Color(0xFF06111C)
                          : Colors.white70,
                      fontSize: 13,
                      fontWeight: isSelected
                          ? FontWeight.w700
                          : FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Color _getFilterColor(String filter) {
    switch (filter.toLowerCase()) {
      case 'critical':
        return Colors.redAccent;
      case 'severe':
        return Colors.orange;
      case 'moderate':
        return Colors.amber;
      case 'minor':
        return Colors.greenAccent;
      default:
        return Colors.white;
    }
  }
}