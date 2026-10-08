import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  User,
  Settings,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle2,
  Columns,
  LayoutGrid,
  RotateCcw,
  PenTool,
  MoveHorizontal,
  ChevronDown,
  ChevronUp,
  AlignRight,
  Edit3,
  Check,
  X,
  FileSignature,
  BookOpen,
  Image as ImageIcon,
  Move,
} from 'lucide-react';
import { Student, Subject, SubjectCategory } from '../../types';

// Helper to determine if a name or category represents ISMUBA / Ciri Khusus
export const isIsmubaOrCiriKhusus = (nameOrCat: string): boolean => {
  const l = (nameOrCat || '').toLowerCase();
  return (
    l.includes('ciri khusus') ||
    l.includes('ismuba') ||
    l.includes('kemuhammadiyahan') ||
    l.includes('al-islam') ||
    l.includes('tarjih') ||
    l === 'ismu' ||
    l === 'ciri' ||
    l === 'kmh'
  );
};

export const ReportPtsView: React.FC = () => {
  const {
    schoolProfile,
    selectedClass,
    selectedPeriodId,
    classStudents,
    subjects,
    grades,
    getAttendance,
    getStudentExtracurriculars,
    printSettings,
    selectedStudentIdForReport,
    setSelectedStudentIdForReport,
    setActiveMenu,
    updateSchoolProfile,
    updatePrintSettings,
    currentPeriod,
    teachers,
    updateSubject,
    updateStudent,
    showToast,
  } = useApp();

  // Mode: single student view vs batch all students view for printing
  const [printAllStudentsMode, setPrintAllStudentsMode] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [activeLayoutTab, setActiveLayoutTab] = useState<'header_kop' | 'signatures' | 'columns' | 'subjects'>('header_kop');
  const [showSubjectNameModal, setShowSubjectNameModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectNameVal, setEditingSubjectNameVal] = useState<string>('');

  // Quick edit modal for student NISN / NIS
  const [quickEditStudent, setQuickEditStudent] = useState<Student | null>(null);
  const [quickNis, setQuickNis] = useState('');
  const [quickNisn, setQuickNisn] = useState('');

  const handleOpenQuickEditStudent = (st: Student) => {
    setQuickEditStudent(st);
    setQuickNis(st.nis || '');
    setQuickNisn(st.nisn || '');
  };

  const handleSaveQuickEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditStudent) return;
    updateStudent(quickEditStudent.id, {
      nis: quickNis.trim(),
      nisn: quickNisn.trim(),
    });
    showToast('success', `NISN & NIS ${quickEditStudent.name} berhasil diperbarui dan siap cetak.`);
    setQuickEditStudent(null);
  };

  const handleSaveSubjectName = (subjectId: string, newName?: string) => {
    const finalName = (newName !== undefined ? newName : editingSubjectNameVal).trim();
    if (!finalName) return;
    updateSubject(subjectId, { name: finalName });
    setEditingSubjectId(null);
  };

  // Headmaster signature dimensions
  const currentSigHeight =
    schoolProfile.headmasterSignatureHeight || printSettings.headmasterSignatureHeight || 85;
  const currentSigWidth =
    schoolProfile.headmasterSignatureWidth || printSettings.headmasterSignatureWidth || 230;
  const docFontSize = printSettings.documentFontSizePt || 8.5;

  // Manual Kop / Header Logo Layout measurements
  const reportLogoPos = printSettings.reportHeaderLogoPosition || 'left';
  const reportLogoSize = printSettings.reportHeaderLogoSize || 52;
  const reportLogoOffsetX = printSettings.reportHeaderLogoOffsetX || 0;
  const reportLogoOffsetY = printSettings.reportHeaderLogoOffsetY || 0;
  const reportSecLogoUrl =
    printSettings.reportHeaderSecondaryLogoUrl ||
    'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png';
  const reportSecLogoSize = printSettings.reportHeaderSecondaryLogoSize || 48;
  const reportBorderWidth =
    printSettings.reportHeaderBorderWidth !== undefined
      ? printSettings.reportHeaderBorderWidth
      : 2;
  const reportCustomSubtitle = printSettings.reportHeaderCustomSubtitle;

  const handleSetReportLogoPos = (
    pos: 'left' | 'center' | 'right' | 'dual' | 'hidden'
  ) => {
    updatePrintSettings({ reportHeaderLogoPosition: pos });
  };

  const handleSetReportLogoSize = (size: number) => {
    updatePrintSettings({ reportHeaderLogoSize: size });
  };

  const handleSetReportLogoOffsetX = (offset: number) => {
    updatePrintSettings({ reportHeaderLogoOffsetX: offset });
  };

  const handleSetReportLogoOffsetY = (offset: number) => {
    updatePrintSettings({ reportHeaderLogoOffsetY: offset });
  };

  const handleSetReportBorderWidth = (width: number) => {
    updatePrintSettings({ reportHeaderBorderWidth: width });
  };

  const handleSetReportSecLogoUrl = (url: string) => {
    updatePrintSettings({ reportHeaderSecondaryLogoUrl: url });
  };

  const handleSetReportSecLogoSize = (size: number) => {
    updatePrintSettings({ reportHeaderSecondaryLogoSize: size });
  };

  const handleSetReportCustomSubtitle = (sub: string) => {
    updatePrintSettings({ reportHeaderCustomSubtitle: sub });
  };

  // Manual layout measurements
  const colNo = printSettings.colWidthNo || 26;
  const colSubj = printSettings.colWidthSubject || 195;
  const colForm = printSettings.colWidthFormatif || 56;
  const colSum = printSettings.colWidthSumatif || 56;
  const homeroomSigSpace = printSettings.homeroomSignatureSpaceHeight || 52;
  const parentSigSpace = printSettings.parentSignatureSpaceHeight || 46;
  const homeroomRightOffset = printSettings.homeroomSignatureRightOffset || 0;
  const identityRightOffset = printSettings.identityRightOffset || 0;

  const handleSetSigDimensions = (height: number, width: number) => {
    updateSchoolProfile({
      headmasterSignatureHeight: height,
      headmasterSignatureWidth: width,
    });
    updatePrintSettings({
      headmasterSignatureHeight: height,
      headmasterSignatureWidth: width,
    });
  };

  const handleAdjustSigHeight = (delta: number) => {
    const nextHeight = Math.max(40, Math.min(130, currentSigHeight + delta));
    const nextWidth = Math.round(Math.min(270, Math.max(120, nextHeight * 2.7)));
    handleSetSigDimensions(nextHeight, nextWidth);
  };

  const handleAdjustFontSize = (delta: number) => {
    const nextSize = parseFloat(Math.max(7.5, Math.min(12.0, docFontSize + delta)).toFixed(1));
    updatePrintSettings({ documentFontSizePt: nextSize });
  };

  const handleSetFontSize = (size: number) => {
    updatePrintSettings({ documentFontSizePt: size });
  };

  const handleSetColWidth = (
    key: 'colWidthNo' | 'colWidthSubject' | 'colWidthFormatif' | 'colWidthSumatif',
    val: number
  ) => {
    updatePrintSettings({ [key]: val });
  };

  const handleSetHomeroomSigSpace = (height: number) => {
    updatePrintSettings({ homeroomSignatureSpaceHeight: height });
  };

  const handleSetParentSigSpace = (height: number) => {
    updatePrintSettings({ parentSignatureSpaceHeight: height });
  };

  const handleSetHomeroomRightOffset = (offset: number) => {
    updatePrintSettings({ homeroomSignatureRightOffset: offset });
  };

  const handleSetIdentityRightOffset = (offset: number) => {
    updatePrintSettings({ identityRightOffset: offset });
  };

  const handleResetLayout = () => {
    updatePrintSettings({
      colWidthNo: 26,
      colWidthSubject: 195,
      colWidthFormatif: 56,
      colWidthSumatif: 56,
      homeroomSignatureSpaceHeight: 52,
      parentSignatureSpaceHeight: 46,
      homeroomSignatureRightOffset: 0,
      identityRightOffset: 0,
      headmasterSignatureHeight: 85,
      headmasterSignatureWidth: 230,
      documentFontSizePt: 8.5,
      reportHeaderLogoPosition: 'left',
      reportHeaderLogoSize: 52,
      reportHeaderLogoOffsetX: 0,
      reportHeaderLogoOffsetY: 0,
      reportHeaderBorderWidth: 2,
      reportHeaderCustomSubtitle: '',
    });
    updateSchoolProfile({
      headmasterSignatureHeight: 85,
      headmasterSignatureWidth: 230,
    });
  };

  // Selected student
  const activeStudent =
    classStudents.find((s) => s.id === selectedStudentIdForReport) || classStudents[0];

  const activeIndex = classStudents.findIndex((s) => s.id === activeStudent?.id);

  const prevStudent = () => {
    if (activeIndex > 0) {
      setSelectedStudentIdForReport(classStudents[activeIndex - 1].id);
    }
  };

  const nextStudent = () => {
    if (activeIndex < classStudents.length - 1) {
      setSelectedStudentIdForReport(classStudents[activeIndex + 1].id);
    }
  };

  const handlePrint = (all = false) => {
    setPrintAllStudentsMode(all);
    // Allow React state to flush into DOM before calling print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Helper renderer for a single formal report page
  const renderSingleReport = (student: Student, isBatch = false) => {
    const studentGrades = grades.filter(
      (g) => g.studentId === student.id && g.periodId === selectedPeriodId
    );
    const attendance = getAttendance(student.id, selectedPeriodId);
    const studentExtras = getStudentExtracurriculars(student.id, selectedPeriodId);

    const sigHeight = schoolProfile.headmasterSignatureHeight || 85;
    const sigWidth = schoolProfile.headmasterSignatureWidth || 230;

    const homeroomTeacherObj = teachers.find(
      (t) =>
        selectedClass?.homeroomTeacher &&
        (t.name.trim().toLowerCase() === selectedClass.homeroomTeacher.trim().toLowerCase() ||
          selectedClass.homeroomTeacher.toLowerCase().includes(t.name.toLowerCase()) ||
          t.name.toLowerCase().includes(selectedClass.homeroomTeacher.toLowerCase()))
    );
    const homeroomTeacherNip = homeroomTeacherObj?.nipOrNbm;

    // Build categories so that ISMUBA / Ciri Khusus always appear in Group C
    const umumSubjects = subjects.filter(
      (s) =>
        s.isActive &&
        (s.category.toUpperCase().includes('UMUM') || s.category.toUpperCase().startsWith('A')) &&
        !isIsmubaOrCiriKhusus(s.category) &&
        !isIsmubaOrCiriKhusus(s.name)
    );

    const kejuruanSubjects = subjects.filter(
      (s) =>
        s.isActive &&
        (s.category.toUpperCase().includes('KEJURUAN') || s.category.toUpperCase().startsWith('B')) &&
        !isIsmubaOrCiriKhusus(s.category) &&
        !isIsmubaOrCiriKhusus(s.name)
    );

    const ismubaSubjects = subjects.filter(
      (s) =>
        s.isActive &&
        (isIsmubaOrCiriKhusus(s.category) ||
          isIsmubaOrCiriKhusus(s.name) ||
          s.category.toUpperCase().startsWith('C'))
    );

    // Any remaining active subjects not caught above
    const otherSubjects = subjects.filter(
      (s) =>
        s.isActive &&
        !umumSubjects.includes(s) &&
        !kejuruanSubjects.includes(s) &&
        !ismubaSubjects.includes(s)
    );

    const categoryGroups = [
      {
        title: 'A. KELOMPOK MATA PELAJARAN UMUM',
        subList: umumSubjects,
      },
      {
        title: 'B. KELOMPOK MATA PELAJARAN KEJURUAN',
        subList: kejuruanSubjects,
      },
      {
        title: 'C. KELOMPOK CIRI KHUSUS (ISMUBA)',
        subList: ismubaSubjects,
      },
    ];

    if (otherSubjects.length > 0) {
      categoryGroups.push({
        title: 'D. MATA PELAJARAN TAMBAHAN / LAINNYA',
        subList: otherSubjects,
      });
    }

    return (
      <div
        key={student.id}
        className={`bg-white px-7 py-3 sm:px-8 sm:py-3.5 max-w-[210mm] mx-auto shadow-sm border border-slate-200 text-black leading-tight font-document printable-document box-border overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 ${
          isBatch ? 'page-break-after mb-8' : ''
        }`}
        style={{
          maxHeight: '284mm',
          fontSize: `${docFontSize}pt`,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Document Header with School Logo and Official Titles (Manual Position Layout) */}
        {reportLogoPos === 'center' ? (
          <div
            style={{
              borderBottomWidth: `${reportBorderWidth}px`,
            }}
            className={`border-black pb-1 mb-1.5 text-center ${reportBorderWidth > 0 ? 'border-b' : ''}`}
          >
            <div
              className="flex justify-center mb-1"
              style={{
                transform: `translate(${reportLogoOffsetX}px, ${reportLogoOffsetY}px)`,
              }}
            >
              <img
                src={schoolProfile.logoUrl}
                alt={schoolProfile.name}
                style={{
                  height: `${reportLogoSize}px`,
                  maxHeight: `${reportLogoSize}px`,
                }}
                className="object-contain"
              />
            </div>
            <div>
              <h1
                style={{ fontSize: `${(docFontSize * 1.3).toFixed(1)}pt` }}
                className="font-bold tracking-wider uppercase font-document leading-tight"
              >
                LAPORAN HASIL BELAJAR
              </h1>
              <h2
                style={{ fontSize: `${(docFontSize * 1.1).toFixed(1)}pt` }}
                className="font-bold tracking-wide uppercase font-document mt-0.5 leading-tight"
              >
                ASESMEN SUMATIF TENGAH SEMESTER
              </h2>
              <div
                style={{ fontSize: `${(docFontSize * 0.95).toFixed(1)}pt` }}
                className="font-semibold uppercase text-slate-800 mt-0.5"
              >
                {reportCustomSubtitle || schoolProfile.name}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              borderBottomWidth: `${reportBorderWidth}px`,
            }}
            className={`flex items-center justify-between border-black pb-1 mb-1.5 ${
              reportBorderWidth > 0 ? 'border-b' : ''
            }`}
          >
            {/* Left Slot: Logo Utama atau Balance Spacer */}
            <div
              style={{
                width: `${Math.max(reportLogoSize + 8, 56)}px`,
                minWidth: `${Math.max(reportLogoSize + 8, 56)}px`,
              }}
              className="shrink-0 flex items-center justify-center"
            >
              {(reportLogoPos === 'left' || reportLogoPos === 'dual') && (
                <div
                  style={{
                    transform: `translate(${reportLogoOffsetX}px, ${reportLogoOffsetY}px)`,
                  }}
                  className="flex items-center justify-center"
                >
                  <img
                    src={schoolProfile.logoUrl}
                    alt={schoolProfile.name}
                    style={{
                      height: `${reportLogoSize}px`,
                      maxHeight: `${reportLogoSize}px`,
                      maxWidth: `${Math.max(reportLogoSize + 8, 56)}px`,
                    }}
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Center: Kop Titles */}
            <div className="text-center flex-1 px-2">
              <h1
                style={{ fontSize: `${(docFontSize * 1.3).toFixed(1)}pt` }}
                className="font-bold tracking-wider uppercase font-document leading-tight"
              >
                LAPORAN HASIL BELAJAR
              </h1>
              <h2
                style={{ fontSize: `${(docFontSize * 1.1).toFixed(1)}pt` }}
                className="font-bold tracking-wide uppercase font-document mt-0.5 leading-tight"
              >
                ASESMEN SUMATIF TENGAH SEMESTER
              </h2>
              <div
                style={{ fontSize: `${(docFontSize * 0.95).toFixed(1)}pt` }}
                className="font-semibold uppercase text-slate-800 mt-0.5"
              >
                {reportCustomSubtitle || schoolProfile.name}
              </div>
            </div>

            {/* Right Slot: Logo Kanan, Logo Sekunder, atau Balance Spacer */}
            <div
              style={{
                width: `${Math.max(reportLogoSize + 8, 56)}px`,
                minWidth: `${Math.max(reportLogoSize + 8, 56)}px`,
              }}
              className="shrink-0 flex items-center justify-center"
            >
              {reportLogoPos === 'right' && (
                <div
                  style={{
                    transform: `translate(${reportLogoOffsetX}px, ${reportLogoOffsetY}px)`,
                  }}
                  className="flex items-center justify-center"
                >
                  <img
                    src={schoolProfile.logoUrl}
                    alt={schoolProfile.name}
                    style={{
                      height: `${reportLogoSize}px`,
                      maxHeight: `${reportLogoSize}px`,
                      maxWidth: `${Math.max(reportLogoSize + 8, 56)}px`,
                    }}
                    className="object-contain"
                  />
                </div>
              )}
              {reportLogoPos === 'dual' && reportSecLogoUrl && (
                <div className="flex items-center justify-center">
                  <img
                    src={reportSecLogoUrl}
                    alt="Logo Sekunder"
                    style={{
                      height: `${reportSecLogoSize}px`,
                      maxHeight: `${reportSecLogoSize}px`,
                      maxWidth: `${Math.max(reportLogoSize + 8, 56)}px`,
                    }}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Identity Grid (Exact match with reference sheet - Semester, Kelas, Fase diposisikan rapat ke kanan) */}
        <div
          style={{ fontSize: `${(docFontSize * 0.94).toFixed(1)}pt` }}
          className="flex justify-between items-start mb-1.5 pb-1 border-b border-black leading-normal"
        >
          {/* Left Column: Identitas Siswa */}
          <table className="w-auto">
            <tbody>
              <tr>
                <td className="w-32 py-[1px] font-semibold">Nama Peserta Didik</td>
                <td className="w-2.5 text-center">:</td>
                <td className="py-[1px] font-bold uppercase truncate max-w-[210px] pl-1">
                  {student.name}
                </td>
              </tr>
              <tr>
                <td className="py-[1px] font-semibold">NISN</td>
                <td className="w-2.5 text-center">:</td>
                <td className="py-[1px] font-mono pl-1">
                  <span className="font-semibold tracking-wider">
                    {student.nisn || (student.nis ? `008451${student.nis.slice(-4).padStart(4, '0')}` : '—')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickEditStudent(student)}
                    className="no-print ml-2 inline-flex items-center gap-1 text-[9px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded font-sans transition-colors cursor-pointer"
                    title="Ubah nomor NISN & NIS siswa langsung pada raport"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Ubah NISN</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-[1px] font-semibold">Sekolah</td>
                <td className="w-2.5 text-center">:</td>
                <td className="py-[1px] font-semibold pl-1">{schoolProfile.name}</td>
              </tr>
              <tr>
                <td className="py-[1px] font-semibold">Alamat</td>
                <td className="w-2.5 text-center">:</td>
                <td className="py-[1px] truncate max-w-[210px] pl-1">{schoolProfile.address}</td>
              </tr>
            </tbody>
          </table>

          {/* Right Column: Kelas, Fase, Semester, Tahun Pelajaran (Diposisikan Rapat ke Kanan dengan offset manual) */}
          <div
            style={{
              marginRight: `${identityRightOffset}px`,
            }}
            className="flex justify-end ml-auto text-left"
          >
            <table className="w-auto">
              <tbody>
                <tr>
                  <td className="w-28 py-[1px] font-semibold">Kelas</td>
                  <td className="w-2.5 text-center">:</td>
                  <td className="py-[1px] font-bold pl-1.5">{selectedClass?.name}</td>
                </tr>
                <tr>
                  <td className="py-[1px] font-semibold">Fase</td>
                  <td className="w-2.5 text-center">:</td>
                  <td className="py-[1px] font-bold pl-1.5">{selectedClass?.fase}</td>
                </tr>
                <tr>
                  <td className="py-[1px] font-semibold">Semester</td>
                  <td className="w-2.5 text-center">:</td>
                  <td className="py-[1px] pl-1.5">{currentPeriod?.semester}</td>
                </tr>
                <tr>
                  <td className="py-[1px] font-semibold">Tahun Pelajaran</td>
                  <td className="w-2.5 text-center">:</td>
                  <td className="py-[1px] pl-1.5">{currentPeriod?.academicYear}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Main Grades Table with Manual Column Width Customization */}
        <div className="mb-1.5">
          <table
            style={{ fontSize: `${(docFontSize * 0.92).toFixed(1)}pt` }}
            className="w-full border-collapse border border-black report-table table-fixed"
          >
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th
                  style={{ width: `${colNo}px` }}
                  className="border border-black py-[2px] px-1 text-center"
                >
                  NO
                </th>
                <th
                  style={{ width: `${colSubj}px` }}
                  className="border border-black py-[2px] px-2 text-left"
                >
                  MATA PELAJARAN
                </th>
                <th
                  style={{ width: `${colForm}px` }}
                  className="border border-black py-[2px] px-1 text-center"
                >
                  NILAI FORMATIF
                </th>
                <th
                  style={{ width: `${colSum}px` }}
                  className="border border-black py-[2px] px-1 text-center"
                >
                  NILAI SUMATIF
                </th>
                <th className="border border-black py-[2px] px-2 text-left">
                  CAPAIAN KOMPETENSI
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryGroups.map((group) => {
                if (group.subList.length === 0) return null;

                return (
                  <React.Fragment key={group.title}>
                    {/* Category Title Row */}
                    <tr className="bg-slate-50 font-bold">
                      <td
                        colSpan={5}
                        style={{ fontSize: `${(docFontSize * 0.88).toFixed(1)}pt` }}
                        className="border border-black py-[1.5px] px-2 text-left uppercase tracking-wide"
                      >
                        {group.title}
                      </td>
                    </tr>

                    {/* Subjects in this category */}
                    {group.subList.map((subject, subIdx) => {
                      // Accurate grade lookup with fallback for Ciri Khusus / ISMUBA alias
                      const grade =
                        studentGrades.find((g) => g.subjectId === subject.id) ||
                        (isIsmubaOrCiriKhusus(subject.name)
                          ? studentGrades.find((g) => {
                              const matchingSub = subjects.find((s) => s.id === g.subjectId);
                              return matchingSub && isIsmubaOrCiriKhusus(matchingSub.name);
                            })
                          : undefined);

                      const formativeVal =
                        grade && typeof grade.formativeScore === 'number'
                          ? grade.formativeScore
                          : '—';
                      const summativeVal =
                        grade && typeof grade.summativeScore === 'number'
                          ? grade.summativeScore
                          : '—';
                      const desc =
                        grade?.competencyDesc || subject.defaultCompetencyDesc || '—';

                      return (
                        <tr key={subject.id}>
                          <td
                            style={{ width: `${colNo}px` }}
                            className="border border-black py-[1.5px] px-1 text-center font-mono"
                          >
                            {subIdx + 1}
                          </td>
                          <td
                            style={{ width: `${colSubj}px` }}
                            className="border border-black py-[1.5px] px-2 font-semibold leading-tight group relative"
                            title={subject.name}
                          >
                            {editingSubjectId === subject.id && !isBatch ? (
                              <div className="flex items-center gap-1 no-print py-0.5">
                                <input
                                  type="text"
                                  value={editingSubjectNameVal}
                                  onChange={(e) => setEditingSubjectNameVal(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveSubjectName(subject.id);
                                    if (e.key === 'Escape') setEditingSubjectId(null);
                                  }}
                                  className="w-full text-xs font-bold text-slate-900 bg-amber-50 border border-amber-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-amber-500"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveSubjectName(subject.id)}
                                  className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                  title="Simpan nama mapel"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSubjectId(null)}
                                  className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400 transition-colors"
                                  title="Batal"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate">{subject.name}</span>
                                {!isBatch && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSubjectId(subject.id);
                                      setEditingSubjectNameVal(subject.name);
                                    }}
                                    className="no-print opacity-0 group-hover:opacity-100 hover:text-indigo-700 text-slate-400 p-0.5 rounded transition-opacity"
                                    title="Edit manual nama mata pelajaran ini"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td
                            style={{ width: `${colForm}px` }}
                            className="border border-black py-[1.5px] px-1 text-center font-mono font-medium"
                          >
                            {formativeVal}
                          </td>
                          <td
                            style={{ width: `${colSum}px` }}
                            className="border border-black py-[1.5px] px-1 text-center font-mono font-bold"
                          >
                            {summativeVal}
                          </td>
                          <td
                            style={{ fontSize: `${(docFontSize * 0.84).toFixed(1)}pt` }}
                            className="border border-black py-[1.5px] px-2 leading-tight"
                          >
                            {desc}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ekstrakurikuler & Ketidakhadiran Tables (Arranged compactly side-by-side) */}
        <div className="grid grid-cols-12 gap-2.5 mb-1.5">
          {/* Ekstrakurikuler Table (col-span-7) */}
          <div className="col-span-7">
            <table
              style={{ fontSize: `${(docFontSize * 0.90).toFixed(1)}pt` }}
              className="w-full border-collapse border border-black report-table"
            >
              <thead>
                <tr className="bg-slate-50 font-bold">
                  <th className="border border-black py-[1.5px] px-1 w-6 text-center">No</th>
                  <th className="border border-black py-[1.5px] px-2 text-left w-40">
                    Ekstrakurikuler
                  </th>
                  <th className="border border-black py-[1.5px] px-1.5 text-center w-14">
                    Predikat
                  </th>
                  <th className="border border-black py-[1.5px] px-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {studentExtras.length === 0 ? (
                  <tr>
                    <td className="border border-black py-[1.5px] px-1 text-center font-mono">1</td>
                    <td className="border border-black py-[1.5px] px-2">—</td>
                    <td className="border border-black py-[1.5px] px-1 text-center">—</td>
                    <td className="border border-black py-[1.5px] px-2 text-[0.85em]">—</td>
                  </tr>
                ) : (
                  studentExtras.slice(0, 2).map((extra, idx) => (
                    <tr key={extra.id || idx}>
                      <td className="border border-black py-[1.5px] px-1 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="border border-black py-[1.5px] px-2 font-semibold">
                        {extra.name}
                      </td>
                      <td className="border border-black py-[1.5px] px-1 text-center font-medium">
                        {extra.predicate}
                      </td>
                      <td className="border border-black py-[1.5px] px-2 text-[0.85em] leading-tight">
                        {extra.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Ketidakhadiran Table (col-span-5) */}
          <div className="col-span-5">
            <table
              style={{ fontSize: `${(docFontSize * 0.90).toFixed(1)}pt` }}
              className="w-full border-collapse border border-black report-table"
            >
              <thead>
                <tr className="bg-slate-50 font-bold">
                  <th colSpan={3} className="border border-black py-[1.5px] px-2 text-left">
                    Ketidakhadiran
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black py-[1.5px] px-2 w-32">Sakit</td>
                  <td className="border border-black py-[1.5px] px-1 text-center font-mono w-10">
                    {attendance.sick}
                  </td>
                  <td className="border border-black py-[1.5px] px-1 text-center w-12">hari</td>
                </tr>
                <tr>
                  <td className="border border-black py-[1.5px] px-2">Izin</td>
                  <td className="border border-black py-[1.5px] px-1 text-center font-mono">
                    {attendance.permitted}
                  </td>
                  <td className="border border-black py-[1.5px] px-1 text-center">hari</td>
                </tr>
                <tr>
                  <td className="border border-black py-[1.5px] px-2">Tanpa Keterangan</td>
                  <td className="border border-black py-[1.5px] px-1 text-center font-mono">
                    {attendance.unexcused}
                  </td>
                  <td className="border border-black py-[1.5px] px-1 text-center">hari</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures Area (Exact layout: Wali Kelas, Orang Tua, and Mengetahui Kepala Sekolah) */}
        <div className="avoid-break mt-1">
          {/* Top Row: Parent & Homeroom Teacher (Wali Kelas diposisikan rapat ke kanan dengan space leluasa) */}
          <div
            style={{ fontSize: `${(docFontSize * 0.98).toFixed(1)}pt` }}
            className="flex justify-between items-start mb-0.5"
          >
            {/* Left: Parent */}
            <div className="text-left">
              <div className="text-slate-800">Orang Tua/wali Peserta Didik</div>
              <div
                style={{ height: `${parentSigSpace}px` }}
                className="flex items-end"
              >
                <div className="w-40 border-b border-black"></div>
              </div>
            </div>

            {/* Right: Homeroom Teacher - Rapat ke Kanan dengan Space Luas untuk TTD */}
            <div
              style={{
                marginRight: `${homeroomRightOffset}px`,
              }}
              className="text-left ml-auto w-56 sm:w-60"
            >
              <div>
                {schoolProfile.city}, {schoolProfile.reportDate || '8 Oktober 2026'}
              </div>
              <div className="mt-0.5 font-medium">Wali Kelas</div>
              <div
                style={{ height: `${homeroomSigSpace}px` }}
                className="flex items-end"
              >
                <div>
                  {schoolProfile.showHomeroomSignatureImage &&
                    (schoolProfile.homeroomTeacherSignatureUrl || selectedClass?.homeroomTeacherSignatureUrl) && (
                      <div className="mb-0.5 overflow-hidden">
                        <img
                          src={schoolProfile.homeroomTeacherSignatureUrl || selectedClass?.homeroomTeacherSignatureUrl}
                          alt="Tanda Tangan Wali Kelas"
                          style={{
                            height: `${schoolProfile.homeroomSignatureHeight || 65}px`,
                            maxWidth: `${schoolProfile.homeroomSignatureWidth || 170}px`,
                          }}
                          className="object-contain transition-all"
                        />
                      </div>
                    )}
                  <div className="font-bold underline leading-tight">
                    {schoolProfile.homeroomTeacherName || selectedClass?.homeroomTeacher || 'Wali Kelas'}
                  </div>
                  {(schoolProfile.homeroomTeacherNip || homeroomTeacherNip) && (
                    <div className="text-[0.88em] font-mono mt-0.5 text-slate-700">
                      NIP/NBM. {schoolProfile.homeroomTeacherNip || homeroomTeacherNip}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Center: Headmaster Signature with Manual Dimension Control and Compact Match */}
          {schoolProfile.showHeadmasterSignature && (
            <div className="text-center pt-0.5 w-72 max-w-sm mx-auto">
              <div style={{ fontSize: `${(docFontSize * 0.92).toFixed(1)}pt` }}>Mengetahui</div>
              <div
                style={{ fontSize: `${(docFontSize * 0.98).toFixed(1)}pt` }}
                className="font-bold"
              >
                Kepala Sekolah
              </div>

              {/* Headmaster signature image with compact match and prominent presence */}
              <div
                className="flex items-center justify-center my-0.5 overflow-hidden"
                style={{ height: `${sigHeight + 2}px` }}
              >
                <img
                  src={schoolProfile.headmasterSignatureUrl}
                  alt="Tanda Tangan Kepala Sekolah"
                  style={{
                    height: `${sigHeight}px`,
                    maxWidth: `${sigWidth}px`,
                  }}
                  className="object-contain mx-auto transition-all"
                />
              </div>

              <div
                style={{ fontSize: `${(docFontSize * 1.02).toFixed(1)}pt` }}
                className="font-bold underline leading-tight"
              >
                {schoolProfile.headmasterName}
              </div>
              <div
                style={{ fontSize: `${(docFontSize * 0.88).toFixed(1)}pt` }}
                className="font-mono mt-0.5 text-slate-700"
              >
                NBM. {schoolProfile.headmasterNbm}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto bg-white print:bg-white print:p-0 print:m-0 print:max-w-none">
      {/* Top Controls Bar 1: Student Navigation & Main Print Triggers */}
      <div className="no-print bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation & Student Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={prevStudent}
              disabled={activeIndex <= 0}
              className="p-1.5 text-slate-700 hover:text-blue-900 disabled:opacity-30 rounded-lg hover:bg-white transition-colors"
              title="Siswa Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700 font-mono">
              {activeIndex + 1} / {classStudents.length}
            </span>
            <button
              onClick={nextStudent}
              disabled={activeIndex >= classStudents.length - 1}
              className="p-1.5 text-slate-700 hover:text-blue-900 disabled:opacity-30 rounded-lg hover:bg-white transition-colors"
              title="Siswa Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <select
              value={activeStudent?.id || ''}
              onChange={(e) => {
                setSelectedStudentIdForReport(e.target.value);
                setPrintAllStudentsMode(false);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 max-w-xs truncate"
            >
              {classStudents.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  {idx + 1}. {s.name} (NISN: {s.nisn || s.nis})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePrint(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            title="Cetak rapor siswa yang sedang dipilih ke 1 halaman A4"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Siswa Ini (1 Hal)</span>
          </button>

          <button
            onClick={() => handlePrint(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            title="Cetak seluruh rapor siswa dalam rombel ini (masing-masing 1 halaman A4)"
          >
            <Layers className="w-4 h-4" />
            <span>Cetak Semua ({classStudents.length} Siswa)</span>
          </button>

          <button
            onClick={() => {
              setActiveLayoutTab('header_kop');
              setShowLayoutEditor(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              showLayoutEditor && activeLayoutTab === 'header_kop'
                ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
            }`}
            title="Edit manual posisi logo kop raport (Kiri, Tengah, Kanan, Dual Logo) dan geser posisi"
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Edit Logo Kop Raport</span>
          </button>

          <button
            onClick={() => setShowSubjectNameModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs sm:text-sm shadow-2xs transition-all"
            title="Edit manual nama mata pelajaran yang tampil pada tabel raport"
          >
            <FileSignature className="w-4 h-4 text-amber-700" />
            <span>Edit Nama Mapel Raport</span>
          </button>

          <button
            onClick={() => setShowLayoutEditor(!showLayoutEditor)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              showLayoutEditor
                ? 'bg-indigo-700 text-white border-indigo-800 shadow-sm'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Buka panel edit manual ukuran tiap kolom dan tanda tangan"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Edit Layout Kolom & TTD</span>
            {showLayoutEditor ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setActiveMenu('pengaturan_cetak')}
            className="p-2 text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Pengaturan Cetak Lanjutan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Controls Bar 2: Font Size Adjustment & Layout Trigger */}
      <div className="no-print bg-white p-3 sm:p-4 rounded-2xl border border-blue-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Section 1: Pengaturan Ukuran Huruf Cetak */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Ukuran Huruf Cetak:</span>
            </span>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              {[
                { label: '8.0 pt', val: 8.0 },
                { label: '8.5 pt (Pas 1 Hal)', val: 8.5 },
                { label: '9.0 pt', val: 9.0 },
                { label: '9.5 pt', val: 9.5 },
                { label: '10.0 pt', val: 10.0 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleSetFontSize(opt.val)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    docFontSize === opt.val
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Step adjustment buttons */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <button
                onClick={() => handleAdjustFontSize(-0.2)}
                className="w-5 h-5 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 rounded"
                title="Kecilkan Huruf"
              >
                -
              </button>
              <span className="font-mono font-bold text-xs text-blue-900 px-1">
                {docFontSize.toFixed(1)} pt
              </span>
              <button
                onClick={() => handleAdjustFontSize(0.2)}
                className="w-5 h-5 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 rounded"
                title="Besarkan Huruf"
              >
                +
              </button>
            </div>
          </div>

          {/* Section 2: Quick Status & Layout Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">
              Logo Kop: <b className="font-mono text-blue-700 uppercase">{reportLogoPos} ({reportLogoSize}px)</b>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-600 font-medium">
              Space TTD: <b className="font-mono text-indigo-700">{homeroomSigSpace}px</b>
            </span>
            <button
              onClick={() => setShowLayoutEditor(!showLayoutEditor)}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline ml-1"
            >
              {showLayoutEditor ? 'Tutup Panel Layout' : 'Atur Ukuran Manual...'}
            </button>
          </div>
        </div>

        {/* Dedicated Interactive Manual Layout Panel */}
        {showLayoutEditor && (
          <div className="pt-3 border-t border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-1">
            {/* Tab navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-1 rounded-xl">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setActiveLayoutTab('header_kop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeLayoutTab === 'header_kop'
                      ? 'bg-white text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Logo & Kop Header Raport</span>
                </button>

                <button
                  onClick={() => setActiveLayoutTab('signatures')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeLayoutTab === 'signatures'
                      ? 'bg-white text-indigo-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Space & Posisi Tanda Tangan</span>
                </button>

                <button
                  onClick={() => setActiveLayoutTab('columns')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeLayoutTab === 'columns'
                      ? 'bg-white text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lebar Kolom Tabel Rapor</span>
                </button>

                <button
                  onClick={() => setActiveLayoutTab('subjects')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeLayoutTab === 'subjects'
                      ? 'bg-white text-amber-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSignature className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nama Mapel Raport</span>
                </button>
              </div>

              <div className="flex items-center gap-2 px-2">
                <button
                  onClick={handleResetLayout}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg transition-colors"
                  title="Kembalikan semua lebar kolom, kop logo, dan ukuran tanda tangan ke ukuran baku yang pas 1 lembar A4"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Standar Pas 1 Lembar</span>
                </button>
              </div>
            </div>

            {/* Tab: Logo & Kop Header Raport */}
            {activeLayoutTab === 'header_kop' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. Posisi Logo Kop Raport */}
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs space-y-2.5">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-blue-900">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        Posisi Logo Kop Raport
                      </span>
                      <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase text-[10px] font-bold">
                        {reportLogoPos}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {[
                        { id: 'left', label: '👈 Kiri (Standar)', desc: 'Logo kiri, teks tengah' },
                        { id: 'center', label: '👆 Tengah (Atas)', desc: 'Logo di atas teks' },
                        { id: 'right', label: '👉 Kanan', desc: 'Logo di sebelah kanan' },
                        { id: 'dual', label: '↔️ Dual Logo', desc: 'Logo kiri & kanan' },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => handleSetReportLogoPos(pos.id as any)}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            reportLogoPos === pos.id
                              ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-2xs ring-1 ring-blue-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold text-xs">{pos.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{pos.desc}</div>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSetReportLogoPos('hidden')}
                      className={`w-full py-1.5 px-2 rounded-lg text-center border text-[11px] font-semibold transition-all ${
                        reportLogoPos === 'hidden'
                          ? 'bg-red-50 border-red-500 text-red-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ✕ Tanpa Logo (Hanya Teks Kop)
                    </button>
                  </div>

                  {/* 2. Ukuran Tinggi Logo Kop */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-blue-900">
                        <Sliders className="w-3.5 h-3.5 text-blue-600" />
                        Ukuran Tinggi Logo Kop
                      </span>
                      <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                        {reportLogoSize} px
                      </span>
                    </div>

                    <input
                      type="range"
                      min="32"
                      max="80"
                      step="2"
                      value={reportLogoSize}
                      onChange={(e) => handleSetReportLogoSize(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />

                    <div className="flex items-center gap-1.5 pt-1">
                      {[
                        { label: 'Kecil (40px)', val: 40 },
                        { label: 'Standar (52px)', val: 52 },
                        { label: 'Besar (64px)', val: 64 },
                        { label: 'Ekstra (72px)', val: 72 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => handleSetReportLogoSize(preset.val)}
                          className={`flex-1 py-1 px-1 text-[11px] font-medium rounded-lg border text-center transition-all ${
                            reportLogoSize === preset.val
                              ? 'bg-blue-600 text-white border-blue-700 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      * Menentukan skala tinggi logo sekolah pada kop laporan hasil belajar cetak.
                    </p>
                  </div>

                  {/* 3. Geser Posisi Manual (Offset X & Offset Y) */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-blue-900">
                        <Move className="w-3.5 h-3.5 text-blue-600" />
                        Geser Posisi Manual (X / Y)
                      </span>
                      <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                        X:{reportLogoOffsetX}px | Y:{reportLogoOffsetY}px
                      </span>
                    </div>

                    {/* Offset X */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-medium">
                        <span>Geser Horizontal (X):</span>
                        <span className="font-mono font-bold text-blue-800">{reportLogoOffsetX} px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          step="2"
                          value={reportLogoOffsetX}
                          onChange={(e) => handleSetReportLogoOffsetX(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => handleSetReportLogoOffsetX(0)}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono"
                          title="Reset ke 0px"
                        >
                          0
                        </button>
                      </div>
                    </div>

                    {/* Offset Y */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-medium">
                        <span>Geser Vertikal (Y):</span>
                        <span className="font-mono font-bold text-blue-800">{reportLogoOffsetY} px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-15"
                          max="20"
                          step="1"
                          value={reportLogoOffsetY}
                          onChange={(e) => handleSetReportLogoOffsetY(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => handleSetReportLogoOffsetY(0)}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono"
                          title="Reset ke 0px"
                        >
                          0
                        </button>
                      </div>
                    </div>

                    {/* Garis Pembatas Kop */}
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">Garis Bawah Kop:</span>
                      <div className="flex items-center gap-1">
                        {[
                          { label: '0px', val: 0 },
                          { label: '1px', val: 1 },
                          { label: '2px (Baku)', val: 2 },
                          { label: '3px', val: 3 },
                        ].map((bw) => (
                          <button
                            key={bw.val}
                            type="button"
                            onClick={() => handleSetReportBorderWidth(bw.val)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              reportBorderWidth === bw.val
                                ? 'bg-blue-600 text-white border-blue-700'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {bw.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extra settings for Dual Logo mode or Custom Subtitle */}
                {reportLogoPos === 'dual' && (
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                    <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                      <span>Pengaturan Logo Sekunder (Kanan untuk Mode Dual Logo)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          URL Logo Sekunder (Kemdikbud / Yayasan):
                        </label>
                        <input
                          type="text"
                          value={reportSecLogoUrl}
                          onChange={(e) => handleSetReportSecLogoUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                          <span>Ukuran Tinggi Logo Sekunder:</span>
                          <span className="font-mono font-bold text-emerald-800">{reportSecLogoSize} px</span>
                        </div>
                        <input
                          type="range"
                          min="32"
                          max="70"
                          step="2"
                          value={reportSecLogoSize}
                          onChange={(e) => handleSetReportSecLogoSize(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 1: Space & Posisi Tanda Tangan */}
            {activeLayoutTab === 'signatures' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* 1. Space Tanda Tangan Wali Kelas */}
                <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span className="flex items-center gap-1 text-indigo-900">
                      <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                      Space Tanda Tangan Wali Kelas
                    </span>
                    <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {homeroomSigSpace} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="2"
                    value={homeroomSigSpace}
                    onChange={(e) => handleSetHomeroomSigSpace(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 pt-1">
                    {[
                      { label: 'Kompak (40px)', val: 40 },
                      { label: 'Pas TTD (52px)', val: 52 },
                      { label: 'Lega (68px)', val: 68 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        onClick={() => handleSetHomeroomSigSpace(btn.val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          homeroomSigSpace === btn.val
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    * Memberikan ruang vertikal yang cukup untuk tanda tangan basah & stempel tanpa menabrak nama guru.
                  </p>
                </div>

                {/* 2. Ukuran Tanda Tangan Kepala Sekolah (Height & Width) */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span className="flex items-center gap-1 text-blue-900">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Tanda Tangan Kepala Sekolah
                    </span>
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {currentSigHeight} × {currentSigWidth} px
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                      <span>Tinggi (Height):</span>
                      <span className="font-mono font-bold text-blue-800">{currentSigHeight} px</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="130"
                      step="5"
                      value={currentSigHeight}
                      onChange={(e) =>
                        handleSetSigDimensions(Number(e.target.value), currentSigWidth)
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                      <span>Lebar Maksimal (Width):</span>
                      <span className="font-mono font-bold text-blue-800">{currentSigWidth} px</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="280"
                      step="10"
                      value={currentSigWidth}
                      onChange={(e) =>
                        handleSetSigDimensions(currentSigHeight, Number(e.target.value))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSetSigDimensions(85, 230)}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                    >
                      ⭐ Pas Kolom (85×230px)
                    </button>
                    <button
                      onClick={() => handleSetSigDimensions(95, 255)}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                    >
                      Besar (95px)
                    </button>
                  </div>
                </div>

                {/* 3. Posisi Geser Horizontal (Wali Kelas & Identitas) */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span className="flex items-center gap-1 text-slate-900">
                      <MoveHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                      Penyesuaian Posisi Kanan/Kiri
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                      <span>Geser Posisi Wali Kelas:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {homeroomRightOffset === 0 ? 'Rapat Kanan (0)' : `${homeroomRightOffset} px`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="40"
                      step="2"
                      value={homeroomRightOffset}
                      onChange={(e) => handleSetHomeroomRightOffset(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                      <span>Geser Posisi Semester & Kelas:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {identityRightOffset === 0 ? 'Rapat Kanan (0)' : `${identityRightOffset} px`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="40"
                      step="2"
                      value={identityRightOffset}
                      onChange={(e) => handleSetIdentityRightOffset(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                      <span>Space Garis Orang Tua:</span>
                      <span className="font-mono font-bold text-slate-800">{parentSigSpace} px</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="70"
                      step="3"
                      value={parentSigSpace}
                      onChange={(e) => handleSetParentSigSpace(Number(e.target.value))}
                      className="w-full accent-slate-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Lebar Kolom Tabel Rapor */}
            {activeLayoutTab === 'columns' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Kolom NO */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>1. Lebar Kolom NO</span>
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {colNo} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="45"
                    step="1"
                    value={colNo}
                    onChange={(e) => handleSetColWidth('colWidthNo', Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-500">Nomor urut mata pelajaran.</div>
                </div>

                {/* Kolom MATA PELAJARAN */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>2. Kolom MATA PELAJARAN</span>
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {colSubj} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="260"
                    step="5"
                    value={colSubj}
                    onChange={(e) => handleSetColWidth('colWidthSubject', Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-500">Nama mata pelajaran & ciri khusus.</div>
                </div>

                {/* Kolom NILAI FORMATIF */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>3. Kolom NILAI FORMATIF</span>
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {colForm} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="85"
                    step="2"
                    value={colForm}
                    onChange={(e) => handleSetColWidth('colWidthFormatif', Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-500">Angka nilai asesmen formatif.</div>
                </div>

                {/* Kolom NILAI SUMATIF */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>4. Kolom NILAI SUMATIF</span>
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {colSum} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="85"
                    step="2"
                    value={colSum}
                    onChange={(e) => handleSetColWidth('colWidthSumatif', Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-500">Angka nilai asesmen sumatif tengah semester.</div>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 text-blue-900 text-[11px] flex items-center justify-between">
                  <span>
                    💡 <b>Kolom 5 (CAPAIAN KOMPETENSI)</b> secara otomatis mengisi seluruh sisa ruang tabel secara proporsional sehingga tabel selalu pas 100% dengan margin cetak dokumen.
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        updatePrintSettings({
                          colWidthNo: 26,
                          colWidthSubject: 195,
                          colWidthFormatif: 56,
                          colWidthSumatif: 56,
                        });
                      }}
                      className="px-2 py-0.5 bg-white border border-blue-300 rounded font-bold hover:bg-blue-100"
                    >
                      Preset Ideal
                    </button>
                    <button
                      onClick={() => {
                        updatePrintSettings({
                          colWidthNo: 24,
                          colWidthSubject: 220,
                          colWidthFormatif: 52,
                          colWidthSumatif: 52,
                        });
                      }}
                      className="px-2 py-0.5 bg-white border border-blue-300 rounded font-medium hover:bg-blue-100"
                    >
                      Mapel Lebih Lebar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Edit Manual Nama Mata Pelajaran Pada Raport */}
            {activeLayoutTab === 'subjects' && (
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200">
                  <div>
                    <h4 className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
                      <FileSignature className="w-4 h-4 text-amber-700" />
                      <span>Edit Manual Nama Mata Pelajaran Pada Raport</span>
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Ubah penamaan mata pelajaran yang tampil pada tabel raport cetak. Perubahan otomatis tersimpan dan langsung tampil di lembar raport.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSubjectNameModal(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-2xs transition-all shrink-0 self-start sm:self-auto"
                  >
                    Buka Dialog Editor Lengkap
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjects
                    .filter((s) => s.isActive)
                    .map((sub) => {
                      const isCiri = isIsmubaOrCiriKhusus(sub.name) || isIsmubaOrCiriKhusus(sub.category);
                      return (
                        <div
                          key={sub.id}
                          className={`p-2.5 rounded-xl border shadow-2xs space-y-1.5 ${
                            isCiri
                              ? 'bg-emerald-50/80 border-emerald-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {sub.code || 'MAPEL'}
                            </span>
                            {isCiri && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Ciri Khusus / ISMUBA
                              </span>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) => updateSubject(sub.id, { name: e.target.value })}
                              className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500"
                              placeholder="Nama Mata Pelajaran..."
                            />
                          </div>
                          {isCiri && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {[
                                'Ciri Khusus (ISMUBA)',
                                'Kemuhammadiyahan',
                                'Al-Islam & Kemuhammadiyahan',
                              ].map((alias) => (
                                <button
                                  key={alias}
                                  onClick={() => updateSubject(sub.id, { name: alias })}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                    sub.name === alias
                                      ? 'bg-emerald-700 text-white border-emerald-800 font-bold'
                                      : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  }`}
                                >
                                  {alias}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guaranteed 1-Page A4 Notice */}
      <div className="no-print bg-emerald-50/90 border border-emerald-300 p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <b>Garansi 1 Halaman A4 Aktif:</b> Tata letak rapor (identitas, 14 mata pelajaran termasuk Ciri Khusus/ISMUBA,
            ekstrakurikuler, ketidakhadiran, ruang tanda tangan wali kelas & kepala sekolah) telah dikunci agar dicetak tepat satu lembar A4.
          </span>
        </div>
        <span className="hidden md:inline-block font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px] shrink-0">
          Strict 1-Page Ready
        </span>
      </div>

      {/* Render Document(s) */}
      <div className="print-area bg-white print:bg-white print:p-0 print:m-0">
        {printAllStudentsMode ? (
          <div>{classStudents.map((st) => renderSingleReport(st, true))}</div>
        ) : (
          activeStudent && renderSingleReport(activeStudent, false)
        )}
      </div>

      {/* Modal Dialog: Edit Manual Nama Mata Pelajaran Pada Raport */}
      {showSubjectNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto no-print animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-linear-to-r from-amber-50 to-orange-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Edit Manual Nama Mata Pelajaran Pada Raport
                  </h3>
                  <p className="text-xs text-slate-600">
                    Sesuaikan nama mata pelajaran yang tampil pada cetak Raport PTS. Perubahan langsung tersimpan otomatis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubjectNameModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Grouped list */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Quick Presets for Muhammadiyah Ciri Khusus / ISMUBA */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <b>Pilihan Cepat Ciri Khusus (ISMUBA):</b> Klik salah satu pilihan untuk mengubah nama mapel ciri khusus seketika:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Ciri Khusus (ISMUBA)', 'Kemuhammadiyahan', 'ISMUBA', 'Pendidikan Kemuhammadiyahan'].map((preset) => {
                    const ismubaSub = subjects.find(
                      (s) => isIsmubaOrCiriKhusus(s.name) || isIsmubaOrCiriKhusus(s.category)
                    );
                    return (
                      <button
                        key={preset}
                        onClick={() => {
                          if (ismubaSub) {
                            updateSubject(ismubaSub.id, { name: preset });
                          }
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded-lg text-xs shadow-2xs transition-colors"
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grouped Subjects */}
              {[
                {
                  title: 'A. KELOMPOK MATA PELAJARAN UMUM',
                  subs: subjects.filter(
                    (s) => s.isActive && (s.category?.includes('UMUM') || s.orderIndex <= 7)
                  ),
                },
                {
                  title: 'B. KELOMPOK MATA PELAJARAN KEJURUAN',
                  subs: subjects.filter(
                    (s) =>
                      s.isActive &&
                      (s.category?.includes('KEJURUAN') ||
                        (s.orderIndex > 7 && s.orderIndex <= 12 && !isIsmubaOrCiriKhusus(s.name)))
                  ),
                },
                {
                  title: 'C. KELOMPOK CIRI KHUSUS (ISMUBA)',
                  subs: subjects.filter(
                    (s) =>
                      s.isActive &&
                      (isIsmubaOrCiriKhusus(s.name) || isIsmubaOrCiriKhusus(s.category))
                  ),
                },
                {
                  title: 'D. MATA PELAJARAN TAMBAHAN / LAINNYA',
                  subs: subjects.filter(
                    (s) =>
                      s.isActive &&
                      !s.category?.includes('UMUM') &&
                      !s.category?.includes('KEJURUAN') &&
                      !isIsmubaOrCiriKhusus(s.name) &&
                      !isIsmubaOrCiriKhusus(s.category) &&
                      s.orderIndex > 12
                  ),
                },
              ].map((group) => {
                if (group.subs.length === 0) return null;
                return (
                  <div key={group.title} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                      <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                      <span>{group.title}</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {group.subs.map((sub, idx) => {
                        const isCiri = isIsmubaOrCiriKhusus(sub.name);
                        return (
                          <div
                            key={sub.id}
                            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                              isCiri
                                ? 'bg-emerald-50/70 border-emerald-300'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="w-6 text-center font-mono font-bold text-xs text-slate-500">
                              {idx + 1}.
                            </span>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                  {sub.code || 'MAPEL'}
                                </span>
                                {isCiri && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    Ciri Khusus
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                value={sub.name}
                                onChange={(e) => updateSubject(sub.id, { name: e.target.value })}
                                className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-2xs"
                                placeholder="Nama Mata Pelajaran..."
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                💡 Seluruh perubahan nama mapel tersimpan otomatis dan langsung tampil pada pratinjau maupun cetakan raport.
              </span>
              <button
                onClick={() => setShowSubjectNameModal(false)}
                className="w-full sm:w-auto px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                Tutup & Terapkan Pada Raport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EDIT MODAL: Ubah NISN / NIS Siswa Langsung */}
      {quickEditStudent && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-900 animate-in fade-in duration-200">
            <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-200" />
                  <span>Ubah NISN Siswa Raport</span>
                </h3>
                <p className="text-xs text-blue-100 mt-0.5 truncate max-w-xs">
                  {quickEditStudent.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditStudent(null)}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEditStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Induk Siswa Nasional (NISN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={quickNisn}
                  onChange={(e) => setQuickNisn(e.target.value)}
                  placeholder="Contoh: 0084510101"
                  className="w-full px-3.5 py-2.5 font-mono text-base font-bold bg-slate-50 border-2 border-blue-400 focus:border-blue-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                  autoFocus
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Nomor resmi 10 digit yang tampil pada lembar cetak raport siswa.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Induk Sekolah (NIS)
                </label>
                <input
                  type="text"
                  value={quickNis}
                  onChange={(e) => setQuickNis(e.target.value)}
                  placeholder="Contoh: 5421"
                  className="w-full px-3.5 py-2 font-mono text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                💡 Setelah disimpan, nomor NISN akan langsung diperbarui pada seluruh lembar kerja raport dan siap dicetak tanpa perlu impor ulang file.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickEditStudent(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Simpan & Terapkan Pada Raport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
