import React, { useMemo, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, Save, Users, XCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAcademic } from '../../context/AcademicContext';
import type { AttendanceRecord } from '../../types/academic';

type AttendanceInputStatus = AttendanceRecord['status'] | '';

const getLocalDate = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

const correctionStatusLabel: Record<NonNullable<AttendanceRecord['correctionStatus']>, string> = {
  none: 'Tidak ada koreksi',
  pending: 'Menunggu Tinjauan',
  approved: 'Koreksi Disetujui',
  rejected: 'Koreksi Ditolak',
};

const correctionStatusStyle: Record<NonNullable<AttendanceRecord['correctionStatus']>, string> = {
  none: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export const LecturerAttendancePage: React.FC = () => {
  const {
    activeLecturer,
    attendances,
    approveAttendanceCorrection,
    classes,
    saveAttendanceRecords,
    students,
    studyPlans,
  } = useAcademic();
  const lecturerClasses = useMemo(
    () => classes.filter((courseClass) => courseClass.lecturerId === activeLecturer?.id),
    [activeLecturer?.id, classes]
  );
  const [selectedClassId, setSelectedClassId] = useState('');
  const [meetingNumber, setMeetingNumber] = useState('1');
  const [sessionDate, setSessionDate] = useState(getLocalDate);
  const [attendanceInputBySession, setAttendanceInputBySession] = useState<
    Record<string, Record<string, AttendanceInputStatus>>
  >({});
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const currentClass =
    lecturerClasses.find((courseClass) => courseClass.id === selectedClassId) ?? lecturerClasses[0];
  const selectedMeeting = Number(meetingNumber);

  const enrolledStudents = useMemo(() => {
    if (!currentClass) return [];

    const roster = new Map<string, (typeof students)[number]>();
    studyPlans.forEach((plan) => {
      if (plan.status !== 'approved') return;
      const student = students.find((candidate) => candidate.id === plan.studentId);
      if (
        student &&
        plan.academicYear === student.academicYear &&
        plan.semester === student.currentSemester &&
        plan.items.some((item) => item.classId === currentClass.id)
      ) {
        roster.set(student.id, student);
      }
    });

    return Array.from(roster.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [currentClass, students, studyPlans]);

  const sessionRecords = useMemo(
    () =>
      attendances.filter(
        (record) =>
          record.classId === currentClass?.id &&
          record.meetingNumber === selectedMeeting &&
          record.date === sessionDate
      ),
    [attendances, currentClass?.id, selectedMeeting, sessionDate]
  );
  const recordByStudentId = useMemo(
    () => new Map(sessionRecords.map((record) => [record.studentId, record])),
    [sessionRecords]
  );
  const sessionKey = `${currentClass?.id ?? ''}:${selectedMeeting}:${sessionDate}`;
  const savedAttendanceInputs = useMemo(
    () =>
      Object.fromEntries(
        enrolledStudents.map((student) => [
          student.id,
          recordByStudentId.get(student.id)?.status ?? '',
        ])
      ),
    [enrolledStudents, recordByStudentId]
  );
  const attendanceInputs = attendanceInputBySession[sessionKey] ?? savedAttendanceInputs;

  if (!activeLecturer) return null;

  const classAttendances = attendances.filter((record) =>
    lecturerClasses.some((courseClass) => courseClass.id === record.classId)
  );
  const currentClassAttendances = classAttendances.filter(
    (record) => record.classId === currentClass?.id
  );
  const pendingCorrections = currentClassAttendances.filter(
    (record) => record.correctionStatus === 'pending'
  );
  const sessionStatuses = enrolledStudents.map(
    (student) => attendanceInputs[student.id] ?? recordByStudentId.get(student.id)?.status ?? ''
  );
  const hadirCount = sessionStatuses.filter((status) => status === 'hadir').length;
  const terlambatCount = sessionStatuses.filter((status) => status === 'terlambat').length;
  const alpaCount = sessionStatuses.filter((status) => status === 'alpa').length;
  const attendancePercentage =
    enrolledStudents.length > 0
      ? Math.round(((hadirCount + terlambatCount) / enrolledStudents.length) * 100)
      : 0;

  const handleDecision = (record: AttendanceRecord, approved: boolean) => {
    approveAttendanceCorrection(record.id, approved);
    setSuccessToast(
      approved
        ? `Koreksi presensi untuk ${record.studentName} disetujui.`
        : `Koreksi presensi untuk ${record.studentName} ditolak.`
    );
    window.setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSaveAttendance = () => {
    if (!currentClass || enrolledStudents.length === 0) return;
    if (!Number.isInteger(selectedMeeting) || selectedMeeting < 1 || selectedMeeting > 16) {
      setValidationMessage('Nomor pertemuan harus antara 1 dan 16.');
      return;
    }

    const missingStudent = enrolledStudents.find((student) => !attendanceInputs[student.id]);
    if (missingStudent) {
      setValidationMessage(`Pilih status presensi untuk ${missingStudent.name} sebelum menyimpan.`);
      return;
    }

    const records: AttendanceRecord[] = enrolledStudents.map((student) => {
      const existing = recordByStudentId.get(student.id);
      return {
        id: existing?.id ?? `att_${currentClass.id}_${student.id}_${selectedMeeting}_${sessionDate}`,
        studentId: student.id,
        studentNim: student.nim,
        studentName: student.name,
        classId: currentClass.id,
        courseName: currentClass.courseName,
        meetingNumber: selectedMeeting,
        date: sessionDate,
        status: attendanceInputs[student.id] as AttendanceRecord['status'],
        ...(existing?.correctionRequested ? { correctionRequested: existing.correctionRequested } : {}),
        ...(existing?.correctionReason ? { correctionReason: existing.correctionReason } : {}),
        ...(existing?.correctionStatus ? { correctionStatus: existing.correctionStatus } : {}),
      };
    });

    saveAttendanceRecords(records);
    setSuccessToast(`Presensi pertemuan ${selectedMeeting} kelas ${currentClass.courseName} berhasil disimpan.`);
    setValidationMessage(null);
    window.setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presensi & Rekap Kehadiran"
        subtitle="Catat kehadiran mahasiswa pada kelas yang Anda ampu dan kelola pengajuan koreksi."
        breadcrumbs={[
          { label: 'Dosen', path: '/lecturer/dashboard' },
          { label: 'Presensi & Absensi' },
        ]}
      />

      {successToast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="space-y-1.5 text-xs font-semibold text-slate-700">
              <span>Kelas yang diampu</span>
              <select
                value={currentClass?.id ?? ''}
                onChange={(event) => {
                  setSelectedClassId(event.target.value);
                  setValidationMessage(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs"
                disabled={lecturerClasses.length === 0}
              >
                {lecturerClasses.map((courseClass) => (
                  <option key={courseClass.id} value={courseClass.id}>
                    {courseClass.courseCode} - {courseClass.courseName} ({courseClass.section})
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-700">
              <span>Pertemuan (1-16)</span>
              <input
                type="number"
                min={1}
                max={16}
                value={meetingNumber}
                onChange={(event) => {
                  setMeetingNumber(event.target.value);
                  setValidationMessage(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs"
              />
            </label>
            <label className="space-y-1.5 text-xs font-semibold text-slate-700">
              <span>Tanggal pertemuan</span>
              <input
                type="date"
                value={sessionDate}
                onChange={(event) => {
                  setSessionDate(event.target.value);
                  setValidationMessage(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={!currentClass || enrolledStudents.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save className="h-4 w-4" />
            Simpan Presensi
          </button>
        </div>

        {validationMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {validationMessage}
          </div>
        )}

        {!currentClass ? (
          <div className="rounded-xl bg-slate-50 p-8 text-center text-xs text-slate-500">
            Belum ada kelas yang diampu oleh dosen ini.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500">Mahasiswa terdaftar</p>
                <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-slate-800">
                  <Users className="h-4 w-4 text-blue-600" />
                  {enrolledStudents.length}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-[11px] font-medium text-emerald-700">Hadir</p>
                <p className="mt-1 text-lg font-bold text-emerald-800">{hadirCount}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <p className="text-[11px] font-medium text-amber-700">Terlambat</p>
                <p className="mt-1 text-lg font-bold text-amber-800">{terlambatCount}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-[11px] font-medium text-red-700">Alpa</p>
                <p className="mt-1 text-lg font-bold text-red-800">{alpaCount}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-blue-50 p-3 lg:col-span-1">
                <p className="text-[11px] font-medium text-blue-700">Persentase kehadiran</p>
                <p className="mt-1 text-lg font-bold text-blue-800">{attendancePercentage}%</p>
                <p className="text-[10px] text-blue-700">Hadir + terlambat / terdaftar</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                    <th className="px-3 py-3">No</th>
                    <th className="px-3 py-3">Mahasiswa</th>
                    <th className="px-3 py-3">NIM</th>
                    <th className="px-3 py-3">Status kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrolledStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-3 text-slate-400">{index + 1}</td>
                      <td className="px-3 py-3 font-semibold text-slate-800">{student.name}</td>
                      <td className="px-3 py-3 font-mono text-slate-600">{student.nim}</td>
                      <td className="px-3 py-3">
                        <select
                          aria-label={`Status presensi ${student.name}`}
                          value={attendanceInputs[student.id] ?? ''}
                          onChange={(event) => {
                            setAttendanceInputBySession((current) => ({
                              ...current,
                              [sessionKey]: {
                                ...(current[sessionKey] ?? attendanceInputs),
                                [student.id]: event.target.value as AttendanceInputStatus,
                              },
                            }));
                            setValidationMessage(null);
                          }}
                          className="min-w-36 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs"
                        >
                          <option value="">Pilih status</option>
                          <option value="hadir">Hadir</option>
                          <option value="terlambat">Terlambat</option>
                          <option value="alpa">Alpa</option>
                          <option value="izin">Izin (data lama)</option>
                          <option value="sakit">Sakit (data lama)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {enrolledStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-10 text-center text-slate-500">
                        Belum ada mahasiswa dengan KRS yang disetujui pada kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {currentClass && (
        <>
          <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#142B4A]">
                  Koreksi Presensi Menunggu Tindakan ({pendingCorrections.length})
                </h2>
                <p className="text-xs text-slate-500">
                  {currentClass.courseName} ({currentClass.section})
                </p>
              </div>
              {pendingCorrections.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                  Perlu Respon
                </span>
              )}
            </div>

            {pendingCorrections.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500">
                Tidak ada pengajuan koreksi yang menunggu tindakan untuk kelas ini.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCorrections.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/30 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-900">
                        {record.studentName}{' '}
                        <span className="font-mono font-normal text-slate-500">
                          ({record.studentNim})
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Pertemuan #{record.meetingNumber} ({record.date}) · Status tercatat:{' '}
                        <StatusBadge status={record.status} size="sm" />
                      </p>
                      <p className="rounded-lg border border-slate-200 bg-white p-2 text-[11px] italic text-slate-700">
                        Alasan: {record.correctionReason || 'Tidak ada alasan yang diberikan.'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecision(record, false)}
                        className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Tolak Koreksi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(record, true)}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Setujui (Hadir)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-sm font-bold text-[#142B4A]">Riwayat Presensi Kelas</h2>
              <p className="text-xs text-slate-500">
                {currentClass.courseName} ({currentClass.section})
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                    <th className="px-4 py-3">Mahasiswa</th>
                    <th className="px-4 py-3">Pertemuan & tanggal</th>
                    <th className="px-4 py-3 text-center">Kehadiran</th>
                    <th className="px-4 py-3">Status koreksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentClassAttendances
                    .sort(
                      (a, b) =>
                        b.date.localeCompare(a.date) || b.meetingNumber - a.meetingNumber
                    )
                    .map((record) => {
                      const correctionStatus = record.correctionStatus ?? 'none';
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800">{record.studentName}</p>
                            <p className="font-mono text-[10px] text-slate-500">{record.studentNim}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              Pertemuan #{record.meetingNumber} · {record.date}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={record.status} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${correctionStatusStyle[correctionStatus]}`}
                            >
                              {correctionStatus === 'approved' ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : correctionStatus === 'rejected' ? (
                                <XCircle className="h-3 w-3" />
                              ) : correctionStatus === 'pending' ? (
                                <Clock className="h-3 w-3" />
                              ) : null}
                              {correctionStatusLabel[correctionStatus]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  {currentClassAttendances.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                        Belum ada riwayat presensi untuk kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
