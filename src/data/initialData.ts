import {
  SchoolProfile,
  AcademicPeriod,
  ClassGroup,
  Teacher,
  Student,
  Subject,
  GradeRecord,
  AttendanceRecord,
  ExtracurricularRecord,
  PrintSettings,
} from '../types';

export const initialSchoolProfile: SchoolProfile = {
  id: 'school-muhiba',
  name: 'SMK Muhammadiyah Bawang',
  npsn: '20322744',
  address: 'Jl. Bawang – Sukorejo KM 01, Jlamprang, Bawang',
  postalCode: '51274',
  subdistrict: 'Bawang',
  district: 'Batang',
  city: 'Bawang',
  logoUrl:
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgzWdtCjCcX2chJuhLX_26N5MmkVK-1SkyO7kgXznQQJPQa6_TB_EJzD1WWpztg7yX9RBRE7rGn0t2Z3FdG06mwwT6pQix8t6vnlcOBm_EgGl9z0jeJemJkppP0KIIjkXGksQvaCLh2dz-gOF6a2H213VQBL6Am8Elhmd76OOnphogk-EoTTbkYbg0TQJhv/s512/34690.png',
  headmasterName: 'Imam Pamungkas, S.Pd., M.Si.',
  headmasterNbm: '1102.7909.1069421',
  headmasterSignatureUrl:
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhcA4qnNJ_eBOjVMAGirvBsvRNjip2d1MH7f-Yu5EPG2ZAOIRR5iWj-JJg1aBfk0x9aATxpI7vGBQW8jAOgoiYrfRKdOiUBICUO8AQGI33Dguv3VD8VpBUsBgv4mpEwloQO1lbBNOcuZuE5HZoHGdrXDi3iMkkteETqx-uh3klI8A2LmszPLaa4lQjtC0sv/s688/8249.png',
  showHeadmasterSignature: true,
  headmasterSignatureHeight: 85,
  headmasterSignatureWidth: 230,
  headmasterPhotoUrl: '',
  // Wali Kelas Resmi Data Sekolah
  homeroomTeacherName: 'Mursyidah, S.Pd.',
  homeroomTeacherNip: '19840512 201001 2 018',
  homeroomTeacherSignatureUrl:
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhcA4qnNJ_eBOjVMAGirvBsvRNjip2d1MH7f-Yu5EPG2ZAOIRR5iWj-JJg1aBfk0x9aATxpI7vGBQW8jAOgoiYrfRKdOiUBICUO8AQGI33Dguv3VD8VpBUsBgv4mpEwloQO1lbBNOcuZuE5HZoHGdrXDi3iMkkteETqx-uh3klI8A2LmszPLaa4lQjtC0sv/s688/8249.png',
  homeroomTeacherPhotoUrl: '',
  showHomeroomSignatureImage: true,
  homeroomSignatureHeight: 65,
  homeroomSignatureWidth: 170,
  selectedHomeroomClassId: 'c-1',
  reportDate: '8 Oktober 2026',
  headerLayout: {
    position: 'left',
    logoHeight: 42,
    logoGap: 12,
    showTitle: true,
    customTitle: 'MUHIBA RAPORT',
    customSubtitle: 'SMK Muhammadiyah Bawang',
    showBadge: true,
    badgeText: 'Kurikulum Merdeka',
    secondaryLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png',
    showSecondaryLogo: false,
    secondaryLogoHeight: 40,
    headerTheme: 'vintage-cream',
  },
};

export const initialPeriods: AcademicPeriod[] = [
  {
    id: 'p-2026-ganjil-pts',
    academicYear: '2026-2027',
    semester: 'Ganjil',
    assessmentType: 'PTS',
    reportDate: '8 Oktober 2026',
    isCurrent: true,
  },
  {
    id: 'p-2026-ganjil-pas',
    academicYear: '2026-2027',
    semester: 'Ganjil',
    assessmentType: 'PAS',
    reportDate: '19 Desember 2026',
    isCurrent: false,
  },
  {
    id: 'p-2026-genap-pts',
    academicYear: '2026-2027',
    semester: 'Genap',
    assessmentType: 'PTS',
    reportDate: '15 Maret 2027',
    isCurrent: false,
  },
];

