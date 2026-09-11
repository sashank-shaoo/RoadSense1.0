class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? dateOfBirth;
  final String? occupation;
  final String? bio;
  final String? role;
  final bool? isVerifiedEmail;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.dateOfBirth,
    this.occupation,
    this.bio,
    this.role,
    this.isVerifiedEmail,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      dateOfBirth: json['date_of_birth']?.toString(),
      occupation: json['occupation']?.toString(),
      bio: json['bio']?.toString(),
      role: json['role']?.toString(),
      isVerifiedEmail: json['is_varified_email'] as bool?,
    );
  }
}
