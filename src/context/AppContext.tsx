import React, { createContext, useContext, useState, useEffect } from 'react';
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
  RankingMethod,
  PrintSettings,
  ToastNotification,
  StudentRankSummary,
} from '../types';
import {
  initialSchoolProfile,
  initialPeriods,
  initialClasses,
  initialTeachers,
  initialStudents,
  initialSubjects,
  initialGrades,
  initialAttendances,
  initialExtracurriculars,
  initialPrintSettings,
} from '../data/initialData';
import { calculateClassRankings, RankingOptions } from '../utils/ranking';
import {
  saveDatabaseState,
  loadDatabaseState,
  getDatabaseStats,
  createDatabaseSnapshot,
  restoreDatabaseSnapshot,
  DatabaseStats,
  DatabaseState,
} from '../db/database';

interface AppContextType {
  // Navigation
  activeMenu: string;
  setActiveMenu: (menu: string) => void;

  // Selected filters
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;

  // Database persistence
  dbStatus: 'connected' | 'saving' | 'saved' | 'error';
  dbStats: DatabaseStats | null;
  forceSaveToDatabase: () => Promise<boolean>;
  refreshDatabaseStats: () => Promise<void>;
  createDbSnapshot: (name: string) => Promise<string>;
  restoreDbSnapshot: (id: string) => Promise<boolean>;

  // Data states
  schoolProfile: SchoolProfile;
  setSchoolProfile: (profile: SchoolProfile) => void;
  updateSchoolProfile: (patch: Partial<SchoolProfile>) => void;

  periods: AcademicPeriod[];
  currentPeriod: AcademicPeriod | undefined;
  addPeriod: (period: Omit<AcademicPeriod, 'id'>) => void;
  updatePeriod: (id: string, period: Partial<AcademicPeriod>) => void;
  deletePeriod: (id: string) => void;

  classes: ClassGroup[];
  selectedClass: ClassGroup | undefined;
  addClass: (cls: Omit<ClassGroup, 'id'>) => void;
  updateClass: (id: string, cls: Partial<ClassGroup>) => void;
  deleteClass: (id: string) => void;

  teachers: Teacher[];
  addTeacher: (t: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, t: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  students: Student[];
  classStudents: Student[];
  addStudent: (s: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, s: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  batchAddOrUpdateStudents: (
    newStudents: Omit<Student, 'id'>[],
    mode: 'skip_duplicate' | 'update_duplicate'
  ) => { added: number; updated: number; skipped: number };
  replaceClassDataFromLegerExcel: (
    classId: string,
    periodId: string,
    newStudentsData: Omit<Student, 'id'>[],
    newGradesData: {
      studentName: string;
      studentNis: string;
      subjectId: string;
      formativeScore: number | null;
      summativeScore: number | null;
      competencyDesc: string;
    }[],
    newAttendanceData?: {
      studentName: string;
      studentNis: string;
      sick: number;
      permitted: number;
      unexcused: number;
    }[],
    newExtracurricularData?: {
      studentName: string;
      studentNis: string;
      name: string;
      predicate: string;
      description?: string;
    }[],
    detectedWaliKelas?: string,
    detectedReportDate?: string
  ) => {
    studentCount: number;
    gradeCount: number;
    attendanceCount: number;
    extracurricularCount: number;
    removedCount: number;
  };
  transferStudentClass: (studentId: string, targetClassId: string) => void;

  subjects: Subject[];
  addSubject: (sub: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, sub: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  reorderSubjects: (reordered: Subject[]) => void;

  grades: GradeRecord[];
  saveGrade: (
    studentId: string,
    subjectId: string,
    periodId: string,
    formative: number | null,
    summative: number | null,
    competencyDesc: string
  ) => void;
  batchSaveGrades: (newGrades: GradeRecord[]) => void;
  getStudentGrade: (
    studentId: string,
    subjectId: string,
    periodId: string
  ) => GradeRecord | undefined;

  attendances: AttendanceRecord[];
  getAttendance: (studentId: string, periodId: string) => AttendanceRecord;
  updateAttendance: (
    studentId: string,
    periodId: string,
    data: { sick: number; permitted: number; unexcused: number }
  ) => void;

  extracurriculars: ExtracurricularRecord[];
  getStudentExtracurriculars: (
    studentId: string,
    periodId: string
  ) => ExtracurricularRecord[];
  addExtracurricular: (record: Omit<ExtracurricularRecord, 'id'>) => void;
  updateExtracurricular: (
    id: string,
    record: Partial<ExtracurricularRecord>
  ) => void;
  deleteExtracurricular: (id: string) => void;

  // Ranking
  rankingMethod: RankingMethod;
  setRankingMethod: (method: RankingMethod) => void;
  includeIncompleteInRanking: boolean;
  setIncludeIncompleteInRanking: (include: boolean) => void;
  rankingScoreBasis: 'summative' | 'average_both';
  setRankingScoreBasis: (basis: 'summative' | 'average_both') => void;
  getClassRankings: (classId?: string, periodId?: string) => StudentRankSummary[];

  // Print settings
  printSettings: PrintSettings;
  updatePrintSettings: (settings: Partial<PrintSettings>) => void;

  // Selected student for report card view
  selectedStudentIdForReport: string;
  setSelectedStudentIdForReport: (id: string) => void;

  // Toasts
  toasts: ToastNotification[];
  showToast: (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    title?: string
  ) => void;
  dismissToast: (id: string) => void;

  // Backup & Reset
  exportBackupJson: () => string;
  restoreBackupJson: (jsonData: string) => boolean;
  resetToDefaultData: () => void;
  storageUsageKb: number;
}

const STORAGE_KEY_PREFIX = 'muhiba_raport_v1_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  // Load state with fallback
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.warn(`Error reading localStorage for ${key}`, e);
      return fallback;
    }
  };