export const initialClasses: ClassGroup[] = [
  {
    id: 'c-x-to-4',
    name: 'X TO 4',
    gradeLevel: 'X',
    major: 'Teknik Otomotif',
    homeroomTeacher: 'Drs. Supriyanto, M.Pd.',
    fase: 'E',
  },
  {
    id: 'c-x-to-1',
    name: 'X TO 1',
    gradeLevel: 'X',
    major: 'Teknik Otomotif',
    homeroomTeacher: 'Siti Aminah, S.Pd.',
    fase: 'E',
  },
  {
    id: 'c-x-tkj-1',
    name: 'X TKJ 1',
    gradeLevel: 'X',
    major: 'Teknik Jaringan Komputer & Telekomunikasi',
    homeroomTeacher: 'Wahyu Hidayat, S.Kom.',
    fase: 'E',
  },
];

export const initialTeachers: Teacher[] = [
  {
    id: 't-1',
    name: 'Imam Pamungkas, S.Pd., M.Si.',
    nipOrNbm: '1102.7909.1069421',
    subjectTaught: 'Kepala Sekolah',
    phone: '081234567890',
  },
  {
    id: 't-2',
    name: 'Drs. Supriyanto, M.Pd.',
    nipOrNbm: '1102.7909.1078120',
    subjectTaught: 'Dasar-Dasar Program Keahlian',
    phone: '081398765432',
  },
  {
    id: 't-3',
    name: 'Muhammad Farhan, S.Pd.I',
    nipOrNbm: '1102.7909.1089332',
    subjectTaught: 'Pendidikan Agama Islam / ISMUBA',
    phone: '081567891234',
  },
  {
    id: 't-4',
    name: 'Nur Hayati, S.Pd.',
    nipOrNbm: '1102.7909.1094561',
    subjectTaught: 'Matematika',
    phone: '082134567812',
  },
  {
    id: 't-5',
    name: 'Tri Wulandari, S.Pd.',
    nipOrNbm: '1102.7909.1065229',
    subjectTaught: 'Bahasa Indonesia',
    phone: '085712345678',
  },
];

