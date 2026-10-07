import * as XLSX from 'xlsx';
import {
  Student,
  Subject,
  GradeRecord,
  ClassGroup,
  AcademicPeriod,
  StudentRankSummary,
  AttendanceRecord,
  ExtracurricularRecord,
  LegerParseResult,
} from '../types';

/**
 * Generates and downloads the full class Leger in Excel format matching the official structure.
 */
export function exportClassLegerToExcel(
  schoolName: string,
  classGroup: ClassGroup,
  period: AcademicPeriod,
  students: Student[],
  subjects: Subject[],
  grades: GradeRecord[],
  rankSummaries: StudentRankSummary[],
  attendances: AttendanceRecord[] = [],
  extracurriculars: ExtracurricularRecord[] = []
) {
  const wb = XLSX.utils.book_new();

  const rankMap = new Map<string, StudentRankSummary>();
  rankSummaries.forEach((r) => rankMap.set(r.studentId, r));

  const attMap = new Map<string, AttendanceRecord>();
  attendances.forEach((a) => {
    if (a.periodId === period.id) {
      attMap.set(a.studentId, a);
    }
  });

  const extraMap = new Map<string, ExtracurricularRecord[]>();
  extracurriculars.forEach((e) => {
    if (e.periodId === period.id) {
      const list = extraMap.get(e.studentId) || [];
      list.push(e);
      extraMap.set(e.studentId, list);
    }
  });

  const activeSubjects = subjects.filter((s) => s.isActive);

  // Build rows
  const rows: any[][] = [];

  // Title rows
  rows.push([`LEGER NILAI SISWA — ${schoolName.toUpperCase()}`]);
  rows.push([
    `Kelas: ${classGroup.name}`,
    `Fase: ${classGroup.fase}`,
    `Tahun Pelajaran: ${period.academicYear}`,
    `Semester: ${period.semester}`,
    `Penilaian: ${period.assessmentType}`,
    `Wali Kelas: ${classGroup.homeroomTeacher}`,
  ]);
  rows.push([]); // blank

  // Header row 1 (Subject groups / titles)
  const headerRow1: string[] = ['NO', 'Nama peserta didik', 'NIS', 'NISN', 'Kelas', 'Fase'];
  activeSubjects.forEach((sub) => {
    headerRow1.push(sub.name, '', '');
  });
  headerRow1.push('Rata-rata', 'Mapel Terisi', 'Belum Lengkap', 'Peringkat');
  headerRow1.push('Kehadiran', '', '', 'Ekstrakurikuler 1', '', 'Ekstrakurikuler 2', '');
  rows.push(headerRow1);

  // Header row 2 (Sub-headers)
  const headerRow2: string[] = ['', '', '', '', '', ''];
  activeSubjects.forEach(() => {
    headerRow2.push('Formatif', 'Sumatif', 'Capaian Kompetensi');
  });
  headerRow2.push('', '', '', '');
  headerRow2.push('Sakit', 'Izin', 'Alpa', 'Nama Kegiatan', 'Predikat', 'Nama Kegiatan', 'Predikat');
  rows.push(headerRow2);

  // Data rows
  students.forEach((st, idx) => {
    const summary = rankMap.get(st.id);
    const studentAtt = attMap.get(st.id);
    const studentExtras = extraMap.get(st.id) || [];
    const extra1 = studentExtras[0];
    const extra2 = studentExtras[1];

    const row: any[] = [
      idx + 1,
      st.name,
      st.nis,
      st.nisn,
      classGroup.name,
      classGroup.fase,
    ];

    activeSubjects.forEach((sub) => {
      const g = grades.find(
        (grade) =>
          grade.studentId === st.id &&
          grade.subjectId === sub.id &&
          grade.periodId === period.id
      );
      row.push(
        g && typeof g.formativeScore === 'number' ? g.formativeScore : '',
        g && typeof g.summativeScore === 'number' ? g.summativeScore : '',
        g && g.competencyDesc ? g.competencyDesc : ''
      );
    });

    row.push(
      summary ? summary.averageScore : '',
      summary ? summary.gradedCount : '',
      summary ? summary.missingCount : '',
      summary && summary.rank > 0 ? summary.rank : '—'
    );

    // Kehadiran (Sakit, Izin, Alpa)
    row.push(
      studentAtt ? studentAtt.sick : 0,
      studentAtt ? studentAtt.permitted : 0,
      studentAtt ? studentAtt.unexcused : 0
    );

    // Ekstrakurikuler (Ekstra 1, Predikat 1, Ekstra 2, Predikat 2)
    row.push(
      extra1?.name || '',
      extra1?.predicate || '',
      extra2?.name || '',
      extra2?.predicate || ''
    );

    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Merge headers for subjects (3 columns per subject)
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 + activeSubjects.length * 3 + 10 } }, // Title
  ];

  let colIdx = 6;
  activeSubjects.forEach(() => {
    merges.push({
      s: { r: 3, c: colIdx },
      e: { r: 3, c: colIdx + 2 },
    });
    colIdx += 3;
  });

  // Merges for Kehadiran (3 cols) & Ekstra (2 cols each)
  const attStartCol = 6 + activeSubjects.length * 3 + 4;
  merges.push({ s: { r: 3, c: attStartCol }, e: { r: 3, c: attStartCol + 2 } });
  merges.push({ s: { r: 3, c: attStartCol + 3 }, e: { r: 3, c: attStartCol + 4 } });
  merges.push({ s: { r: 3, c: attStartCol + 5 }, e: { r: 3, c: attStartCol + 6 } });

  ws['!merges'] = merges;

  // Set column widths
  const colWidths: { wch: number }[] = [
    { wch: 5 }, // NO
    { wch: 32 }, // Nama
    { wch: 10 }, // NIS
    { wch: 14 }, // NISN
    { wch: 10 }, // Kelas
    { wch: 8 }, // Fase
  ];

  activeSubjects.forEach(() => {
    colWidths.push({ wch: 10 }, { wch: 10 }, { wch: 35 });
  });
  colWidths.push({ wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 10 });
  // Kehadiran (S, I, A)
  colWidths.push({ wch: 8 }, { wch: 8 }, { wch: 8 });
  // Ekstrakurikuler (Nama 1, Predikat 1, Nama 2, Predikat 2)
  colWidths.push({ wch: 22 }, { wch: 14 }, { wch: 22 }, { wch: 14 });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'LEGER');
  const fileName = `LEGER_${classGroup.name.replace(/\s+/g, '_')}_${period.academicYear.replace('/', '-')}_${period.semester}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports class rankings table to Excel.
 */
export function exportRankingToExcel(
  schoolName: string,
  className: string,
  period: AcademicPeriod,
  rankings: StudentRankSummary[]
) {
  const wb = XLSX.utils.book_new();
  const rows: any[][] = [];

  rows.push([`REKAP PERINGKAT KELAS — ${schoolName.toUpperCase()}`]);
  rows.push([`Kelas: ${className} | Semester: ${period.semester} | TP: ${period.academicYear} | Penilaian: ${period.assessmentType}`]);
  rows.push([]);
  rows.push(['Peringkat', 'NIS', 'NISN', 'Nama Peserta Didik', 'Nilai Rata-rata', 'Total Nilai Sumatif', 'Mapel Terisi', 'Status']);

  rankings.forEach((r) => {
    rows.push([
      r.rank > 0 ? r.rank : 'Belum Lengkap',
      r.student.nis,
      r.student.nisn,
      r.student.name,
      r.averageScore,
      r.totalSummative,
      `${r.gradedCount} / ${r.totalSubjects}`,
      r.isComplete ? 'Lengkap' : `${r.missingCount} Mapel Kosong`,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 32 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Peringkat');
  XLSX.writeFile(wb, `PERINGKAT_${className.replace(/\s+/g, '_')}_${period.semester}.xlsx`);
}

/**
 * Downloads a template for importing student data.
 */
export function downloadStudentTemplate() {
  const wb = XLSX.utils.book_new();
  const headers = [
    'NIS',
    'NISN',
    'Nama Lengkap',
    'Jenis Kelamin (L/P)',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Nama Orang Tua / Wali',
    'Status (Aktif/Mutasi/Lulus)',
  ];

  const sampleRows = [
    headers,
    ['5421', '0084510101', 'ADHITYA WAHYU PRADANA', 'L', 'Batang', '2008-05-12', 'Bambang Sudarsono', 'Aktif'],
    ['5422', '0084510102', 'AHMAD ASIF FEBRIAN', 'L', 'Batang', '2008-08-20', 'Siti Rahmawati', 'Aktif'],
    ['5423', '0084510103', 'AHMAD REZA SAPUTRA', 'L', 'Batang', '2008-11-04', 'Agus Prayitno', 'Aktif'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleRows);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 30 },
    { wch: 20 },
    { wch: 16 },
    { wch: 25 },
    { wch: 25 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template_Siswa');
  XLSX.writeFile(wb, 'Template_Import_Siswa_Muhiba.xlsx');
}

export type { LegerParseResult };

/**
 * Downloads a ready-to-use template specifically formatted for Leger Nilai.
 */
export function downloadLegerTemplate(
  schoolName: string,
  classGroup: ClassGroup,
  period: AcademicPeriod,
  subjects: Subject[]
) {
  const wb = XLSX.utils.book_new();
  const activeSubjects = subjects.filter((s) => s.isActive);

  const rows: any[][] = [];
  rows.push([`LEGER NILAI SISWA — ${schoolName.toUpperCase()}`]);
  rows.push([
    `Kelas: ${classGroup.name}`,
    `Fase: ${classGroup.fase}`,
    `Tahun Pelajaran: ${period.academicYear}`,
    `Semester: ${period.semester}`,
    `Penilaian: ${period.assessmentType}`,
    `Wali Kelas: ${classGroup.homeroomTeacher}`,
  ]);
  rows.push([]);

  // Header 1
  const headerRow1: string[] = ['NO', 'Nama peserta didik', 'NIS', 'NISN', 'Kelas', 'Fase'];
  activeSubjects.forEach((sub) => {
    headerRow1.push(sub.name, '', '');
  });
  headerRow1.push('Rata-rata', 'Mapel Terisi', 'Belum Lengkap', 'Peringkat');
  headerRow1.push('Kehadiran', '', '', 'Ekstrakurikuler 1', '', 'Ekstrakurikuler 2', '');
  rows.push(headerRow1);

  // Header 2
  const headerRow2: string[] = ['', '', '', '', '', ''];
  activeSubjects.forEach(() => {
    headerRow2.push('Formatif', 'Sumatif', 'Capaian Kompetensi');
  });
  headerRow2.push('', '', '', '');
  headerRow2.push('Sakit', 'Izin', 'Alpa', 'Nama Kegiatan', 'Predikat', 'Nama Kegiatan', 'Predikat');
  rows.push(headerRow2);

  // Sample student rows
  const sampleStudents = [
    {
      no: 1,
      name: 'ACHMAD KURNIAWAN',
      nis: '5421',
      nisn: '0081234567',
      sick: 0,
      perm: 1,
      unex: 0,
      extra1: 'Hisbul Wathan (HW)',
      pred1: 'Baik',
      extra2: 'Tapak Suci',
      pred2: 'Sangat Baik',
    },
    {
      no: 2,
      name: 'BAGAS DWI SAPUTRA',
      nis: '5422',
      nisn: '0081234568',
      sick: 2,
      perm: 0,
      unex: 0,
      extra1: 'Hisbul Wathan (HW)',
      pred1: 'Baik',
      extra2: 'PMR / UKS',
      pred2: 'Baik',
    },
    {
      no: 3,
      name: 'CANDRA ADI PRASETYO',
      nis: '5423',
      nisn: '0081234569',
      sick: 0,
      perm: 0,
      unex: 0,
      extra1: 'Hisbul Wathan (HW)',
      pred1: 'Sangat Baik',
      extra2: 'Sepak Bola / Futsal',
      pred2: 'Baik',
    },
  ];

  sampleStudents.forEach((st) => {
    const row: any[] = [st.no, st.name, st.nis, st.nisn, classGroup.name, classGroup.fase];
    activeSubjects.forEach(() => {
      row.push(80, 85, 'Menunjukkan pemahaman materi dengan baik');
    });
    row.push(82.5, activeSubjects.length, 0, st.no);
    row.push(st.sick, st.perm, st.unex, st.extra1, st.pred1, st.extra2, st.pred2);
    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 + activeSubjects.length * 3 + 10 } },
  ];

  let colIdx = 6;
  activeSubjects.forEach(() => {
    merges.push({
      s: { r: 3, c: colIdx },
      e: { r: 3, c: colIdx + 2 },
    });
    colIdx += 3;
  });

  const attCol = 6 + activeSubjects.length * 3 + 4;
  merges.push({ s: { r: 3, c: attCol }, e: { r: 3, c: attCol + 2 } });
  merges.push({ s: { r: 3, c: attCol + 3 }, e: { r: 3, c: attCol + 4 } });
  merges.push({ s: { r: 3, c: attCol + 5 }, e: { r: 3, c: attCol + 6 } });

  ws['!merges'] = merges;
  XLSX.utils.book_append_sheet(wb, ws, 'LEGER');
  XLSX.writeFile(wb, `Template_Leger_${classGroup.name.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Specifically parses official Leger Excel files (e.g. FORMAT_RAPORT__X-1.xlsx).
 * Automatically extracts students, subjects, formative, summative, competency descriptions,
 * attendance (Kehadiran: S, I, A), and extracurricular activities (Ekstra).
 */
export function parseLegerExcel(
  fileData: ArrayBuffer,
  targetClassId: string,
  targetPeriodId: string,
  existingSubjects: Subject[]
): LegerParseResult {
  try {
    const wb = XLSX.read(fileData, { type: 'array' });

    // 1. Check for dedicated sheets for attendance and extracurriculars
    const attMapFromDedicatedSheet = new Map<
      string,
      { sick: number; permitted: number; unexcused: number }
    >();
    const extraListFromDedicatedSheet = new Map<
      string,
      Array<{ name: string; predicate: string; description?: string }>
    >();

    const attSheetName = wb.SheetNames.find(
      (s) =>
        s.toLowerCase().includes('kehadiran') ||
        s.toLowerCase().includes('presensi') ||
        s.toLowerCase().includes('absensi') ||
        s.toLowerCase().includes('ketidakhadiran')
    );

    if (attSheetName && wb.Sheets[attSheetName]) {
      const attRows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[attSheetName], {
        header: 1,
        defval: '',
      });
      // Scan for header row
      let sCol = -1;
      let iCol = -1;
      let aCol = -1;
      let nameCol = 1;
      let nisCol = 2;

      for (let r = 0; r < Math.min(10, attRows.length); r++) {
        const row = attRows[r];
        row.forEach((cell, c) => {
          const txt = String(cell).toLowerCase().trim();
          if (txt.includes('nama')) nameCol = c;
          if (txt.includes('nis') && !txt.includes('nisn')) nisCol = c;
          if (txt === 's' || txt.includes('sakit')) sCol = c;
          if (txt === 'i' || txt.includes('izin')) iCol = c;
          if (txt === 'a' || txt.includes('alpa') || txt.includes('tanpa')) aCol = c;
        });
        if (sCol !== -1 && iCol !== -1) break;
      }

      for (let r = 2; r < attRows.length; r++) {
        const row = attRows[r];
        const rawName = String(row[nameCol] || '').trim().toUpperCase();
        const rawNis = String(row[nisCol] || '').trim();
        if (rawName && !rawName.includes('TOTAL') && !rawName.includes('RATA')) {
          const sick = sCol !== -1 && !isNaN(parseInt(row[sCol])) ? parseInt(row[sCol]) : 0;
          const permitted = iCol !== -1 && !isNaN(parseInt(row[iCol])) ? parseInt(row[iCol]) : 0;
          const unexcused = aCol !== -1 && !isNaN(parseInt(row[aCol])) ? parseInt(row[aCol]) : 0;
          const data = { sick, permitted, unexcused };
          if (rawNis) attMapFromDedicatedSheet.set(rawNis, data);
          attMapFromDedicatedSheet.set(rawName, data);
        }
      }
    }

    const extraSheetName = wb.SheetNames.find(
      (s) =>
        s.toLowerCase().includes('ekstra') ||
        s.toLowerCase().includes('ekskul') ||
        s.toLowerCase().includes('ekstrakurikuler') ||
        s.toLowerCase().includes('kegiatan')
    );

    if (extraSheetName && wb.Sheets[extraSheetName]) {
      const extraRows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[extraSheetName], {
        header: 1,
        defval: '',
      });
      let nameCol = 1;
      let nisCol = 2;
      let ex1Col = -1;
      let pred1Col = -1;
      let desc1Col = -1;

      for (let r = 0; r < Math.min(10, extraRows.length); r++) {
        const row = extraRows[r];
        row.forEach((cell, c) => {
          const txt = String(cell).toLowerCase().trim();
          if (txt.includes('nama peserta') || txt === 'nama') nameCol = c;
          if (txt.includes('nis') && !txt.includes('nisn')) nisCol = c;
          if (txt.includes('kegiatan') || txt.includes('ekstra')) {
            if (ex1Col === -1) ex1Col = c;
          }
          if (txt.includes('predikat') || txt.includes('nilai')) {
            if (pred1Col === -1) pred1Col = c;
          }
          if (txt.includes('keterangan')) {
            if (desc1Col === -1) desc1Col = c;
          }
        });
      }

      for (let r = 2; r < extraRows.length; r++) {
        const row = extraRows[r];
        const rawName = String(row[nameCol] || '').trim().toUpperCase();
        const rawNis = String(row[nisCol] || '').trim();
        if (rawName && !rawName.includes('TOTAL') && !rawName.includes('RATA')) {
          const extraName = ex1Col !== -1 ? String(row[ex1Col] || '').trim() : '';
          const extraPred = pred1Col !== -1 ? String(row[pred1Col] || '').trim() : 'Baik';
          const extraDesc = desc1Col !== -1 ? String(row[desc1Col] || '').trim() : '';

          if (extraName && extraName !== '-' && extraName !== '—') {
            const list = [
              {
                name: extraName,
                predicate: extraPred || 'Baik',
                description:
                  extraDesc ||
                  `Aktif mengikuti kegiatan ekstrakurikuler ${extraName} dengan predikat ${extraPred || 'Baik'}.`,
              },
            ];
            if (rawNis) extraListFromDedicatedSheet.set(rawNis, list);
            extraListFromDedicatedSheet.set(rawName, list);
          }
        }
      }
    }

    // 2. Main LEGER Sheet
    let targetSheetName = wb.SheetNames[0];
    const legerSheet = wb.SheetNames.find((s) => s.toLowerCase().includes('leger'));
    if (legerSheet) {
      targetSheetName = legerSheet;
    }

    const ws = wb.Sheets[targetSheetName];
    if (!ws) {
      return {
        success: false,
        studentsToUpsert: [],
        gradesToUpsert: [],
        attendancesToUpsert: [],
        extracurricularsToUpsert: [],
        studentCount: 0,
        gradeCount: 0,
        attendanceCount: 0,
        extracurricularCount: 0,
        detectedSubjects: [],
        message: 'Lembar kerja (sheet) tidak ditemukan.',
      };
    }

    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (rows.length < 5) {
      return {
        success: false,
        studentsToUpsert: [],
        gradesToUpsert: [],
        attendancesToUpsert: [],
        extracurricularsToUpsert: [],
        studentCount: 0,
        gradeCount: 0,
        attendanceCount: 0,
        extracurricularCount: 0,
        detectedSubjects: [],
        message: 'File tidak memiliki baris data yang cukup untuk format leger.',
      };
    }

    // Find header rows
    let subjectHeaderRowIdx = -1;
    let subColHeaderRowIdx = -1;
    let studentDataStartRowIdx = -1;

    for (let r = 0; r < Math.min(15, rows.length); r++) {
      const rowStr = rows[r].map((c) => String(c).toLowerCase()).join(' ');
      if (
        (rowStr.includes('pendidikan agama') ||
          rowStr.includes('matematika') ||
          rowStr.includes('pancasila')) &&
        subjectHeaderRowIdx === -1
      ) {
        subjectHeaderRowIdx = r;
      }
      if (
        (rowStr.includes('formatif') ||
          rowStr.includes('sumatif') ||
          rowStr.includes('capaian')) &&
        subColHeaderRowIdx === -1
      ) {
        subColHeaderRowIdx = r;
      }
      if (
        r > 3 &&
        typeof rows[r][0] === 'number' &&
        String(rows[r][1]).trim().length > 3 &&
        studentDataStartRowIdx === -1
      ) {
        studentDataStartRowIdx = r;
      }
    }

    if (subColHeaderRowIdx === -1 && subjectHeaderRowIdx !== -1) {
      subColHeaderRowIdx = subjectHeaderRowIdx + 1;
    }
    if (studentDataStartRowIdx === -1) {
      studentDataStartRowIdx = Math.max(subColHeaderRowIdx + 1, 6);
    }

    // Map column indices to subjects
    const activeSubjects = existingSubjects.filter((s) => s.isActive);
    interface SubjectColMap {
      subject: Subject;
      formativeCol: number;
      summativeCol: number;
      capaianCol: number;
    }
    const subjectMappings: SubjectColMap[] = [];
    const detectedSubjectNames: string[] = [];

    if (subjectHeaderRowIdx !== -1) {
      const subjRow = rows[subjectHeaderRowIdx];
      for (let c = 5; c < subjRow.length; c++) {
        const headerText = String(subjRow[c] || '').trim();
        if (headerText) {
          const match = activeSubjects.find((s) => {
            const hLow = headerText.toLowerCase();
            const sLow = s.name.toLowerCase();
            return (
              hLow === sLow ||
              hLow.includes(sLow) ||
              sLow.includes(hLow) ||
              (hLow.includes('agama') && sLow.includes('agama')) ||
              (hLow.includes('pancasila') && sLow.includes('pancasila')) ||
              (hLow.includes('indonesia') && sLow.includes('indonesia')) ||
              (hLow.includes('jasmani') && sLow.includes('jasmani')) ||
              (hLow.includes('sejarah') && sLow.includes('sejarah')) ||
              (hLow.includes('seni') && sLow.includes('seni')) ||
              (hLow.includes('jawa') && sLow.includes('jawa')) ||
              (hLow.includes('matematika') && sLow.includes('matematika')) ||
              (hLow.includes('inggris') && sLow.includes('inggris')) ||
              (hLow.includes('informatika') && sLow.includes('informatika')) ||
              (hLow.includes('alam dan sosial') && sLow.includes('alam dan sosial')) ||
              (hLow.includes('keahlian') && sLow.includes('keahlian')) ||
              ((hLow.includes('kemuhammadiyahan') || hLow.includes('kmh')) &&
                (sLow.includes('kemuhammadiyahan') || s.code.toLowerCase() === 'kmh')) ||
              ((hLow.includes('ciri khusus') ||
                hLow.includes('ismuba') ||
                hLow.includes('muatan ciri')) &&
                (sLow.includes('ciri khusus') ||
                  sLow.includes('ismuba') ||
                  s.code.toLowerCase() === 'ismu' ||
                  s.code.toLowerCase() === 'ciri')) ||
              (Boolean(s.code) && s.code.toLowerCase() === hLow)
            );
          });

          if (match && !subjectMappings.some((m) => m.subject.id === match.id)) {
            subjectMappings.push({
              subject: match,
              formativeCol: c,
              summativeCol: c + 1,
              capaianCol: c + 2,
            });
            detectedSubjectNames.push(match.name);
          }
        }
      }
    }

    if (subjectMappings.length < 5) {
      subjectMappings.length = 0;
      detectedSubjectNames.length = 0;
      let startCol = 5;
      activeSubjects.forEach((sub) => {
        if (startCol + 2 < (rows[studentDataStartRowIdx]?.length || 100)) {
          subjectMappings.push({
            subject: sub,
            formativeCol: startCol,
            summativeCol: startCol + 1,
            capaianCol: startCol + 2,
          });
          detectedSubjectNames.push(sub.name);
          startCol += 3;
        }
      });
    }

    // 3. Detect Attendance & Extracurricular Columns on the Main Sheet
    let mainSickCol = -1;
    let mainPermittedCol = -1;
    let mainUnexcusedCol = -1;
    let mainDateCol = -1;
    let mainWaliCol = -1;

    // Extracurricular column pairs on main sheet (support both paired name/predicate or numbered columns 1, 2, 3)
    interface ExtraColPair {
      nameCol: number;
      predCol: number;
      label?: string;
    }
    const mainExtraCols: ExtraColPair[] = [];

    const headerSearchEnd = Math.max(subjectHeaderRowIdx + 3, 8);
    for (let r = 0; r < Math.min(headerSearchEnd, rows.length); r++) {
      const row = rows[r];
      row.forEach((cellVal, c) => {
        const text = String(cellVal || '').trim().toLowerCase();

        // Attendance headers (support 'ijin' as well as 'izin', 'tanpa keterangan' as well as 'alpa')
        if (text === 's' || text === 'sakit' || text.includes('(s)')) {
          if (mainSickCol === -1) mainSickCol = c;
        }
        if (text === 'i' || text === 'ijin' || text === 'izin' || text.includes('(i)') || text.includes('(ij)')) {
          if (mainPermittedCol === -1) mainPermittedCol = c;
        }
        if (
          text === 'a' ||
          text === 'alpa' ||
          text.includes('tanpa ket') ||
          text.includes('tanpa keterangan') ||
          text.includes('(a)') ||
          text === 'tk'
        ) {
          if (mainUnexcusedCol === -1) mainUnexcusedCol = c;
        }

        // Tanggal Raport & Wali Kelas
        if (text.includes('tanggal raport') || text.includes('tgl raport') || text.includes('tanggal rapor')) {
          if (mainDateCol === -1) mainDateCol = c;
        }
        if (text.includes('wali kelas') || text === 'wali' || text.includes('walikelas')) {
          if (mainWaliCol === -1) mainWaliCol = c;
        }

        // Extracurricular headers (Ektra or Ekstra or Ekskul)
        if (
          text.includes('ektra') ||
          text.includes('ekstra') ||
          text.includes('ekskul') ||
          text.includes('ekstrakurikuler')
        ) {
          // Check if row below or next columns has 1, 2, 3
          const nextRow = rows[r + 1];
          if (nextRow && (String(nextRow[c]).trim() === '1' || String(nextRow[c + 1]).trim() === '2')) {
            // Columns c, c+1, c+2 are Ekstra 1, 2, 3
            if (!mainExtraCols.some((p) => p.nameCol === c)) {
              mainExtraCols.push({ nameCol: c, predCol: -1, label: 'Ekstrakurikuler 1' });
            }
            if (nextRow[c + 1] !== undefined && !mainExtraCols.some((p) => p.nameCol === c + 1)) {
              mainExtraCols.push({ nameCol: c + 1, predCol: -1, label: 'Ekstrakurikuler 2' });
            }
            if (nextRow[c + 2] !== undefined && !mainExtraCols.some((p) => p.nameCol === c + 2)) {
              mainExtraCols.push({ nameCol: c + 2, predCol: -1, label: 'Ekstrakurikuler 3' });
            }
          } else {
            // Check if adjacent column is predikat/nilai
            const nextCell = String(row[c + 1] || '').trim().toLowerCase();
            if (nextCell.includes('predikat') || nextCell.includes('nilai')) {
              if (!mainExtraCols.some((p) => p.nameCol === c)) {
                mainExtraCols.push({ nameCol: c, predCol: c + 1 });
              }
            } else if (!mainExtraCols.some((p) => p.nameCol === c)) {
              mainExtraCols.push({ nameCol: c, predCol: -1 });
            }
          }
        }
      });
    }

    // Direct fallback for FORMAT_RAPORT__X-1 structure if headers were merged
    if (mainSickCol === -1 && rows[4] && rows[5]) {
      // Check row 4 & 5 directly
      for (let c = 40; c < Math.min(65, (rows[5]?.length || 0)); c++) {
        const val5 = String(rows[5]?.[c] || '').toLowerCase().trim();
        const val4 = String(rows[4]?.[c] || '').toLowerCase().trim();
        if (val5 === 'sakit' || val4.includes('sakit')) mainSickCol = c;
        if (val5 === 'ijin' || val5 === 'izin' || val4.includes('ijin') || val4.includes('izin')) mainPermittedCol = c;
        if (val5.includes('tanpa') || val4.includes('tanpa')) mainUnexcusedCol = c;
        if (val5.includes('tanggal') || val4.includes('tanggal')) mainDateCol = c;
        if (val5.includes('wali') || val4.includes('wali')) mainWaliCol = c;
      }
    }

    let detectedWaliKelasVal = '';
    let detectedReportDateVal = '';

    const studentsToUpsert: Omit<Student, 'id'>[] = [];
    const gradesToUpsert: {
      studentName: string;
      studentNis: string;
      subjectId: string;
      formativeScore: number | null;
      summativeScore: number | null;
      competencyDesc: string;
    }[] = [];
    const attendancesToUpsert: {
      studentName: string;
      studentNis: string;
      sick: number;
      permitted: number;
      unexcused: number;
    }[] = [];
    const extracurricularsToUpsert: {
      studentName: string;
      studentNis: string;
      name: string;
      predicate: string;
      description?: string;
    }[] = [];

    // Extract students, grades, attendance, and extracurriculars
    for (let r = studentDataStartRowIdx; r < rows.length; r++) {
      const row = rows[r];
      const rawName = String(row[1] || '').trim();
      if (
        !rawName ||
        rawName.toLowerCase().includes('rata') ||
        rawName.toLowerCase().includes('total') ||
        rawName.toLowerCase().includes('mengetahui') ||
        rawName.toLowerCase().startsWith('nip')
      ) {
        continue;
      }

      const stName = rawName.toUpperCase();
      const stNis = String(row[2] || 5400 + r).trim();
      const stNisn = String(row[3] || '').trim();

      // Detect wali kelas and date from row if available
      if (mainWaliCol !== -1 && row[mainWaliCol] && !detectedWaliKelasVal) {
        const wk = String(row[mainWaliCol]).trim();
        if (wk && !wk.toLowerCase().includes('wali')) detectedWaliKelasVal = wk;
      }
      if (mainDateCol !== -1 && row[mainDateCol] && !detectedReportDateVal) {
        const dt = String(row[mainDateCol]).trim();
        if (dt) detectedReportDateVal = dt;
      }

      studentsToUpsert.push({
        nis: stNis,
        nisn: stNisn,
        name: stName,
        gender: 'L',
        birthPlace: 'Batang',
        birthDate: '2008-01-01',
        classId: targetClassId,
        parentName: `Orang Tua / Wali dari ${stName}`,
        status: 'Aktif',
      });

      // Extract grades for each mapped subject
      subjectMappings.forEach((map) => {
        const rawForm = row[map.formativeCol];
        const rawSum = row[map.summativeCol];
        const rawCap = row[map.capaianCol];

        const formNum =
          rawForm !== '' && !isNaN(parseFloat(rawForm)) ? parseFloat(rawForm) : null;
        const sumNum =
          rawSum !== '' && !isNaN(parseFloat(rawSum)) ? parseFloat(rawSum) : null;
        const capDesc = rawCap ? String(rawCap).trim() : map.subject.defaultCompetencyDesc || '';

        gradesToUpsert.push({
          studentName: stName,
          studentNis: stNis,
          subjectId: map.subject.id,
          formativeScore: formNum,
          summativeScore: sumNum,
          competencyDesc: capDesc,
        });
      });

      // Extract Attendance: Dedicated sheet takes precedence, else main sheet columns, else 0
      const attFromSheet =
        attMapFromDedicatedSheet.get(stNis) || attMapFromDedicatedSheet.get(stName);
      if (attFromSheet) {
        attendancesToUpsert.push({
          studentName: stName,
          studentNis: stNis,
          sick: attFromSheet.sick,
          permitted: attFromSheet.permitted,
          unexcused: attFromSheet.unexcused,
        });
      } else if (mainSickCol !== -1 || mainPermittedCol !== -1 || mainUnexcusedCol !== -1) {
        const rawS = mainSickCol !== -1 ? row[mainSickCol] : 0;
        const rawI = mainPermittedCol !== -1 ? row[mainPermittedCol] : 0;
        const rawA = mainUnexcusedCol !== -1 ? row[mainUnexcusedCol] : 0;
        const sVal = !isNaN(parseInt(rawS)) ? parseInt(rawS) : 0;
        const iVal = !isNaN(parseInt(rawI)) ? parseInt(rawI) : 0;
        const aVal = !isNaN(parseInt(rawA)) ? parseInt(rawA) : 0;

        attendancesToUpsert.push({
          studentName: stName,
          studentNis: stNis,
          sick: sVal,
          permitted: iVal,
          unexcused: aVal,
        });
      } else {
        attendancesToUpsert.push({
          studentName: stName,
          studentNis: stNis,
          sick: 0,
          permitted: 0,
          unexcused: 0,
        });
      }

      // Extract Extracurriculars: Dedicated sheet takes precedence, else main sheet columns
      const extrasFromSheet =
        extraListFromDedicatedSheet.get(stNis) || extraListFromDedicatedSheet.get(stName);
      if (extrasFromSheet && extrasFromSheet.length > 0) {
        extrasFromSheet.forEach((extraItem) => {
          extracurricularsToUpsert.push({
            studentName: stName,
            studentNis: stNis,
            name: extraItem.name,
            predicate: extraItem.predicate,
            description: extraItem.description,
          });
        });
      } else if (mainExtraCols.length > 0) {
        mainExtraCols.forEach((pair, extraIdx) => {
          const rawExtra = String(row[pair.nameCol] || '').trim();
          if (rawExtra && rawExtra !== '-' && rawExtra !== '—' && rawExtra !== '0') {
            const rawPred =
              pair.predCol !== -1 ? String(row[pair.predCol] || '').trim() : 'Baik';
            const pred = rawPred || 'Baik';
            const activityName =
              rawExtra.length > 2 && isNaN(Number(rawExtra))
                ? rawExtra
                : pair.label || `Ekstrakurikuler Pilihan ${extraIdx + 1}`;

            extracurricularsToUpsert.push({
              studentName: stName,
              studentNis: stNis,
              name: activityName,
              predicate: pred,
              description: `Aktif mengikuti kegiatan ${activityName} dengan predikat ${pred}.`,
            });
          }
        });
      }
    }

    return {
      success: true,
      studentsToUpsert,
      gradesToUpsert,
      attendancesToUpsert,
      extracurricularsToUpsert,
      studentCount: studentsToUpsert.length,
      gradeCount: gradesToUpsert.length,
      attendanceCount: attendancesToUpsert.length,
      extracurricularCount: extracurricularsToUpsert.length,
      detectedSubjects: detectedSubjectNames,
      detectedWaliKelas: detectedWaliKelasVal || undefined,
      detectedReportDate: detectedReportDateVal || undefined,
      message: `Berhasil mengekstrak ${studentsToUpsert.length} siswa, ${gradesToUpsert.length} nilai, ${attendancesToUpsert.length} data ketidakhadiran (S, I, A), dan ${extracurricularsToUpsert.length} ekstrakurikuler.`,
    };
  } catch (err: any) {
    return {
      success: false,
      studentsToUpsert: [],
      gradesToUpsert: [],
      attendancesToUpsert: [],
      extracurricularsToUpsert: [],
      studentCount: 0,
      gradeCount: 0,
      attendanceCount: 0,
      extracurricularCount: 0,
      detectedSubjects: [],
      message: `Gagal membaca file Excel Leger: ${err.message}`,
    };
  }
}

