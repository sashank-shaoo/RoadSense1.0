import 'package:flutter/material.dart';

class RestorationUploadCard extends StatelessWidget {
  final VoidCallback onUpload;
  final String? selectedImage;

  const RestorationUploadCard({
    super.key,
    required this.onUpload,
    this.selectedImage,
  });

  @override
  Widget build(BuildContext context) {
    final hasImage = selectedImage != null;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1720),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0x1A00E676),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.add_photo_alternate_outlined,
                  color: Color(0xFF00E676),
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Damaged Road Image',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Upload a road image for AI restoration',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          if (hasImage)
            Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF111E27),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Text(
                      selectedImage!,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.check_circle,
                        color: Color(0xFF00E676),
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            GestureDetector(
              onTap: onUpload,
              child: Container(
                height: 150,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF111E27),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.08),
                  ),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.cloud_upload_outlined,
                      color: Color(0xFF00E676),
                      size: 34,
                    ),
                    SizedBox(height: 10),
                    Text(
                      'Upload Road Image',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      'JPG, PNG • Max 10 MB',
                      style: TextStyle(
                        color: Colors.white38,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 14),

          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton.icon(
              onPressed: onUpload,
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF00E676),
                side: const BorderSide(
                  color: Color(0xFF00E676),
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: Icon(
                hasImage
                    ? Icons.change_circle_outlined
                    : Icons.upload_file_rounded,
                size: 18,
              ),
              label: Text(
                hasImage ? 'Change Image' : 'Choose Image',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}