export const initialSubjects: Subject[] = [
  // A. KELOMPOK MATA PELAJARAN UMUM
  {
    id: 'sub-pai',
    code: 'PAI',
    name: 'Pendidikan Agama Islam dan Budi Pekerti',
    category: 'A. KELOMPOK MATA PELAJARAN UMUM',
    orderIndex: 1,
    isActive: true,
    defaultCompetencyDesc:
      'Mampu menghafal, melafalkan dan membiasakan diri membaca doa-doa harian dengan baik dan lancar.',
  },
  {
    id: 'sub-pancasila',
    code: 'PPKN',
    name: 'Pendidikan Pancasila',
    category: 'A. KELOMPOK MATA PELAJARAN UMUM',
    orderIndex: 2,
    isActive: true,
    defaultCompetencyDesc:
      'Peserta didik masih perlu meningkatkan kemampuan dalam mengidentifikasi tokoh-tokoh yang berperan dalam perumusan Pancasila.',
  },
  {
    id: 'sub-indo',
    code: 'BIND',
    name: 'Bahasa Indonesia',
    category: 'A. KELOMPOK MATA PELAJARAN UMUM',
    orderIndex: 3,
    isActive: true,
    defaultCompetencyDesc:
      'Peserta didik mampu mengevaluasi informasi, gagasan, dan pandangan dari berbagai tipe teks visual/audiovisual dengan logika berpikir untuk menemukan makna tersurat dan tersirat.',
  },
  {
    id: 'sub-pjok',
    code: 'PJOK',
    name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
    category: 'A. KELOMPOK MATA PELAJARAN UMUM',
    orderIndex: 4,
    isActive: true,
    defaultCompetencyDesc:
      'Peserta didik dapat mempraktikkan dan mengevaluasi hasil aktivitas jasmani seperti permainan olahraga (bola besar dan bola kecil), atletik, senam, serta aktivitas gerak lainnya.',
  },
  {
    id: 'sub-sejarah',
    code: 'SEJ',
    name: 'Sejarah',
    category: 'A. KELOMPOK MATA PELAJARAN UMUM',
    orderIndex: 5,
    isActive: true,
    defaultCompetencyDesc:
      'Perlu ditingkatkan dalam memahami konsep dasar sejarah dan menganalisis peristiwa sejarah indonesia zaman praaksara hingga kerajaan islam.',
  },
  {
    id: 'sub-senbud',
    code: 'SNB',
    name: 'Seni Budaya',
    category: 'A. KELOMPOK MATA PELAJARAN UMUM',
    orderIndex: 6,
    isActive: true,
    defaultCompetencyDesc:
      'Peserta didik mampu memahami unsur poster dan membuat poster digital yang kreatif, menarik, serta komunikatif sesuai tema.',
  },
  {
    id: 'sub-jawa',
    code: 'BJAW',
    name: 'Bahasa Jawa',
    category: 'A. KELOMPOK MATA PELAJARAN UMUM',
    orderIndex: 7,
    isActive: true,
    defaultCompetencyDesc:
      'Peserta didik mampu mengenali isi dan nilai-nilai luhur dalam Serat Wedhatama.',
  },

  // B. KELOMPOK MATA PELAJARAN KEJURUAN
  {
    id: 'sub-mtk',
    code: 'MTK',
    name: 'Matematika',
    category: 'B. KELOMPOK MATA PELAJARAN KEJURUAN',
    orderIndex: 8,
    isActive: true,
    defaultCompetencyDesc:
      'Perlu ditingkatkan dalam menggeneralisasi sifat-sifat bilangan berpangkat (termasuk bilangan pangkat pecahan), dan menggunakannya untuk menyelesaikan masalah.',
  },
  {
    id: 'sub-inggris',
    code: 'BING',
    name: 'Bahasa Inggris',
    category: 'B. KELOMPOK MATA PELAJARAN KEJURUAN',
    orderIndex: 9,
    isActive: true,
    defaultCompetencyDesc:
      'Perlu ditingkatkan dalam memahami dan mempraktikkan teks introduction dengan baik dan benar.',
  },
  {
    id: 'sub-infor',
    code: 'INF',
    name: 'Informatika',
    category: 'B. KELOMPOK MATA PELAJARAN KEJURUAN',
    orderIndex: 10,
    isActive: true,
    defaultCompetencyDesc:
      'Memahami fungsi dasar sistem komputer, pengoperasian aplikasi perkantoran, dan berpikir komputasional dengan baik.',
  },
  {
    id: 'sub-pipas',
    code: 'PIPAS',
    name: 'Projek Ilmu Pengetahuan Alam dan Sosial',
    category: 'B. KELOMPOK MATA PELAJARAN KEJURUAN',
    orderIndex: 11,
    isActive: true,
    defaultCompetencyDesc:
      'Menunjukkan penguasaan yang baik dalam memahami dan menganalisis fenomena-fenomena yang terjadi di lingkungan sekitar dilihat dari aspek makhluk hidup dan lingkungannya.',
  },
  {
    id: 'sub-dpk',
    code: 'DPK',
    name: 'Dasar-Dasar Program Keahlian',
    category: 'B. KELOMPOK MATA PELAJARAN KEJURUAN',
    orderIndex: 12,
    isActive: true,
    defaultCompetencyDesc:
      'Peserta didik mampu menggunakan peralatan dan perlengkapan tempat kerja, antara lain alat-alat tangan dan alat ukur otomotif.',
  },

  // C. KELOMPOK CIRI KHUSUS (ISMUBA)
  {
    id: 'sub-kemuhammadiyahan',
    code: 'KMH',
    name: 'Kemuhammadiyahan',
    category: 'C. KELOMPOK CIRI KHUSUS (ISMUBA)',
    orderIndex: 13,
    isActive: true,
    defaultCompetencyDesc:
      'Mampu melaksanakan sholat dengan bacaan sholat berdasarkan putusan tarjih Muhammadiyah.',
  },
  {
    id: 'sub-ismuba',
    code: 'ISMU',
    name: 'Ciri Khusus (ISMUBA)',
    category: 'C. KELOMPOK CIRI KHUSUS (ISMUBA)',
    orderIndex: 14,
    isActive: true,
    defaultCompetencyDesc:
      'Mampu menghafal, melafalkan dan membiasakan diri membaca doa-doa harian serta surat-surat pendek pilihan dengan baik.',
  },
];

