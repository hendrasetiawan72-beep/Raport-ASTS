import {
  Student,
  Subject,
  GradeRecord,
  RankingMethod,
  StudentRankSummary,
} from '../types';

export interface RankingOptions {
  method?: RankingMethod; // 'competition' (1,2,2,4) or 'dense' (1,2,2,3)
  includeIncomplete?: boolean;
  scoreBasis?: 'summative' | 'average_both'; // whether PTS ranking is based on summative or average of (formative + summative)
}

/**
 * Calculates student summaries, averages, completeness, and rankings.
 */
export function calculateClassRankings(
  students: Student[],
  subjects: Subject[],
  grades: GradeRecord[],
  periodId: string,
  options: RankingOptions = {}
): StudentRankSummary[] {
  const {
    method = 'competition',
    includeIncomplete = false,
    scoreBasis = 'summative',
  } = options;

  const activeSubjects = subjects.filter((s) => s.isActive);
  const totalSubjectCount = activeSubjects.length;

  // 1. Calculate stats per student
  const summaries: StudentRankSummary[] = students.map((student) => {
    let sumScore = 0;
    let gradedCount = 0;
    let totalFormative = 0;
    let totalSummative = 0;

    activeSubjects.forEach((subject) => {
      const grade = grades.find(
        (g) =>
          g.studentId === student.id &&
          g.subjectId === subject.id &&
          g.periodId === periodId
      );

      if (grade) {
        if (typeof grade.formativeScore === 'number' && !isNaN(grade.formativeScore)) {
          totalFormative += grade.formativeScore;
        }
        if (typeof grade.summativeScore === 'number' && !isNaN(grade.summativeScore)) {
          totalSummative += grade.summativeScore;
        }

        // Determine valid numeric score for this subject
        let validScore: number | null = null;
        if (scoreBasis === 'summative') {
          if (typeof grade.summativeScore === 'number' && !isNaN(grade.summativeScore)) {
            validScore = grade.summativeScore;
          }
        } else {
          // average of formative and summative if available
          const hasForm = typeof grade.formativeScore === 'number' && !isNaN(grade.formativeScore);
          const hasSum = typeof grade.summativeScore === 'number' && !isNaN(grade.summativeScore);
          if (hasForm && hasSum) {
            validScore = (grade.formativeScore! + grade.summativeScore!) / 2;
          } else if (hasSum) {
            validScore = grade.summativeScore;
          } else if (hasForm) {
            validScore = grade.formativeScore;
          }
        }

        if (validScore !== null) {
          sumScore += validScore;
          gradedCount += 1;
        }
      }
    });

    const averageScore = gradedCount > 0 ? parseFloat((sumScore / gradedCount).toFixed(2)) : 0;
    const missingCount = Math.max(0, totalSubjectCount - gradedCount);
    const isComplete = totalSubjectCount > 0 && gradedCount === totalSubjectCount;

    return {
      studentId: student.id,
      student,
      totalSummative,
      totalFormative,
      averageScore,
      gradedCount,
      totalSubjects: totalSubjectCount,
      missingCount,
      isComplete,
      rank: 0,
    };
  });

  // 2. Separate eligible students for ranking based on completeness preference
  // If includeIncomplete is true, anyone with at least 1 graded subject gets ranked.
  // Otherwise, only completely graded students get ranked.
  const eligible = summaries.filter((s) =>
    includeIncomplete ? s.gradedCount > 0 : s.isComplete
  );

  // Sort descending by average score
  eligible.sort((a, b) => b.averageScore - a.averageScore);

  // 3. Assign ranks using chosen algorithm
  let currentCompetitionRank = 1;
  let currentDenseRank = 1;

  for (let i = 0; i < eligible.length; i++) {
    if (i > 0) {
      if (eligible[i].averageScore === eligible[i - 1].averageScore) {
        // Tied with previous
        eligible[i].rank = eligible[i - 1].rank;
      } else {
        // Score differs
        if (method === 'competition') {
          currentCompetitionRank = i + 1;
          eligible[i].rank = currentCompetitionRank;
        } else {
          currentDenseRank += 1;
          eligible[i].rank = currentDenseRank;
        }
      }
    } else {
      eligible[i].rank = 1;
    }
  }

  // 4. Update the summaries with calculated ranks (unranked students remain 0 / unranked)
  const rankMap = new Map<string, number>();
  eligible.forEach((e) => rankMap.set(e.studentId, e.rank));

  summaries.forEach((s) => {
    s.rank = rankMap.get(s.studentId) || 0;
  });

  return summaries;
}
