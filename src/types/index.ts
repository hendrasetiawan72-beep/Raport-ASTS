export type SubjectCategory =
  | 'A. KELOMPOK MATA PELAJARAN UMUM'
  | 'B. KELOMPOK MATA PELAJARAN KEJURUAN'
  | 'C. KELOMPOK CIRI KHUSUS (ISMUBA)'
  | 'C. KELOMPOK ISMUBA'
  | 'C. KELOMPOK CIRI KHUSUS'
  | string;

export interface HeaderLayoutSettings {
  position: 'left' | 'center' | 'right' | 'dual';
  logoHeight: number; // in px (e.g., 40)
  logoGap: number; // in px (e.g., 12)
  showTitle: boolean;
  customTitle: string;
  customSubtitle: string;
  showBadge: boolean;
  badgeText: string;
  secondaryLogoUrl?: string;
  showSecondaryLogo?: boolean;
  secondaryLogoHeight?: number;
  headerTheme: 'vintage-cream' | 'vintage-sage' | 'vintage-parchment' | 'vintage-clean';
}

export interface SchoolProfile {
  id: string;
  name: string;
  npsn: string;
  address: string;
  postalCode: string;
  subdistrict: string;
  district: string;
  city: string;
  logoUrl: string;
  headmasterName: string;
  headmasterNbm: string;
  headmasterSignatureUrl: string;
  headmasterPhotoUrl?: string;
  showHeadmasterSignature: boolean;
  headmasterSignatureHeight: number; // in pixels (e.g., 85)
  headmasterSignatureWidth: number; // in pixels (e.g., 230)
  // Pengaturan Wali Kelas & TTD Digital Resmi melalui Data Sekolah
  homeroomTeacherName?: string;
  homeroomTeacherNip?: string;
  homeroomTeacherSignatureUrl?: string;
  homeroomTeacherPhotoUrl?: string;
  showHomeroomSignatureImage?: boolean;
  homeroomSignatureHeight?: number; // in pixels (e.g., 65)
  homeroomSignatureWidth?: number; // in pixels (e.g., 160)
  selectedHomeroomClassId?: string;
  // Pengaturan Layout Header Manual
  headerLayout?: HeaderLayoutSettings;
}

export interface AcademicPeriod {
  id: string;
  academicYear: string; // e.g. "2026/2027"
  semester: 'Ganjil' | 'Genap';
  assessmentType: 'PTS' | 'PAS' | 'SAS' | string;
  reportDate: string; // e.g. "8 Oktober 2026"
  isCurrent: boolean;
}

export interface ClassGroup {
  id: string;
  name: string; // e.g. "X TO 4"
  gradeLevel: 'X' | 'XI' | 'XII';
  major: string; // e.g. "Teknik Otomotif"
  homeroomTeacher: string; // e.g. "Wali Kelas X TO 4"
  homeroomTeacherNip?: string;
  homeroomTeacherSignatureUrl?: string;
  homeroomTeacherPhotoUrl?: string;
  fase: 'E' | 'F';
}

export interface Teacher {
  id: string;
  name: string;
  nipOrNbm: string;
  subjectTaught: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  signatureUrl?: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  classId: string;
  parentName: string;
  status: 'Aktif' | 'Mutasi' | 'Lulus';
  photoUrl?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: SubjectCategory;
  orderIndex: number;
  isActive: boolean;
  defaultCompetencyDesc?: string;
}

export interface GradeRecord {
  id: string; // composite `${studentId}_${subjectId}_${periodId}`
  studentId: string;
  subjectId: string;
  periodId: string;
  formativeScore: number | null;
  summativeScore: number | null;
  competencyDesc: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  periodId: string;
  sick: number;
  permitted: number;
  unexcused: number;
}

export interface ExtracurricularRecord {
  id: string;
  studentId: string;
  periodId: string;
  name: string;
  predicate: string; // e.g. "Sangat Baik"
  description?: string;
}

export type RankingMethod = 'competition' | 'dense';

export interface StudentRankSummary {
  studentId: string;
  student: Student;
  totalSummative: number;
  totalFormative: number;
  averageScore: number;
  gradedCount: number;
  totalSubjects: number;
  missingCount: number;
  isComplete: boolean;
  rank: number;
}

export interface PrintSettings {
  paperSize: 'A4' | 'A3' | 'F4';
  orientation: 'portrait' | 'landscape';
  fontFamily: 'times' | 'sans';
  fontSize: 'compact' | 'normal' | 'spacious';
  documentFontSizePt: number; // e.g. 8.5 to 12 pt
  showHeadmasterSignature: boolean;
  showHomeroomSignature: boolean;
  showParentSignature: boolean;
  signatureSpacing: 'compact' | 'normal' | 'tall';
  fitToOnePage: boolean;
  headmasterSignatureHeight: number;
  headmasterSignatureWidth: number;
  // Manual layout customization for columns and signatures
  homeroomSignatureSpaceHeight?: number; // Space tinggi tanda tangan wali kelas (px)
  parentSignatureSpaceHeight?: number; // Space tinggi tanda tangan orang tua (px)
  colWidthNo?: number; // Lebar kolom NO (px)
  colWidthSubject?: number; // Lebar kolom Mata Pelajaran (px)
  colWidthFormatif?: number; // Lebar kolom Nilai Formatif (px)
  colWidthSumatif?: number; // Lebar kolom Nilai Sumatif (px)
  homeroomSignatureRightOffset?: number; // Offset posisi tanda tangan wali kelas (px)
  identityRightOffset?: number; // Offset posisi identitas semester/kelas/fase (px)
}

export interface LegerParseResult {
  success: boolean;
  studentsToUpsert: Omit<Student, 'id'>[];
  gradesToUpsert: {
    studentName: string;
    studentNis: string;
    subjectId: string;
    formativeScore: number | null;
    summativeScore: number | null;
    competencyDesc: string;
  }[];
  attendancesToUpsert: {
    studentName: string;
    studentNis: string;
    sick: number;
    permitted: number;
    unexcused: number;
  }[];
  extracurricularsToUpsert: {
    studentName: string;
    studentNis: string;
    name: string;
    predicate: string;
    description?: string;
  }[];
  studentCount: number;
  gradeCount: number;
  attendanceCount: number;
  extracurricularCount: number;
  detectedSubjects: string[];
  detectedWaliKelas?: string;
  detectedReportDate?: string;
  message: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}