  const [schoolProfile, setSchoolProfileState] = useState<SchoolProfile>(() =>
    loadStored('schoolProfile', initialSchoolProfile)
  );

  const [periods, setPeriods] = useState<AcademicPeriod[]>(() =>
    loadStored('periods', initialPeriods)
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(() => {
    const stored = loadStored('selectedPeriodId', '');
    return stored || initialPeriods[0]?.id || '';
  });

  const [classes, setClasses] = useState<ClassGroup[]>(() =>
    loadStored('classes', initialClasses)
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    const stored = loadStored('selectedClassId', '');
    return stored || initialClasses[0]?.id || '';
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    loadStored('teachers', initialTeachers)
  );
  const [students, setStudents] = useState<Student[]>(() => {
    const stored = loadStored('students', initialStudents);
    return stored.map((s, idx) => {
      let validNisn = s.nisn ? String(s.nisn).trim() : '';
      if (!validNisn || validNisn === s.nis) {
        const initMatch = initialStudents.find(
          (init) => init.id === s.id || init.nis === s.nis || init.name.toUpperCase() === s.name.toUpperCase()
        );
        if (initMatch?.nisn) {
          validNisn = initMatch.nisn;
        } else {
          const numStr = String(idx + 1).padStart(2, '0');
          validNisn = `008451${numStr}${idx % 10}`;
        }
      }
      return { ...s, nisn: validNisn };
    });
  });
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadStored('subjects', initialSubjects)
  );
  const [grades, setGrades] = useState<GradeRecord[]>(() =>
    loadStored('grades', initialGrades)
  );
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() =>
    loadStored('attendances', initialAttendances)
  );
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularRecord[]>(() =>
    loadStored('extracurriculars', initialExtracurriculars)
  );

  const [rankingMethod, setRankingMethodState] = useState<RankingMethod>(() =>
    loadStored('rankingMethod', 'competition')
  );
  const [includeIncompleteInRanking, setIncludeIncompleteInRankingState] = useState<boolean>(() =>
    loadStored('includeIncomplete', false)
  );
  const [rankingScoreBasis, setRankingScoreBasisState] = useState<'summative' | 'average_both'>(() =>
    loadStored('scoreBasis', 'summative')
  );

  const [printSettings, setPrintSettings] = useState<PrintSettings>(() =>
    loadStored('printSettings', initialPrintSettings)
  );

  const [selectedStudentIdForReport, setSelectedStudentIdForReport] = useState<string>('s-1');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [storageUsageKb, setStorageUsageKb] = useState<number>(0);

  const [dbStatus, setDbStatus] = useState<'connected' | 'saving' | 'saved' | 'error'>('connected');
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);

  // Hydrate from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loaded = await loadDatabaseState();
        if (loaded && isMounted) {
          if (loaded.schoolProfile) setSchoolProfileState(loaded.schoolProfile);
          if (loaded.periods && loaded.periods.length > 0) setPeriods(loaded.periods);
          if (loaded.selectedPeriodId) setSelectedPeriodId(loaded.selectedPeriodId);
          if (loaded.classes && loaded.classes.length > 0) setClasses(loaded.classes);
          if (loaded.selectedClassId) setSelectedClassId(loaded.selectedClassId);
          if (loaded.teachers && loaded.teachers.length > 0) setTeachers(loaded.teachers);
          if (loaded.students && loaded.students.length > 0) setStudents(loaded.students);
          if (loaded.subjects && loaded.subjects.length > 0) setSubjects(loaded.subjects);
          if (loaded.grades && loaded.grades.length > 0) setGrades(loaded.grades);
          if (loaded.attendances && loaded.attendances.length > 0) setAttendances(loaded.attendances);
          if (loaded.extracurriculars && loaded.extracurriculars.length > 0) setExtracurriculars(loaded.extracurriculars);
          if (loaded.printSettings) setPrintSettings(loaded.printSettings);
        }
        const stats = await getDatabaseStats();
        if (isMounted) {
          setDbStats(stats);
          setDbStatus('connected');
        }
      } catch (err) {
        console.warn('Initial IndexedDB hydration error:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced auto-save to IndexedDB (safe with structured cloning & large images)
  useEffect(() => {
    setDbStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const statePayload: DatabaseState = {
          schoolProfile,
          periods,
          selectedPeriodId,
          classes,
          selectedClassId,
          teachers,
          students,
          subjects,
          grades,
          attendances,
          extracurriculars,
          printSettings,
          lastUpdated: new Date().toISOString(),
        };

        const success = await saveDatabaseState(statePayload);
        if (success) {
          setDbStatus('saved');
          const stats = await getDatabaseStats();
          setDbStats(stats);
        } else {
          setDbStatus('error');
        }
      } catch (err) {
        console.error('IndexedDB save error:', err);
        setDbStatus('error');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [
    schoolProfile,
    periods,
    selectedPeriodId,
    classes,
    selectedClassId,
    teachers,
    students,
    subjects,
    grades,
    attendances,
    extracurriculars,
    printSettings,
  ]);

  // Sync to local storage on changes (ignoring quota errors for safe multi-layer storage)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'schoolProfile', JSON.stringify(schoolProfile));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'periods', JSON.stringify(periods));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'selectedPeriodId', JSON.stringify(selectedPeriodId));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'classes', JSON.stringify(classes));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'selectedClassId', JSON.stringify(selectedClassId));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'teachers', JSON.stringify(teachers));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'students', JSON.stringify(students));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'subjects', JSON.stringify(subjects));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'grades', JSON.stringify(grades));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'attendances', JSON.stringify(attendances));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'extracurriculars', JSON.stringify(extracurriculars));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'rankingMethod', JSON.stringify(rankingMethod));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'includeIncomplete', JSON.stringify(includeIncompleteInRanking));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'scoreBasis', JSON.stringify(rankingScoreBasis));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'printSettings', JSON.stringify(printSettings));

      let total = 0;
      for (const x in localStorage) {
        if (localStorage.hasOwnProperty(x) && x.startsWith(STORAGE_KEY_PREFIX)) {
          total += (localStorage[x].length * 2) / 1024;
        }
      }
      setStorageUsageKb(Math.round(total * 10) / 10);
    } catch {
      // Ignored: IndexedDB stores full unlimited data safely
    }
  }, [
    schoolProfile,
    periods,
    selectedPeriodId,
    classes,
    selectedClassId,
    teachers,
    students,
    subjects,
    grades,
    attendances,
    extracurriculars,
    rankingMethod,
    includeIncompleteInRanking,
    rankingScoreBasis,
    printSettings,
  ]);

  // Toast notifier
  const showToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    title?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper selectors
  const currentPeriod = periods.find((p) => p.id === selectedPeriodId) || periods[0];
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // School profile
  const setSchoolProfile = (profile: SchoolProfile) => {
    setSchoolProfileState(profile);
  };
  const updateSchoolProfile = (patch: Partial<SchoolProfile>) => {
    setSchoolProfileState((prev) => ({ ...prev, ...patch }));

    // If homeroom teacher details are edited in School Profile, sync with active class
    if (patch.homeroomTeacherName !== undefined) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === selectedClassId
            ? {
                ...c,
                homeroomTeacher: patch.homeroomTeacherName || c.homeroomTeacher,
                homeroomTeacherNip:
                  patch.homeroomTeacherNip !== undefined
                    ? patch.homeroomTeacherNip
                    : c.homeroomTeacherNip,
                homeroomTeacherSignatureUrl:
                  patch.homeroomTeacherSignatureUrl !== undefined
                    ? patch.homeroomTeacherSignatureUrl
                    : c.homeroomTeacherSignatureUrl,
                homeroomTeacherPhotoUrl:
                  patch.homeroomTeacherPhotoUrl !== undefined
                    ? patch.homeroomTeacherPhotoUrl
                    : c.homeroomTeacherPhotoUrl,
              }
            : c
        )
      );
    }

    // If reportDate is updated in School Profile, sync it immediately to all periods (centralized titimangsa)
    if (patch.reportDate !== undefined) {
      setPeriods((prev) =>
        prev.map((p) => ({ ...p, reportDate: patch.reportDate! }))
      );
    }

    if (
      patch.headmasterSignatureHeight !== undefined ||
      patch.headmasterSignatureWidth !== undefined ||
      patch.showHeadmasterSignature !== undefined
    ) {
      setPrintSettings((prev) => ({
        ...prev,
        ...(patch.headmasterSignatureHeight !== undefined
          ? { headmasterSignatureHeight: patch.headmasterSignatureHeight }
          : {}),
        ...(patch.headmasterSignatureWidth !== undefined
          ? { headmasterSignatureWidth: patch.headmasterSignatureWidth }
          : {}),
        ...(patch.showHeadmasterSignature !== undefined
          ? { showHeadmasterSignature: patch.showHeadmasterSignature }
          : {}),
      }));
    }
    showToast('success', 'Profil dan identitas sekolah berhasil diperbarui.');
  };

  // Periods
  const addPeriod = (period: Omit<AcademicPeriod, 'id'>) => {
    const newId = `p-${Date.now()}`;
    const newPeriod: AcademicPeriod = { ...period, id: newId };
    setPeriods((prev) => [...prev, newPeriod]);
    setSelectedPeriodId(newId);
    showToast('success', `Tahun pelajaran ${period.academicYear} ${period.semester} ditambahkan.`);
  };
  const updatePeriod = (id: string, patch: Partial<AcademicPeriod>) => {
    setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    showToast('success', 'Tahun pelajaran diperbarui.');
  };
  const deletePeriod = (id: string) => {
    if (periods.length <= 1) {
      showToast('error', 'Tidak dapat menghapus satu-satunya tahun pelajaran aktif.');
      return;
    }
    setPeriods((prev) => prev.filter((p) => p.id !== id));
    if (selectedPeriodId === id) {
      setSelectedPeriodId(periods[0].id);
    }
    showToast('info', 'Tahun pelajaran dihapus.');
  };

  // Classes
  const addClass = (cls: Omit<ClassGroup, 'id'>) => {
    const newId = `c-${Date.now()}`;
    const newClass: ClassGroup = { ...cls, id: newId };
    setClasses((prev) => [...prev, newClass]);
    setSelectedClassId(newId);
    showToast('success', `Kelas ${cls.name} berhasil ditambahkan.`);
  };
  const updateClass = (id: string, patch: Partial<ClassGroup>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    showToast('success', 'Informasi kelas berhasil diperbarui.');
  };
  const deleteClass = (id: string) => {
    if (classes.length <= 1) {
      showToast('error', 'Minimal harus ada satu kelas dalam sistem.');
      return;
    }
    setClasses((prev) => prev.filter((c) => c.id !== id));
    if (selectedClassId === id) {
      setSelectedClassId(classes[0].id);
    }
    showToast('info', 'Kelas berhasil dihapus.');
  };

  // Teachers
  const addTeacher = (t: Omit<Teacher, 'id'>) => {
    const newId = `t-${Date.now()}`;
    setTeachers((prev) => [...prev, { ...t, id: newId }]);
    showToast('success', `Data guru ${t.name} tersimpan.`);
  };
  const updateTeacher = (id: string, patch: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    showToast('success', 'Data guru diperbarui.');
  };
  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    showToast('info', 'Guru dihapus.');
  };

  // Students
  const addStudent = (s: Omit<Student, 'id'>) => {
    // Check duplicate NIS/NISN
    const isDup = students.some((x) => x.nis === s.nis || (s.nisn && x.nisn === s.nisn));
    if (isDup) {
      showToast('error', 'Gagal: NIS atau NISN sudah terdaftar pada siswa lain.');
      return;
    }
    const newId = `s-${Date.now()}`;
    setStudents((prev) => [...prev, { ...s, id: newId }]);
    showToast('success', `Siswa ${s.name} berhasil didaftarkan.`);
  };
  const updateStudent = (id: string, patch: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    showToast('success', 'Data siswa berhasil diperbarui.');
  };
  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
    setAttendances((prev) => prev.filter((a) => a.studentId !== id));
    showToast('info', 'Data siswa berhasil dihapus.');
  };

  const batchAddOrUpdateStudents = (
    newStudents: Omit<Student, 'id'>[],
    mode: 'skip_duplicate' | 'update_duplicate'
  ) => {
    let added = 0;
    let updated = 0;
    let skipped = 0;

    const currentMap = new Map<string, Student>();
    students.forEach((s) => {
      currentMap.set(s.nis, s);
      if (s.nisn) currentMap.set(s.nisn, s);
    });

    const updatedList = [...students];

    newStudents.forEach((st) => {
      const existing = currentMap.get(st.nis) || (st.nisn ? currentMap.get(st.nisn) : undefined);
      if (existing) {
        if (mode === 'update_duplicate') {
          const idx = updatedList.findIndex((s) => s.id === existing.id);
          if (idx !== -1) {
            updatedList[idx] = { ...updatedList[idx], ...st };
            updated++;
          }
        } else {
          skipped++;
        }
      } else {
        const newStudent: Student = {
          ...st,
          id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        };
        updatedList.push(newStudent);
        added++;
      }
    });

    setStudents(updatedList);
    return { added, updated, skipped };
  };

  const replaceClassDataFromLegerExcel = (
    classId: string,
    periodId: string,
    newStudentsData: Omit<Student, 'id'>[],
    newGradesData: {
      studentName: string;
      studentNis: string;
      subjectId: string;
      formativeScore: number | null;
      summativeScore: number | null;
      competencyDesc: string;
    }[],
    newAttendanceData: {
      studentName: string;
      studentNis: string;
      sick: number;
      permitted: number;
      unexcused: number;
    }[] = [],
    newExtracurricularData: {
      studentName: string;
      studentNis: string;
      name: string;
      predicate: string;
      description?: string;
    }[] = [],
    detectedWaliKelas?: string,
    detectedReportDate?: string
  ) => {
    // 1. Keep students belonging to other classes
    const otherClassStudents = students.filter((s) => s.classId !== classId);

    // Existing students in this class for mapping/ID preservation
    const existingInThisClass = students.filter((s) => s.classId === classId);
    const existingMap = new Map<string, Student>();
    const existingNameNormMap = new Map<string, Student>();

    const normalizeName = (name: string) =>
      (name || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    existingInThisClass.forEach((s) => {
      existingMap.set(s.nis, s);
      existingMap.set(s.name.toUpperCase(), s);
      existingNameNormMap.set(normalizeName(s.name), s);
      if (s.nisn) existingMap.set(s.nisn, s);
    });

    // Fresh student list for this class: exactly those in the new Excel file!
    const freshClassStudents: Student[] = newStudentsData.map((stData, idx) => {
      const match =
        (stData.nisn ? existingMap.get(stData.nisn) : undefined) ||
        existingMap.get(stData.name.toUpperCase()) ||
        existingNameNormMap.get(normalizeName(stData.name)) ||
        existingMap.get(stData.nis) ||
        (existingInThisClass[idx] && existingInThisClass[idx].gender === stData.gender ? existingInThisClass[idx] : undefined);

      const studentId = match ? match.id : `s-${Date.now()}-${idx + 1}`;

      // Prioritize authentic NISN from the uploaded Excel file
      let finalNisn = (stData.nisn && stData.nisn.trim() !== '')
        ? stData.nisn.trim()
        : (match?.nisn && match.nisn.trim() !== '' ? match.nisn.trim() : '');
      if (!finalNisn) {
        const seq = String(idx + 1).padStart(2, '0');
        finalNisn = `008451${seq}${idx % 10}`;
      }

      // Prioritize authentic NIS from the uploaded Excel file
      const finalNis = (stData.nis && stData.nis.trim() !== '')
        ? stData.nis.trim()
        : (match?.nis && match.nis.trim() !== '' ? match.nis.trim() : String(5420 + idx + 1));

      return {
        ...stData,
        id: studentId,
        classId,
        nis: finalNis,
        nisn: finalNisn,
      };
    });

    const newAllStudents = [...otherClassStudents, ...freshClassStudents];
    setStudents(newAllStudents);

    // Any student from existingInThisClass who is NOT in freshClassStudents is removed!
    const freshStudentIds = new Set(freshClassStudents.map((s) => s.id));
    const removedStudents = existingInThisClass.filter((s) => !freshStudentIds.has(s.id));
    const removedStudentIds = new Set(removedStudents.map((s) => s.id));

    // Comprehensive lookup maps for fresh students (ID, NIS, NISN, Upper Name, Normalized Name)
    const studentIdLookup = new Map<string, string>();
    freshClassStudents.forEach((st) => {
      studentIdLookup.set(st.id, st.id);
      studentIdLookup.set(st.nis, st.id);
      studentIdLookup.set(st.name.toUpperCase(), st.id);
      studentIdLookup.set(normalizeName(st.name), st.id);
      if (st.nisn) studentIdLookup.set(st.nisn, st.id);
    });

    // All previous or target students of this class
    const allPreviousOrTargetIds = new Set([
      ...existingInThisClass.map((s) => s.id),
      ...freshClassStudents.map((s) => s.id),
    ]);

    // 2. Prepare new grades and clean up old grades for this class and period
    const untouchedGrades = grades.filter((g) => {
      const isTargetPeriod = g.periodId === periodId;
      const isClassStudent = allPreviousOrTargetIds.has(g.studentId);
      return !(isTargetPeriod && isClassStudent);
    });

    const freshGrades: GradeRecord[] = [];
    newGradesData.forEach((item) => {
      const resolvedId =
        studentIdLookup.get((item as any).studentNisn) ||
        studentIdLookup.get(item.studentNis) ||
        studentIdLookup.get(item.studentName.toUpperCase()) ||
        studentIdLookup.get(normalizeName(item.studentName));
      if (resolvedId) {
        freshGrades.push({
          id: `${resolvedId}_${item.subjectId}_${periodId}`,
          studentId: resolvedId,
          subjectId: item.subjectId,
          periodId: periodId,
          formativeScore: item.formativeScore,
          summativeScore: item.summativeScore,
          competencyDesc: item.competencyDesc,
          updatedAt: new Date().toISOString(),
        });
      }
    });
    setGrades([...untouchedGrades, ...freshGrades]);

    // 3. REFRESH ATTENDANCES: Menghilangkan data kehadiran lama untuk kelas & periode ini, pasang data baru dari Excel
    const untouchedAttendances = attendances.filter((a) => {
      const isTargetPeriod = a.periodId === periodId;
      const isClassStudent = allPreviousOrTargetIds.has(a.studentId);
      return !(isTargetPeriod && isClassStudent);
    });

    const freshAttendances: AttendanceRecord[] = freshClassStudents.map((st) => {
      const parsedAtt =
        newAttendanceData.find((a) => a.studentNis === st.nis) ||
        newAttendanceData.find((a) => a.studentName.toUpperCase() === st.name.toUpperCase()) ||
        newAttendanceData.find((a) => normalizeName(a.studentName) === normalizeName(st.name));

      return {
        id: `att-${st.id}-${periodId}`,
        studentId: st.id,
        periodId: periodId,
        sick: parsedAtt ? parsedAtt.sick : 0,
        permitted: parsedAtt ? parsedAtt.permitted : 0,
        unexcused: parsedAtt ? parsedAtt.unexcused : 0,
      };
    });
    setAttendances([...untouchedAttendances, ...freshAttendances]);

    // 4. REFRESH EKSTRAKURIKULER: Menghilangkan data ekstrakurikuler lama untuk kelas & periode ini, pasang data baru dari Excel
    const untouchedExtracurriculars = extracurriculars.filter((e) => {
      const isTargetPeriod = e.periodId === periodId;
      const isClassStudent = allPreviousOrTargetIds.has(e.studentId);
      return !(isTargetPeriod && isClassStudent);
    });

    const freshExtracurriculars: ExtracurricularRecord[] = [];
    newExtracurricularData.forEach((extraItem, idx) => {
      const resolvedId =
        studentIdLookup.get(extraItem.studentNis) ||
        studentIdLookup.get(extraItem.studentName.toUpperCase()) ||
        studentIdLookup.get(normalizeName(extraItem.studentName));
      if (resolvedId && extraItem.name && extraItem.name.trim().length > 0) {
        freshExtracurriculars.push({
          id: `extra-${resolvedId}-${periodId}-${idx}`,
          studentId: resolvedId,
          periodId: periodId,
          name: extraItem.name.trim(),
          predicate: extraItem.predicate || 'Baik',
          description:
            extraItem.description ||
            `Aktif mengikuti kegiatan ekstrakurikuler ${extraItem.name.trim()} dengan predikat ${extraItem.predicate || 'Baik'}.`,
        });
      }
    });
    setExtracurriculars([...untouchedExtracurriculars, ...freshExtracurriculars]);

    if (freshClassStudents.length > 0) {
      setSelectedStudentIdForReport(freshClassStudents[0].id);
    }

    // Synchronize detected Wali Kelas & Tanggal Raport from Excel
    if (detectedWaliKelas) {
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, homeroomTeacher: detectedWaliKelas } : c))
      );
      setSchoolProfileState((prev) => ({
        ...prev,
        homeroomTeacherName: detectedWaliKelas,
      }));
    }
    // Note: Titimangsa rapor hanya dapat diatur secara terpusat melalui Data Sekolah (SchoolProfile)
    // Excel detection of report date is ignored to maintain single source of truth

    return {
      studentCount: freshClassStudents.length,
      gradeCount: freshGrades.length,
      attendanceCount: freshAttendances.length,
      extracurricularCount: freshExtracurriculars.length,
      removedCount: removedStudents.length,
    };
  };

  const transferStudentClass = (studentId: string, targetClassId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, classId: targetClassId } : s))
    );
    showToast('success', 'Siswa berhasil dipindahkan ke kelas tujuan.');
  };

  // Subjects
  const addSubject = (sub: Omit<Subject, 'id'>) => {
    const newId = `sub-${Date.now()}`;
    setSubjects((prev) => [...prev, { ...sub, id: newId }]);
    showToast('success', `Mata pelajaran ${sub.name} berhasil ditambahkan.`);
  };
  const updateSubject = (id: string, patch: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    showToast('success', 'Mata pelajaran diperbarui.');
  };
  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    showToast('info', 'Mata pelajaran dihapus.');
  };
  const reorderSubjects = (reordered: Subject[]) => {
    setSubjects(reordered);
  };

  // Grades
  const saveGrade = (
    studentId: string,
    subjectId: string,
    periodId: string,
    formative: number | null,
    summative: number | null,
    competencyDesc: string
  ) => {
    const id = `${studentId}_${subjectId}_${periodId}`;
    setGrades((prev) => {
      const existingIdx = prev.findIndex((g) => g.id === id);
      const record: GradeRecord = {
        id,
        studentId,
        subjectId,
        periodId,
        formativeScore: formative,
        summativeScore: summative,
        competencyDesc,
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = record;
        return next;
      }
      return [...prev, record];
    });
  };

  const batchSaveGrades = (newGrades: GradeRecord[]) => {
    setGrades((prev) => {
      const map = new Map<string, GradeRecord>();
      prev.forEach((g) => map.set(g.id, g));
      newGrades.forEach((g) => map.set(g.id, g));
      return Array.from(map.values());
    });
    showToast('success', `${newGrades.length} nilai berhasil disimpan.`);
  };

  const getStudentGrade = (
    studentId: string,
    subjectId: string,
    periodId: string
  ) => {
    const id = `${studentId}_${subjectId}_${periodId}`;
    return grades.find((g) => g.id === id);
  };

  // Attendances
  const getAttendance = (studentId: string, periodId: string): AttendanceRecord => {
    const found = attendances.find((a) => a.studentId === studentId && a.periodId === periodId);
    if (found) return found;
    return {
      id: `att-${studentId}-${periodId}`,
      studentId,
      periodId,
      sick: 0,
      permitted: 0,
      unexcused: 0,
    };
  };

  const updateAttendance = (
    studentId: string,
    periodId: string,
    data: { sick: number; permitted: number; unexcused: number }
  ) => {
    setAttendances((prev) => {
      const idx = prev.findIndex((a) => a.studentId === studentId && a.periodId === periodId);
      const record: AttendanceRecord = {
        id: `att-${studentId}-${periodId}`,
        studentId,
        periodId,
        ...data,
      };
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });
  };

  // Extracurriculars
  const getStudentExtracurriculars = (
    studentId: string,
    periodId: string
  ): ExtracurricularRecord[] => {
    return extracurriculars.filter(
      (e) => e.studentId === studentId && e.periodId === periodId
    );
  };

  const addExtracurricular = (record: Omit<ExtracurricularRecord, 'id'>) => {
    const newId = `extra-${Date.now()}`;
    setExtracurriculars((prev) => [...prev, { ...record, id: newId }]);
    showToast('success', `Ekstrakurikuler ${record.name} ditambahkan.`);
  };

  const updateExtracurricular = (
    id: string,
    patch: Partial<ExtracurricularRecord>
  ) => {
    setExtracurriculars((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
    showToast('success', 'Ekstrakurikuler diperbarui.');
  };

  const deleteExtracurricular = (id: string) => {
    setExtracurriculars((prev) => prev.filter((e) => e.id !== id));
    showToast('info', 'Ekstrakurikuler dihapus.');
  };

  // Ranking calculation
  const setRankingMethod = (method: RankingMethod) => {
    setRankingMethodState(method);
    showToast('info', `Metode pemeringkatan: ${method === 'competition' ? 'Competition Ranking (1,2,2,4)' : 'Dense Ranking (1,2,2,3)'}`);
  };

  const setIncludeIncompleteInRanking = (include: boolean) => {
    setIncludeIncompleteInRankingState(include);
    showToast(
      'info',
      include
        ? 'Siswa dengan nilai belum lengkap diikutsertakan dalam peringkat.'
        : 'Siswa dengan nilai belum lengkap dikecualikan dari peringkat final.'
    );
  };

  const setRankingScoreBasis = (basis: 'summative' | 'average_both') => {
    setRankingScoreBasisState(basis);
    showToast(
      'info',
      basis === 'summative'
        ? 'Dasar rata-rata: Nilai Sumatif (Standar Rapor PTS)'
        : 'Dasar rata-rata: Gabungan Formatif & Sumatif'
    );
  };

  const getClassRankings = (
    classId = selectedClassId,
    periodId = selectedPeriodId
  ): StudentRankSummary[] => {
    const targetStudents = students.filter((s) => s.classId === classId);
    const options: RankingOptions = {
      method: rankingMethod,
      includeIncomplete: includeIncompleteInRanking,
      scoreBasis: rankingScoreBasis,
    };
    return calculateClassRankings(targetStudents, subjects, grades, periodId, options);
  };

  // Print settings
  const updatePrintSettings = (patch: Partial<PrintSettings>) => {
    setPrintSettings((prev) => ({ ...prev, ...patch }));
    if (
      patch.headmasterSignatureHeight !== undefined ||
      patch.headmasterSignatureWidth !== undefined ||
      patch.showHeadmasterSignature !== undefined
    ) {
      setSchoolProfileState((prev) => ({
        ...prev,
        ...(patch.headmasterSignatureHeight !== undefined
          ? { headmasterSignatureHeight: patch.headmasterSignatureHeight }
          : {}),
        ...(patch.headmasterSignatureWidth !== undefined
          ? { headmasterSignatureWidth: patch.headmasterSignatureWidth }
          : {}),
        ...(patch.showHeadmasterSignature !== undefined
          ? { showHeadmasterSignature: patch.showHeadmasterSignature }
          : {}),
      }));
    }
    showToast('success', 'Pengaturan cetak diperbarui.');
  };

  // Backup & Reset
  const exportBackupJson = () => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      schoolProfile,
      periods,
      classes,
      teachers,
      students,
      subjects,
      grades,
      attendances,
      extracurriculars,
      rankingMethod,
      includeIncompleteInRanking,
      rankingScoreBasis,
      printSettings,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const restoreBackupJson = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (!data.schoolProfile || !data.students || !data.classes) {
        throw new Error('Format berkas cadangan (backup) tidak valid.');
      }
      setSchoolProfileState(data.schoolProfile);
      setPeriods(data.periods || initialPeriods);
      setClasses(data.classes || initialClasses);
      setTeachers(data.teachers || initialTeachers);
      setStudents(data.students || initialStudents);
      setSubjects(data.subjects || initialSubjects);
      setGrades(data.grades || initialGrades);
      setAttendances(data.attendances || initialAttendances);
      setExtracurriculars(data.extracurriculars || initialExtracurriculars);
      if (data.rankingMethod) setRankingMethodState(data.rankingMethod);
      if (data.printSettings) setPrintSettings(data.printSettings);
      showToast('success', 'Data cadangan berhasil dipulihkan secara menyeluruh!');
      return true;
    } catch (e: any) {
      showToast('error', `Gagal memulihkan cadangan: ${e.message}`);
      return false;
    }
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setSchoolProfileState(initialSchoolProfile);
    setPeriods(initialPeriods);
    setSelectedPeriodId(initialPeriods[0].id);
    setClasses(initialClasses);
    setSelectedClassId(initialClasses[0].id);
    setTeachers(initialTeachers);
    setStudents(initialStudents);
    setSubjects(initialSubjects);
    setGrades(initialGrades);
    setAttendances(initialAttendances);
    setExtracurriculars(initialExtracurriculars);
    setRankingMethodState('competition');
    setIncludeIncompleteInRankingState(false);
    setRankingScoreBasisState('summative');
    setPrintSettings(initialPrintSettings);
    showToast('info', 'Database dikembalikan ke data awal X TO 4 SMK Muhammadiyah Bawang.');
  };

  return (
    <AppContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        selectedClassId,
        setSelectedClassId,
        selectedPeriodId,
        setSelectedPeriodId,
        dbStatus,
        dbStats,
        forceSaveToDatabase: async () => {
          setDbStatus('saving');
          const ok = await saveDatabaseState({
            schoolProfile,
            periods,
            selectedPeriodId,
            classes,
            selectedClassId,
            teachers,
            students,
            subjects,
            grades,
            attendances,
            extracurriculars,
            printSettings,
            lastUpdated: new Date().toISOString(),
          });
          if (ok) {
            setDbStatus('saved');
            const stats = await getDatabaseStats();
            setDbStats(stats);
            showToast('success', 'Data tersimpan aman ke database IndexedDB.');
          }
          return ok;
        },
        refreshDatabaseStats: async () => {
          const stats = await getDatabaseStats();
          setDbStats(stats);
        },
        createDbSnapshot: async (name: string) => {
          const { id } = await createDatabaseSnapshot(name, {
            schoolProfile,
            periods,
            selectedPeriodId,
            classes,
            selectedClassId,
            teachers,
            students,
            subjects,
            grades,
            attendances,
            extracurriculars,
            printSettings,
            lastUpdated: new Date().toISOString(),
          });
          showToast('success', `Snapshot database "${name}" berhasil dibuat.`);
          return id;
        },
        restoreDbSnapshot: async (id: string) => {
          const restored = await restoreDatabaseSnapshot(id);
          if (restored) {
            if (restored.schoolProfile) setSchoolProfileState(restored.schoolProfile);
            if (restored.periods) setPeriods(restored.periods);
            if (restored.classes) setClasses(restored.classes);
            if (restored.teachers) setTeachers(restored.teachers);
            if (restored.students) setStudents(restored.students);
            if (restored.subjects) setSubjects(restored.subjects);
            if (restored.grades) setGrades(restored.grades);
            if (restored.attendances) setAttendances(restored.attendances);
            if (restored.extracurriculars) setExtracurriculars(restored.extracurriculars);
            if (restored.printSettings) setPrintSettings(restored.printSettings);
            showToast('success', 'Database berhasil dipulihkan dari snapshot.');
            return true;
          }
          showToast('error', 'Gagal memulihkan snapshot database.');
          return false;
        },
        schoolProfile,
        setSchoolProfile,
        updateSchoolProfile,
        periods,
        currentPeriod,
        addPeriod,
        updatePeriod,
        deletePeriod,
        classes,
        selectedClass,
        addClass,
        updateClass,
        deleteClass,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        students,
        classStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        batchAddOrUpdateStudents,
        replaceClassDataFromLegerExcel,
        transferStudentClass,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        reorderSubjects,
        grades,
        saveGrade,
        batchSaveGrades,
        getStudentGrade,
        attendances,
        getAttendance,
        updateAttendance,
        extracurriculars,
        getStudentExtracurriculars,
        addExtracurricular,
        updateExtracurricular,
        deleteExtracurricular,
        rankingMethod,
        setRankingMethod,
        includeIncompleteInRanking,
        setIncludeIncompleteInRanking,
        rankingScoreBasis,
        setRankingScoreBasis,
        getClassRankings,
        printSettings,
        updatePrintSettings,
        selectedStudentIdForReport,
        setSelectedStudentIdForReport,
        toasts,
        showToast,
        dismissToast,
        exportBackupJson,
        restoreBackupJson,
        resetToDefaultData,
        storageUsageKb,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
