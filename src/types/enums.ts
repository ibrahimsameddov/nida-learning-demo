export enum UserRole {
  Student = "student",
  Teacher = "teacher",
  Parent  = "parent",
}

export enum GradeLevel {
  Grade9  = "GRADE_9",
  Grade10 = "GRADE_10",
  Grade11 = "GRADE_11",
}

export enum ForeignLanguage {
  English = "ENGLISH",
  Russian = "RUSSIAN",
  French  = "FRENCH",
  German  = "GERMAN",
}

export enum NotificationType {
  Result       = "result",
  Exam         = "exam",
  Group        = "group",
  GroupMessage = "GROUP_MESSAGE",
  Permission   = "permission",
}

export enum PermissionStatus {
  Pending  = "PENDING",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
  Revoked  = "REVOKED",
}

export enum ColorMode {
  Dark  = "dark",
  Light = "light",
}
