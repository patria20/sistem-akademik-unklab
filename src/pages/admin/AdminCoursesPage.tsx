import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import type { Course } from '../../types/academic';
import { BookOpen, Plus, Search, CheckCircle2, X } from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const { courses, addNewCourse } = useAcademic();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New course form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState(5);
  const [category, setCategory] = useState<'Wajib Prodi' | 'Wajib Universitas' | 'Pilihan' | 'Tugas Akhir'>('Wajib Prodi');
  const [description, setDescription] = useState('');

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const newCrs: Course = {
      id: `crs_${code.toLowerCase()}_${Date.now()}`,
      code: code.toUpperCase(),
      name,
      nameEn,
      credits,
      semester,
      curriculumYear: 2024,
      prerequisites: [],
      isMandatory: true,
      category,
      description,
    };

    addNewCourse(newCrs);
    setIsModalOpen(false);
    setCode('');
    setName('');
    setNameEn('');
    setDescription('');
    setSuccessToast(`Mata kuliah ${newCrs.code} - ${newCrs.name} berhasil ditambahkan ke kurikulum.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Katalog Mata Kuliah & Peta Kurikulum"
        subtitle="Struktur kurikulum resmi Program Studi Informatika, Fakultas Ilmu Komputer UNKLAB"
        breadcrumbs={[
          { label: 'Administrator', path: '/admin/dashboard' },
          { label: 'Katalog Mata Kuliah' },
        ]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Mata Kuliah
          </button>
        }
      />

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kode atau nama mata kuliah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
        />
      </div>

      {/* Courses Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] bg-slate-50">
                <th className="py-3 px-4">Kode MK</th>
                <th className="py-3 px-4">Nama Mata Kuliah</th>
                <th className="py-3 px-4 text-center">SKS</th>
                <th className="py-3 px-4 text-center">Semester Paket</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Prasyarat Kelulusan</th>
                <th className="py-3 px-4">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{c.code}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-[10px] text-slate-400 italic">{c.nameEn}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-600">{c.credits}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600">Sem {c.semester}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                    {c.prerequisites.length === 0 ? (
                      <span className="text-slate-400">-</span>
                    ) : (
                      c.prerequisites
                        .map((pid) => courses.find((item) => item.id === pid)?.code || pid)
                        .join(', ')
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Tambah Mata Kuliah Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Kode MK:</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: IF405"
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Jumlah SKS:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Nama Mata Kuliah (Indonesia):</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pemrosesan Bahasa Alami"
                  className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Nama Bahasa Inggris:</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Contoh: Natural Language Processing"
                  className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Semester Paket:</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Kategori:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value="Wajib Prodi">Wajib Prodi</option>
                    <option value="Wajib Universitas">Wajib Universitas</option>
                    <option value="Pilihan">Pilihan</option>
                    <option value="Tugas Akhir">Tugas Akhir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Deskripsi Singkat:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 mt-1 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Simpan Mata Kuliah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
