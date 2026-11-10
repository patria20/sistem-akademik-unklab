import React, { useState, useRef, useEffect } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PageHeader } from '../../components/common/PageHeader';
import { AIAcademicService } from '../../services/aiAcademicService';
import type { AIMessage } from '../../services/aiAcademicService';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Info,
  ShieldCheck,
  User,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { activeStudent, courses, grades } = useAcademic();

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: `Halo ${activeStudent?.name || 'Mahasiswa'}! Saya adalah **AI Academic Assistant SIAM-UNKLAB**. 
Saya dapat membantu Anda merencanakan studi, memeriksa pemenuhan prasyarat kurikulum, dan memberikan rekomendasi rencana KRS semester berikutnya berdasarkan capaian akademik Anda (IPK ${activeStudent?.cumulativeGpa}, SKS Lulus ${activeStudent?.creditsEarned}).

Silakan pilih topik cepat di bawah ini atau ketikkan pertanyaan akademik Anda.`,
      timestamp: '09:00',
      sources: ['Buku Panduan Akademik UNKLAB 2024'],
      disclaimer: '[DATA SIMULASI AI] Rekomendasi ini bersifat konsultatif. Keputusan resmi tetap disetujui oleh Dosen Pembina Akademik.',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    'Rekomendasi mata kuliah untuk semester saya berikutnya',
    'Berapa batas maksimal SKS yang boleh saya ambil?',
    'Apa saja prasyarat untuk mata kuliah Kecerdasan Buatan & Mobile?',
    'Apakah saya sudah memenuhi syarat untuk Skripsi / Proyek Akhir?',
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading || !activeStudent) return;

    const userMsg: AIMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const aiResponse = await AIAcademicService.queryAssistant(
        prompt,
        activeStudent,
        courses,
        grades
      );
      setMessages((prev) => [...prev, aiResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'Maaf, sistem AI sedang sibuk. Silakan coba kembali dalam beberapa saat.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="AI Academic Assistant"
        subtitle="Asisten Perencanaan Studi Cerdas & Penelaah Aturan Kurikulum Informatika UNKLAB"
        breadcrumbs={[
          { label: 'Mahasiswa', path: '/student/dashboard' },
          { label: 'AI Assistant' },
        ]}
      />

      {/* Boundary & Responsibility Warning Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="font-bold">Model Layanan AI Akademik Bertanggung Jawab</p>
          <p className="text-indigo-700 text-[11px] leading-relaxed">
            AI didesain semata-mata untuk konsultasi perencanaan studi dan pencocokan kurikulum. AI{' '}
            <strong>tidak memiliki hak</strong> untuk memvalidasi atau menyetujui KRS secara resmi, mengubah nilai, atau memutasi presensi. Seluruh keputusan legal perkuliahan disahkan oleh Dosen PA.
          </p>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[580px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                SIAM Academic Copilot
                <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 text-[9px] font-bold">
                  SIMULASI AKTIF
                </span>
              </h3>
              <p className="text-[10px] text-slate-500">Kontekstual: {activeStudent?.name} ({activeStudent?.nim})</p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Siap Menjawab
          </span>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-blue-600 text-white font-bold text-xs'
                      : 'bg-[#142B4A] text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs space-y-2 shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                      <p className="font-semibold text-slate-700">Rujukan Resmi:</p>
                      {msg.sources.map((s, idx) => (
                        <p key={idx} className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          <span>{s}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {msg.disclaimer && (
                    <p className="text-[9px] text-slate-400 italic pt-1">{msg.disclaimer}</p>
                  )}

                  <p
                    className={`text-[9px] text-right ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-sm items-center">
              <div className="w-8 h-8 rounded-full bg-[#142B4A] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] ml-1">AI sedang menganalisis kurikulum & prasyarat...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Saran Topik:
          </span>
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] whitespace-nowrap transition-colors border border-slate-200/60"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Tanyakan rekomendasi KRS, aturan SKS, atau prasyarat mata kuliah..."
              className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