/**
 * Parses uploaded Excel files with smart header detection.
 */
export function parseExcelFile(
  fileData: ArrayBuffer
): {
  type: 'students' | 'leger' | 'unknown';
  data: any[];
  headers: string[];
  errors: string[];
} {
  const wb = XLSX.read(fileData, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[firstSheetName];

  if (!sheet) {
    return { type: 'unknown', data: [], headers: [], errors: ['File Excel tidak memiliki lembar kerja (sheet).'] };
  }

  const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rawRows.length === 0) {
    return { type: 'unknown', data: [], headers: [], errors: ['Lembar kerja kosong.'] };
  }

  // Look for header row index by scanning first 10 rows for keywords like "Nama", "NIS", or "Formatif"
  let headerRowIndex = -1;
  for (let r = 0; r < Math.min(10, rawRows.length); r++) {
    const row = rawRows[r];
    const rowStr = row.map((cell) => String(cell).toLowerCase()).join(' ');
    if (rowStr.includes('nama') || rowStr.includes('nis')) {
      headerRowIndex = r;
      break;
    }
  }

  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  const headerRow = rawRows[headerRowIndex].map((h) => String(h).trim());
  const rowData = rawRows.slice(headerRowIndex + 1).filter((r) => r.some((c) => c !== ''));

  // Detect type
  const joinedHeaders = headerRow.join(' ').toLowerCase();
  if (joinedHeaders.includes('formatif') || joinedHeaders.includes('sumatif') || joinedHeaders.includes('capaian')) {
    return {
      type: 'leger',
      headers: headerRow,
      data: rowData,
      errors: [],
    };
  } else if (joinedHeaders.includes('nama') && (joinedHeaders.includes('nis') || joinedHeaders.includes('nisn'))) {
    return {
      type: 'students',
      headers: headerRow,
      data: rowData,
      errors: [],
    };
  }

  return {
    type: 'unknown',
    headers: headerRow,
    data: rowData,
    errors: ['Format kolom belum teridentifikasi otomatis, silakan sesuaikan pemetaan kolom.'],
  };
}
