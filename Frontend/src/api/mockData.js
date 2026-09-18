// Mock Data for RoadSense 1.0 (PARAKRAM 1.0 Hackathon)
// Enables full interactive demo before PostgreSQL / AWS RDS is initialized

export const INITIAL_MOCK_REPORTS = [
  {
    id: "rep-001",
    user_id: "usr-101",
    reporter_name: "Amit Sharma",
    original_filename: "patia_square_pothole.jpg",
    image_mime_type: "image/jpeg",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    description: "Deep severe pothole near the bus stop intersection. Hazardous for two-wheelers especially during evening hours.",
    location: {
      latitude: 20.2961,
      longitude: 85.8245,
    },
    coordinates: [85.8245, 20.2961],
    status: "notStarted",
    detection_count: 2,
    highest_severity: "CRITICAL",
    damage_score: 8.85,
    support_count: 24,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    raw_ai_response: {
      count: 2,
      highest_severity: "CRITICAL",
      damage_score: 8.85,
      model_version: "YOLOv8-Road-v1.0 (best.pt)",
      detections: [
        {
          class: "pothole",
          confidence: 0.942,
          bbox: [180, 240, 260, 160], // [x, y, w, h] normalized or pixel
        },
        {
          class: "alligator_crack",
          confidence: 0.865,
          bbox: [410, 310, 190, 120],
        },
      ],
    },
  },
  {
    id: "rep-002",
    user_id: "usr-102",
    reporter_name: "Priyanka Jena",
    original_filename: "infocity_road_crack.jpg",
    image_mime_type: "image/jpeg",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    description: "Extensive longitudinal and fatigue cracking expanding across the right transit lane.",
    location: {
      latitude: 20.3155,
      longitude: 85.8198,
    },
    coordinates: [85.8198, 20.3155],
    status: "onGoing",
    detection_count: 3,
    highest_severity: "HIGH",
    damage_score: 6.70,
    support_count: 15,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    raw_ai_response: {
      count: 3,
      highest_severity: "HIGH",
      damage_score: 6.70,
      model_version: "YOLOv8-Road-v1.0 (best.pt)",
      detections: [
        {
          class: "longitudinal_crack",
          confidence: 0.912,
          bbox: [120, 180, 420, 90],
        },
        {
          class: "alligator_crack",
          confidence: 0.824,
          bbox: [320, 260, 210, 140],
        },
        {
          class: "surface_raveling",
          confidence: 0.768,
          bbox: [80, 360, 160, 80],
        },
      ],
    },
  },
  {
    id: "rep-003",
    user_id: "usr-103",
    reporter_name: "Debashis Mohanty",
    original_filename: "nh16_rutting_depression.jpg",
    image_mime_type: "image/jpeg",
    image_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80",
    description: "Wheel path rutting and surface displacement on highway ramp leading to water stagnation.",
    location: {
      latitude: 20.2789,
      longitude: 85.8367,
    },
    coordinates: [85.8367, 20.2789],
    status: "notStarted",
    detection_count: 1,
    highest_severity: "MEDIUM",
    damage_score: 4.45,
    support_count: 8,
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
    raw_ai_response: {
      count: 1,
      highest_severity: "MEDIUM",
      damage_score: 4.45,
      model_version: "YOLOv8-Road-v1.0 (best.pt)",
      detections: [
        {
          class: "rutting",
          confidence: 0.884,
          bbox: [200, 220, 340, 180],
        },
      ],
    },
  },
  {
    id: "rep-004",
    user_id: "usr-104",
    reporter_name: "Ananya Mishra",
    original_filename: "master_canteen_asphalt.jpg",
    image_mime_type: "image/jpeg",
    image_url: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80",
    description: "Previously reported pothole repaired by Bhubaneswar Municipal Corporation crew #4.",
    location: {
      latitude: 20.2644,
      longitude: 85.8402,
    },
    coordinates: [85.8402, 20.2644],
    status: "completed",
    detection_count: 0,
    highest_severity: "LOW",
    damage_score: 1.20,
    support_count: 42,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    raw_ai_response: {
      count: 0,
      highest_severity: "LOW",
      damage_score: 1.20,
      model_version: "YOLOv8-Road-v1.0 (best.pt)",
      detections: [],
    },
  },
  {
    id: "rep-005",
    user_id: "usr-101",
    reporter_name: "Amit Sharma",
    original_filename: "kiit_road_multiple_potholes.jpg",
    image_mime_type: "image/jpeg",
    image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    description: "Cluster of multiple potholes forming after monsoon rains near KIIT Campus 6 road.",
    location: {
      latitude: 20.3541,
      longitude: 85.8164,
    },
    coordinates: [85.8164, 20.3541],
    status: "onGoing",
    detection_count: 3,
    highest_severity: "CRITICAL",
    damage_score: 9.10,
    support_count: 31,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    raw_ai_response: {
      count: 3,
      highest_severity: "CRITICAL",
      damage_score: 9.10,
      model_version: "YOLOv8-Road-v1.0 (best.pt)",
      detections: [
        {
          class: "pothole",
          confidence: 0.958,
          bbox: [160, 200, 200, 140],
        },
        {
          class: "pothole",
          confidence: 0.921,
          bbox: [390, 250, 180, 130],
        },
        {
          class: "alligator_crack",
          confidence: 0.873,
          bbox: [220, 320, 280, 100],
        },
      ],
    },
  },
];

