import type { StudentProfile, Course, GradeRecord } from '../types/academic';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  disclaimer?: string;
}

export class AIAcademicService {
  /**
   * Generates intelligent, context-aware academic advisory responses.
   * Deterministically references UNKLAB academic rules and curriculum graph.
   */
  static async queryAssistant(
    userPrompt: string,
    student: StudentProfile,
    allCourses: Course[],
    passedGrades: GradeRecord[]
  ): Promise<AIMessage> {
    // Simulated processing latency for authentic feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const prompt = userPrompt.toLowerCase();
    const passedCourseIds = passedGrades.filter((g) => g.isPassed).map((g) => g.courseId);

    let answer = '';
    const sources: string[] = ['Buku Pedoman Akademik Universitas Klabat 2024-2028'];

    if (prompt.includes('rekomendasi') || prompt.includes('ambil apa') || prompt.includes('rencana studi') || prompt.includes('semester')) {
      // Find courses for next semester where prerequisites are satisfied
      const nextSemester = student.currentSemester;
      const candidates = allCourses.filter(
        (c) => c.semester === nextSemester && !passedCourseIds.includes(c.id)
      );

      const available = candidates.filter((c) =>
        c.prerequisites.every((req) => passedCourseIds.includes(req))
      );

      const blocked = candidates.filter((c) =>
        !c.prerequisites.every((req) => passedCourseIds.includes(req))
      );

      answer = `Halo ${student.name}! Berdasarkan evaluasi riwayat akademik Anda (IPK ${student.cumulativeGpa}, IPS lalu ${student.lastSemesterGpa}, SKS Lulus: ${student.creditsEarned} SKS):

1. **Batas Beban SKS Anda:** Anda berhak mengambil hingga **${student.maxCreditLimit} SKS** pada semester ini karena IPS Anda ≥ 3.00.
2. **Mata Kuliah Rekomendasi Utama (Semester ${nextSemester}):**
${available.map((c) => `   - **${c.code} ${c.name}** (${c.credits} SKS)`).join('\n')}

${blocked.length > 0 ? `3. **Mata Kuliah Terhalang Prasyarat:**\n${blocked.map((c) => `   - ${c.code} ${c.name} (memerlukan prasyarat yang belum lulus)`).join('\n')}\n` : ''}
Saran Strategis: Prioritaskan mata kuliah wajib prodi dan konsultasikan draft KRS Anda dengan Dosen PA (${student.academicAdvisorName}).`;
      sources.push('Struktur Kurikulum Program Studi Informatika UNKLAB 2024');
    } else if (prompt.includes('prasyarat') || prompt.includes('syarat')) {
      answer = `Aturan Prasyarat di Fakultas Ilmu Komputer UNKLAB:
- **Kecerdasan Buatan (IF401)** mensyaratkan kelulusan **Struktur Data (IF201)** minimal nilai C.
- **Mobile Programming (IF402)** mensyaratkan kelulusan **Pemrograman Web (IF302)**.
- **Keamanan Siber (IF404)** mensyaratkan kelulusan **Jaringan Komputer (IF303)** dan **Sistem Operasi (IF304)**.
- **Proyek Akhir 1 (IF498)** mensyaratkan minimal 100 SKS lulus dan kelulusan mata kuliah **Rekayasa Perangkat Lunak (IF301)**.`;
      sources.push('Katalog Mata Kuliah & Peta Prasyarat Fasilkom UNKLAB');
    } else if (prompt.includes('sks') || prompt.includes('batas') || prompt.includes('ipk') || prompt.includes('ip')) {
      answer = `Berdasarkan Peraturan Akademik Universitas Klabat:
- **IPS ≥ 3.00:** Maksimal 24 SKS
- **IPS 2.50 - 2.99:** Maksimal 21 SKS
- **IPS 2.00 - 2.49:** Maksimal 18 SKS
- **IPS < 2.00:** Maksimal 15 SKS

Status Anda saat ini: IPS lalu **${student.lastSemesterGpa}**, sehingga batas maksimal Anda adalah **${student.maxCreditLimit} SKS**.`;
      sources.push('Peraturan Beban SKS Bab IV Pasal 12');
    } else if (prompt.includes('krs') || prompt.includes('jadwal') || prompt.includes('batal') || prompt.includes('revisi')) {
      answer = `Alur Pengisian KRS Semester:
1. Mahasiswa menyusun rencana studi melalui menu **KRS Builder**.
2. Sistem secara deterministik memvalidasi batas SKS, ketiadaan bentrok waktu kuliah, dan pemenuhan prasyarat.
3. Mahasiswa mengirimkan (*submit*) KRS ke Dosen Pembimbing Akademik (**${student.academicAdvisorName}**).
4. Dosen PA akan meninjau dan memberikan status **Approved** atau **Revision Required**.
5. Setelah disetujui, nama mahasiswa otomatis masuk ke daftar hadir resmi kelas.`;
      sources.push('Panduan Alur Registrasi Akademik SIAM-UNKLAB');
    } else {
      answer = `Terima kasih atas pertanyaan Anda mengenai "${userPrompt}". 
Saya dapat membantu Anda memberikan informasi terverifikasi mengenai:
- Rekomendasi mata kuliah semester berikutnya
- Pengecekan status prasyarat & kurikulum
- Simulasi perhitungan SKS & estimasi kelulusan
- Kebijakan akademik dan konsultasi dosen pembimbing.

Silakan pilih topik di atas atau ajukan pertanyaan spesifik terkait rencana studi Anda.`;
    }

    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources,
      disclaimer: '[DATA SIMULASI AI] Rekomendasi ini bersifat bantuan konsultatif. Keputusan final akademik tetap berada pada Dosen PA dan Dekanat UNKLAB.',
    };
  }
}
