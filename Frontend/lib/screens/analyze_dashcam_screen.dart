
           //    color: Color(0xFF00E676),
          import 'package:flutter/material.dart';
import '../ widgets/analysis_pipeline_card.dart';
import '../ widgets/gps_upload_card.dart';
import '../ widgets/video_upload_card.dart';
           import 'analyses_screen.dart';
           import 'ai_processing_screen.dart';

          class AnalyzeDashcamScreen extends StatefulWidget {
            const AnalyzeDashcamScreen({super.key});

            @override
            State<AnalyzeDashcamScreen> createState() =>
                _AnalyzeDashcamScreenState();
          }

          class _AnalyzeDashcamScreenState
              extends State<AnalyzeDashcamScreen> {

            String? selectedVideo;
            String? selectedGps;

            void _selectVideo() {
              setState(() {
                selectedVideo = 'Road_Footage_01.mp4';
              });
            }

            void _selectGps() {
              setState(() {
                selectedGps = 'GPS_Data_01.csv';
              });
            }

            // void _startAnalysis() {
            //   // Processing screen next
            // }
            // void _startAnalysis() {
            //   Navigator.push(
            //     context,
            //     MaterialPageRoute(
            //       builder: (context) => const AnalysesScreen(),
            //     ),
            //   );
            // }
            void _startAnalysis() {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const AiProcessingScreen(),
                ),
              );
            }

            @override
            Widget build(BuildContext context) {
              return Scaffold(
                backgroundColor: const Color(0xFF06131D),

                // --------------------------------
                // APP BAR
                // --------------------------------

                appBar: AppBar(
                  backgroundColor: const Color(0xFF06131D),
                  elevation: 0,

                  leading: IconButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: Colors.white,
                      size: 19,
                    ),
                  ),

                  title: const Text(
                    'Analyze Dashcam',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),

                // --------------------------------
                // BODY
                // --------------------------------

                body: SafeArea(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(18),

                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [

                        // --------------------------------
                        // HEADER
                        // --------------------------------

                        const Text(
                          'Road Damage Analysis',
                          style: TextStyle(
                            color: Color(0xFF00E676),
                            fontSize: 23,
                            fontWeight: FontWeight.w700,
                          ),
                        ),

                        const SizedBox(height: 7),

                        const Text(
                          'Upload dashcam footage and location data '
                              'to identify and classify road damage.',
                          style: TextStyle(
                            color: Colors.white54,
                            fontSize: 12,
                            height: 1.5,
                          ),
                        ),

                        const SizedBox(height: 25),

                        // --------------------------------
                        // VIDEO
                        // --------------------------------

                        const Text(
                          'Dashcam Footage',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),

                        const SizedBox(height: 9),

                        VideoUploadCard(
                          selectedVideo: selectedVideo,
                          onSelectVideo: _selectVideo,
                        ),

                        const SizedBox(height: 22),

                        // --------------------------------
                        // GPS
                        // --------------------------------

                        const Text(
                          'Location Data',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),

                        const SizedBox(height: 9),

                        GpsUploadCard(
                          selectedGps: selectedGps,
                          onSelectGps: _selectGps,
                        ),

                        const SizedBox(height: 25),

                        // --------------------------------
                        // AI PIPELINE
                        // --------------------------------

                        const AnalysisPipelineCard(),

                        const SizedBox(height: 28),

                        // --------------------------------
                        // START ANALYSIS
                        // --------------------------------

                        SizedBox(
                          width: double.infinity,
                          height: 50,

                          child: ElevatedButton.icon(
                            onPressed:
                            selectedVideo == null
                                ? null
                                : _startAnalysis,

                            icon: const Icon(
                              Icons.play_arrow_rounded,
                              size: 21,
                            ),

                            label: const Text(
                              'Start AI Analysis',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),

                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                              const Color(0xFF00C853),

                              disabledBackgroundColor:
                              const Color(0xFF26342D),

                              foregroundColor:
                              Colors.white,

                              disabledForegroundColor:
                              Colors.white30,

                              elevation: 0,

                              shape:
                              RoundedRectangleBorder(
                                borderRadius:
                                BorderRadius.circular(9),
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 15),
                      ],
                    ),
                  ),
                ),
              );
            }
          }