// 35 Students from the authentic Class X TO 4 Excel Leger
const rawStudentNames = [
  'ADHITYA WAHYU PRADANA',
  'AHMAD ASIF FEBRIAN',
  'AHMAD REZA SAPUTRA',
  'AKHMAD NAUFAL FIRMANSYAH',
  'ALFIAN PERMANA NURROHMAN',
  'ANDHIKA PRATAMA',
  'ARDIAN INDRA MAULANA',
  'ATA AUFA RADY APRIYANTO',
  'BIMA RADITYA',
  'DANIAL ARKA ABRIYAM',
  'DZAKWAN ANDHIKHA MUKHARAM',
  'ELAN KHOIRUL ROZIK',
  'ENGGAR RADITYA PRUDANA',
  'FAIZA KHOIRUL FAHRI',
  'FEBLY ANANTA SYAPUTRA',
  'FURQON NAHLI',
  'HAMDANI FANSURI',
  'IBNUNG SEPTIANTO',
  'KHAMDANI NI\'AMULLAH',
  'M. ALIF ZANDANIYAH',
  'MUHAMMAD ANANG MA\'RUF',
  'MUHAMMAD SAFI AL KHAKYA',
  'MUHAMMAD ASYIK FAJAR LABIBUL FUAD',
  'MUHAMMAD HAIKAL AHSAN',
  'MUHAMMAD MUKHNI LABIB',
  'MUHAMMAD RAFLI SETIAWAN',
  'MUHAMMAD ZIDAN HIDAYATULLAH',
  'NAYSIKA PRAMUDYA',
  'RADIT PALZA BAKHTIAR',
  'RAINA ADITYA',
  'REZA ADITYA',
  'RICKY AGUNSTIAN AGUNG',
  'SUBIET ERNANDA',
  'SULAIMAN NADHIFA',
  'ZAHIRAN KARUNA RAMADHAN',
];

export const initialStudents: Student[] = rawStudentNames.map((name, index) => {
  const numStr = String(index + 1).padStart(2, '0');
  const nisNum = 5420 + index + 1;
  const nisnNum = `008451${numStr}${index % 10}`;
  return {
    id: `s-${index + 1}`,
    nis: String(nisNum),
    nisn: nisnNum,
    name: name,
    gender: 'L',
    birthPlace: 'Batang',
    birthDate: `2008-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 25) + 1).padStart(2, '0')}`,
    classId: 'c-x-to-4',
    parentName: `Orang Tua / Wali dari ${name}`,
    status: 'Aktif',
  };
});

// Build initial realistic grades for these 35 students in X TO 4 based on the Excel screenshot
export const initialGrades: GradeRecord[] = [];

