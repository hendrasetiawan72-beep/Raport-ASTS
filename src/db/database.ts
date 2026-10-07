/**
 * Persistent IndexedDB Database Engine for Raport ASTS
 * Provides safe, structured, high-capacity client-side persistence for school profiles,
 * students, grades, attendances, extracurriculars, images, and backups.
 */

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

const DB_NAME = 'RaportASTS_DB';
const DB_VERSION = 2;

export interface DatabaseState {
  schoolProfile: SchoolProfile;
  periods: AcademicPeriod[];
  selectedPeriodId: string;
  classes: ClassGroup[];
  selectedClassId: string;
  teachers: Teacher[];
  students: Student[];
  subjects: Subject[];
  grades: GradeRecord[];
  attendances: AttendanceRecord[];
  extracurriculars: ExtracurricularRecord[];
  printSettings: PrintSettings;
  lastUpdated: string;
}

export interface DatabaseStats {
  connected: boolean;
  dbVersion: number;
  totalRecords: number;
  approxSizeKb: number;
  lastSaved: string;
  stores: { [key: string]: number };
}

let dbInstance: IDBDatabase | null = null;

export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      const storeNames = [
        'app_state',
        'school_profile',
        'periods',
        'classes',
        'teachers',
        'students',
        'subjects',
        'grades',
        'attendances',
        'extracurriculars',
        'print_settings',
        'backups',
      ];

      storeNames.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Failed to open IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

/**
 * Saves the entire application state safely into IndexedDB in a single transaction.
 */
export const saveDatabaseState = async (state: DatabaseState): Promise<boolean> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        [
          'app_state',
          'school_profile',
          'periods',
          'classes',
          'teachers',
          'students',
          'subjects',
          'grades',
          'attendances',
          'extracurriculars',
          'print_settings',
        ],
        'readwrite'
      );

      tx.onerror = () => {
        console.error('Transaction error during saveDatabaseState', tx.error);
        reject(tx.error);
      };

      tx.oncomplete = () => {
        resolve(true);
      };

      // 1. Save master state envelope
      const appStateStore = tx.objectStore('app_state');
      appStateStore.put({
        id: 'current_state',
        selectedPeriodId: state.selectedPeriodId,
        selectedClassId: state.selectedClassId,
        lastUpdated: new Date().toISOString(),
      });

      // 2. School Profile
      const schoolStore = tx.objectStore('school_profile');
      schoolStore.put({ ...state.schoolProfile, id: state.schoolProfile.id || 'main' });

      // 3. Print Settings
      const printStore = tx.objectStore('print_settings');
      printStore.put({ id: 'main', ...state.printSettings });

      // 4. Batch items for stores
      const updateCollection = (storeName: string, items: any[]) => {
        const store = tx.objectStore(storeName);
        store.clear();
        items.forEach((item) => store.put(item));
      };

      updateCollection('periods', state.periods);
      updateCollection('classes', state.classes);
      updateCollection('teachers', state.teachers);
      updateCollection('students', state.students);
      updateCollection('subjects', state.subjects);
      updateCollection('grades', state.grades);
      updateCollection('attendances', state.attendances);
      updateCollection('extracurriculars', state.extracurriculars);
    });
  } catch (err) {
    console.error('saveDatabaseState error:', err);
    return false;
  }
};

/**
 * Loads all data from IndexedDB. Returns null if database is empty.
 */
