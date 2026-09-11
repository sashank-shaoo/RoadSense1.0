import 'package:flutter/material.dart';

class AnalysisPipelineCard extends StatelessWidget {
  const AnalysisPipelineCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFF0A2029),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white10,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          // --------------------------------
          // TITLE
          // --------------------------------

          const Row(
            children: [
              Icon(
                Icons.auto_awesome,
                color: Color(0xFF00E676),
                size: 18,
              ),

              SizedBox(width: 8),

              Text(
                'AI Analysis Pipeline',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 13),

          // --------------------------------
          // STEPS
          // --------------------------------

          _PipelineStep(
            number: '01',
            title: 'Frame Extraction',
          ),

          _PipelineStep(
            number: '02',
            title: 'Road Damage Detection',
          ),

          _PipelineStep(
            number: '03',
            title: 'Severity Classification',
          ),

          _PipelineStep(
            number: '04',
            title: 'GPS Synchronization',
            isLast: true,
          ),
        ],
      ),
    );
  }
}


// --------------------------------------------------
// PIPELINE STEP
// --------------------------------------------------

class _PipelineStep extends StatelessWidget {
  final String number;
  final String title;
  final bool isLast;

  const _PipelineStep({
    required this.number,
    required this.title,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: isLast ? 0 : 10,
      ),
      child: Row(
        children: [

          // Number
          Container(
            width: 25,
            height: 25,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: const Color(0x1400E676),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              number,
              style: const TextStyle(
                color: Color(0xFF00E676),
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          const SizedBox(width: 12),

          // Title
          Text(
            title,
            style: const TextStyle(
              color: Colors.white60,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}