// Seed specific patterns based on screenshot data
const baseScorePresets: Record<string, { formative: number; summative: number; desc?: string }[]> = {
  // PAI: mostly 80s
  'sub-pai': [
    { formative: 80, summative: 80 },
    { formative: 81, summative: 86 },
    { formative: 86, summative: 87 },
    { formative: 82, summative: 86 },
    { formative: 83, summative: 86 },
    { formative: 87, summative: 88 },
  ],
  // Pancasila: formative 78-85, summative 18-62
  'sub-pancasila': [
    { formative: 80, summative: 36 },
    { formative: 78, summative: 22 },
    { formative: 80, summative: 32 },
    { formative: 78, summative: 24 },
    { formative: 80, summative: 28 },
    { formative: 80, summative: 50 },
  ],
  // Bahasa Indonesia: formative 75, summative 28-54
  'sub-indo': [
    { formative: 75, summative: 28 },
    { formative: 75, summative: 26 },
    { formative: 75, summative: 30 },
    { formative: 75, summative: 34 },
    { formative: 75, summative: 42 },
    { formative: 75, summative: 52 },
  ],
  // PJOK: formative 85, summative 80
  'sub-pjok': [
    { formative: 85, summative: 80 },
    { formative: 85, summative: 80 },
    { formative: 85, summative: 80 },
    { formative: 85, summative: 80 },
  ],
  // Sejarah: formative 70-75, summative 30-72
  'sub-sejarah': [
    { formative: 70, summative: 50 },
    { formative: 70, summative: 48 },
    { formative: 70, summative: 52 },
    { formative: 75, summative: 40 },
    { formative: 75, summative: 62 },
    { formative: 75, summative: 72 },
  ],
  // Seni Budaya: formative 83, summative 85
  'sub-senbud': [
    { formative: 83, summative: 85 },
    { formative: 83, summative: 85 },
    { formative: 83, summative: 87 },
    { formative: 83, summative: 88 },
    { formative: 83, summative: 85 },
  ],
  // Bahasa Jawa: formative 85, summative 85
  'sub-jawa': [
    { formative: 85, summative: 85 },
    { formative: 85, summative: 85 },
    { formative: 85, summative: 85 },
  ],
  // Matematika: formative 78-85, summative 8-68
  'sub-mtk': [
    { formative: 80, summative: 20 },
    { formative: 80, summative: 8 },
    { formative: 80, summative: 25 },
    { formative: 80, summative: 23 },
    { formative: 80, summative: 40 },
    { formative: 80, summative: 60 },
  ],
  // Bahasa Inggris: formative 78, summative 60-70
  'sub-inggris': [
    { formative: 78, summative: 60 },
    { formative: 78, summative: 60 },
    { formative: 80, summative: 65 },
    { formative: 80, summative: 65 },
    { formative: 78, summative: 70 },
  ],
  // Informatika
  'sub-infor': [
    { formative: 75, summative: 70 },
    { formative: 75, summative: 72 },
    { formative: 78, summative: 75 },
    { formative: 75, summative: 70 },
  ],
  // PIPAS: formative 75, summative 70-84
  'sub-pipas': [
    { formative: 75, summative: 70 },
    { formative: 75, summative: 70 },
    { formative: 75, summative: 70 },
    { formative: 75, summative: 75 },
  ],
  // Dasar-dasar Program Keahlian: formative 77, summative 38-78
  'sub-dpk': [
    { formative: 77, summative: 38 },
    { formative: 77, summative: 75 },
    { formative: 77, summative: 78 },
    { formative: 77, summative: 80 },
    { formative: 77, summative: 82 },
  ],
  // Kemuhammadiyahan
  'sub-kemuhammadiyahan': [
    { formative: 80, summative: 80 },
    { formative: 82, summative: 82 },
    { formative: 80, summative: 80 },
  ],
  // ISMUBA
  'sub-ismuba': [
    { formative: 80, summative: 80 },
    { formative: 80, summative: 80 },
    { formative: 82, summative: 82 },
  ],
};

