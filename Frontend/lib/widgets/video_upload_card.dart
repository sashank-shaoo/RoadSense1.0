import 'package:flutter/material.dart';

class VideoUploadCard extends StatelessWidget {
  final String? selectedVideo;
  final VoidCallback onSelectVideo;

  const VideoUploadCard({
    super.key,
    required this.selectedVideo,
    required this.onSelectVideo,
  });

  @override
  Widget build(BuildContext context) {
    final bool isSelected = selectedVideo != null;

    return GestureDetector(
      onTap: onSelectVideo,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF0D1C27),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF00E676)
                : Colors.white12,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: const Color(0xFF102C35),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.video_library_outlined,
                color: Color(0xFF00E676),
                size: 29,
              ),
            ),

            const SizedBox(height: 13),

            Text(
              selectedVideo ?? 'Upload Dashcam Video',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 5),

            Text(
              isSelected
                  ? 'Video selected'
                  : 'MP4 • MOV • AVI',
              style: const TextStyle(
                color: Colors.white38,
                fontSize: 10,
              ),
            ),

            const SizedBox(height: 13),

            OutlinedButton(
              onPressed: onSelectVideo,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(
                  color: Color(0xFF00E676),
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                isSelected ? 'Change Video' : 'Select Video',
                style: const TextStyle(
                  color: Color(0xFF00E676),
                  fontSize: 11,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}