export const loadDatabaseState = async (): Promise<Partial<DatabaseState> | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(
        [
          'app_state',
          'school_profile',
          'periods',
          'classes',
          'teachers',
          'students',
          'subjects',
          'grades',
          'attendances',
          'extracurriculars',
          'print_settings',
        ],
        'readonly'
      );

      let appStateReq = tx.objectStore('app_state').get('current_state');
      let schoolReq = tx.objectStore('school_profile').get('main');
      let printReq = tx.objectStore('print_settings').get('main');
      let periodsReq = tx.objectStore('periods').getAll();
      let classesReq = tx.objectStore('classes').getAll();
      let teachersReq = tx.objectStore('teachers').getAll();
      let studentsReq = tx.objectStore('students').getAll();
      let subjectsReq = tx.objectStore('subjects').getAll();
      let gradesReq = tx.objectStore('grades').getAll();
      let attendancesReq = tx.objectStore('attendances').getAll();
      let extracurricularsReq = tx.objectStore('extracurriculars').getAll();

      tx.oncomplete = () => {
        // If no students and no school profile, consider empty
        if (!schoolReq.result && (!studentsReq.result || studentsReq.result.length === 0)) {
          resolve(null);
          return;
        }

        const state: Partial<DatabaseState> = {
          schoolProfile: schoolReq.result ? (({ id, ...rest }: any) => rest)(schoolReq.result) : undefined,
          printSettings: printReq.result ? (({ id, ...rest }: any) => rest)(printReq.result) : undefined,
          periods: periodsReq.result || [],
          classes: classesReq.result || [],
          teachers: teachersReq.result || [],
          students: studentsReq.result || [],
          subjects: subjectsReq.result || [],
          grades: gradesReq.result || [],
          attendances: attendancesReq.result || [],
          extracurriculars: extracurricularsReq.result || [],
          selectedPeriodId: appStateReq.result?.selectedPeriodId,
          selectedClassId: appStateReq.result?.selectedClassId,
          lastUpdated: appStateReq.result?.lastUpdated || new Date().toISOString(),
        };

        resolve(state);
      };

      tx.onerror = () => {
        console.warn('Transaction error during loadDatabaseState', tx.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('loadDatabaseState failed, fallback to defaults:', err);
    return null;
  }
};

/**
 * Creates an independent snapshot point stored in the database.
 */
export const createDatabaseSnapshot = async (
  name: string,
  state: DatabaseState
): Promise<{ id: string; timestamp: string }> => {
  const db = await openDatabase();
  const id = `snapshot_${Date.now()}`;
  const timestamp = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['backups'], 'readwrite');
    const store = tx.objectStore('backups');
    const record = {
      id,
      name,
      timestamp,
      data: state,
    };
    const req = store.put(record);
    req.onsuccess = () => resolve({ id, timestamp });
    req.onerror = () => reject(req.error);
  });
};

/**
 * Retrieves all stored snapshots.
 */
export const listDatabaseSnapshots = async (): Promise<Array<{ id: string; name: string; timestamp: string }>> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(['backups'], 'readonly');
      const store = tx.objectStore('backups');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []).map((r) => ({
          id: r.id,
          name: r.name,
          timestamp: r.timestamp,
        }));
        resolve(list.reverse());
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

/**
 * Restores a snapshot by ID.
 */
export const restoreDatabaseSnapshot = async (id: string): Promise<DatabaseState | null> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(['backups'], 'readonly');
      const store = tx.objectStore('backups');
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/**
 * Computes storage metrics for the database.
 */
export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const stores = [
        'students',
        'grades',
        'attendances',
        'extracurriculars',
        'teachers',
        'classes',
        'subjects',
        'periods',
      ];
      const tx = db.transaction(stores, 'readonly');
      const counts: { [key: string]: number } = {};
      let total = 0;

      stores.forEach((storeName) => {
        const req = tx.objectStore(storeName).count();
        req.onsuccess = () => {
          counts[storeName] = req.result;
          total += req.result;
        };
      });

      tx.oncomplete = () => {
        // Approximate size
        const estKb = Math.round(total * 0.45 * 10) / 10;
        resolve({
          connected: true,
          dbVersion: DB_VERSION,
          totalRecords: total,
          approxSizeKb: estKb,
          lastSaved: new Date().toLocaleTimeString('id-ID'),
          stores: counts,
        });
      };

      tx.onerror = () => {
        resolve({
          connected: false,
          dbVersion: DB_VERSION,
          totalRecords: 0,
          approxSizeKb: 0,
          lastSaved: '-',
          stores: {},
        });
      };
    });
  } catch {
    return {
      connected: false,
      dbVersion: DB_VERSION,
      totalRecords: 0,
      approxSizeKb: 0,
      lastSaved: '-',
      stores: {},
    };
  }
};