// Generate grades for all 35 students
initialStudents.forEach((st, sIndex) => {
  initialSubjects.forEach((sub) => {
    const periodId = 'p-2026-ganjil-pts';
    const presets = baseScorePresets[sub.id] || [{ formative: 78, summative: 75 }];
    const picked = presets[sIndex % presets.length];

    // Give slight authentic variation across students
    let formScore = picked.formative;
    let sumScore = picked.summative;

    // Student 1 exact match with image 1
    if (sIndex === 0) {
      if (sub.id === 'sub-pai') { formScore = 80; sumScore = 80; }
      else if (sub.id === 'sub-pancasila') { formScore = 80; sumScore = 36; }
      else if (sub.id === 'sub-indo') { formScore = 75; sumScore = 28; }
      else if (sub.id === 'sub-pjok') { formScore = 85; sumScore = 80; }
      else if (sub.id === 'sub-sejarah') { formScore = 70; sumScore = 50; }
      else if (sub.id === 'sub-senbud') { formScore = 83; sumScore = 85; }
      else if (sub.id === 'sub-jawa') { formScore = 85; sumScore = 85; }
      else if (sub.id === 'sub-mtk') { formScore = 0; sumScore = 20; }
      else if (sub.id === 'sub-inggris') { formScore = 78; sumScore = 60; }
      else if (sub.id === 'sub-infor') { formScore = 0; sumScore = 0; }
      else if (sub.id === 'sub-pipas') { formScore = 75; sumScore = 70; }
      else if (sub.id === 'sub-dpk') { formScore = 77; sumScore = 38; }
      else if (sub.id === 'sub-kemuhammadiyahan') { formScore = 80; sumScore = 80; }
      else if (sub.id === 'sub-ismuba') { formScore = 80; sumScore = 80; }
    } else {
      // Simulate real classroom distribution
      const delta = (sIndex % 5) * 2;
      sumScore = Math.min(95, Math.max(10, sumScore + (sIndex % 2 === 0 ? delta : -delta)));
      if (formScore > 0) {
        formScore = Math.min(95, Math.max(65, formScore + ((sIndex % 3) - 1)));
      }
    }

    initialGrades.push({
      id: `${st.id}_${sub.id}_${periodId}`,
      studentId: st.id,
      subjectId: sub.id,
      periodId: periodId,
      formativeScore: formScore === 0 ? null : formScore,
      summativeScore: sumScore === 0 ? null : sumScore,
      competencyDesc: sub.defaultCompetencyDesc || '',
      updatedAt: new Date().toISOString(),
    });
  });
});

export const initialAttendances: AttendanceRecord[] = initialStudents.map((st, i) => {
  return {
    id: `att-${st.id}-pts`,
    studentId: st.id,
    periodId: 'p-2026-ganjil-pts',
    sick: i === 0 ? 1 : i % 7 === 0 ? 2 : i % 5 === 0 ? 1 : 0,
    permitted: i === 0 ? 0 : i % 9 === 0 ? 1 : 0,
    unexcused: i === 0 ? 1 : i % 11 === 0 ? 1 : 0,
  };
});

export const initialExtracurriculars: ExtracurricularRecord[] = [
  {
    id: 'extra-1-1',
    studentId: 's-1',
    periodId: 'p-2026-ganjil-pts',
    name: 'Hisbul Wathan (HW)',
    predicate: 'Baik',
    description: 'Aktif mengikuti kegiatan kepanduan HW secara tertib dan disiplin.',
  },
  {
    id: 'extra-1-2',
    studentId: 's-1',
    periodId: 'p-2026-ganjil-pts',
    name: 'Tapak Suci Putra Muhammadiyah',
    predicate: 'Sangat Baik',
    description: 'Menunjukkan penguasaan teknik dasar pencak silat dengan semangat tinggi.',
  },
  {
    id: 'extra-1-3',
    studentId: 's-1',
    periodId: 'p-2026-ganjil-pts',
    name: 'Otomotif Club (Muhiba Racing)',
    predicate: 'Baik',
    description: 'Antusias dalam kegiatan praktikum perawatan berkala kendaraan.',
  },
];

export const initialPrintSettings: PrintSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  fontFamily: 'times',
  fontSize: 'compact',
  documentFontSizePt: 8.5,
  showHeadmasterSignature: true,
  showHomeroomSignature: true,
  showParentSignature: true,
  signatureSpacing: 'compact',
  fitToOnePage: true,
  headmasterSignatureHeight: 85,
  headmasterSignatureWidth: 230,
  homeroomSignatureSpaceHeight: 52, // Space lega tanda tangan manual wali kelas
  parentSignatureSpaceHeight: 46,
  colWidthNo: 26,
  colWidthSubject: 195,
  colWidthFormatif: 56,
  colWidthSumatif: 56,
  homeroomSignatureRightOffset: 0,
  identityRightOffset: 0,
  reportHeaderLogoPosition: 'left',
  reportHeaderLogoSize: 52,
  reportHeaderLogoOffsetX: 0,
  reportHeaderLogoOffsetY: 0,
  reportHeaderSecondaryLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png',
  reportHeaderSecondaryLogoSize: 48,
  reportHeaderBorderWidth: 2,
};
