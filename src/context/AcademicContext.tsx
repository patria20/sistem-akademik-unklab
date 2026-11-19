  const activeStudent = students.find(
    (student) => student.userId === user?.id
  );

  const activeLecturer = lecturers.find(
    (lecturer) => lecturer.userId === user?.id
  ) || (user?.role === 'lecturer' ? lecturers[0] : undefined);

  const activeKrs = activeStudent
    ? [...studyPlans].reverse().find(
        (plan) =>
          plan.studentId === activeStudent.id &&
          plan.semester === activeStudent.currentSemester &&
          plan.academicYear === activeStudent.academicYear
      )
    : undefined;