export const INITIAL_MOCK_USER = {
  id: "usr-101",
  name: "Amit Sharma",
  email: "amit.sharma@example.com",
  phone: "+91 98765 43210",
  bio: "Civic road safety advocate and daily commuter in Smart City Bhubaneswar.",
  date_of_birth: "1996-04-15",
  occupation: "Civil Engineering Consultant",
  role: "END_USER",
  credit_points: 240,
  is_varified_email: true,
};

export const INITIAL_MOCK_WORKER = {
  id: "wkg-201",
  name: "BMC North Zone Highway Maintenance Team",
  email: "crew-north@bmc.gov.in",
  role: "WORKER_GROUP",
  assigned_count: 5,
};

export const INITIAL_MOCK_ADMIN = {
  id: "adm-301",
  name: "Sashank Sahoo",
  email: "admin@roadsense.gov.in",
  role: "ADMIN",
};

export const INITIAL_MOCK_WORKER_GROUPS = [
  {
    id: "wkg-201",
    name: "BMC North Zone Highway Maintenance Team",
    email: "crew-north@bmc.gov.in",
    role: "WORKER_GROUP",
  },
  {
    id: "wkg-202",
    name: "NHAI Rapid Asphalt Response Unit 3",
    email: "rapid-unit3@nhai.gov.in",
    role: "WORKER_GROUP",
  },
  {
    id: "wkg-203",
    name: "Patia & Chandrasekharpur Repair Squad",
    email: "patia-squad@roads.odisha.gov.in",
    role: "WORKER_GROUP",
  },
];

export const INITIAL_MOCK_USERS_LIST = [
  INITIAL_MOCK_USER,
  {
    id: "usr-102",
    name: "Priyanka Jena",
    email: "priyanka.jena@example.com",
    phone: "+91 94371 88990",
    occupation: "Software Architect",
    role: "END_USER",
    credit_points: 150,
    is_varified_email: true,
  },
  {
    id: "usr-103",
    name: "Debashis Mohanty",
    email: "debashis.m@example.com",
    phone: "+91 98610 11223",
    occupation: "Urban Planner",
    role: "END_USER",
    credit_points: 80,
    is_varified_email: true,
  },
  {
    id: "usr-104",
    name: "Ananya Mishra",
    email: "ananya.mishra@example.com",
    phone: "+91 97780 44556",
    occupation: "Professor",
    role: "END_USER",
    credit_points: 320,
    is_varified_email: true,
  },
];
