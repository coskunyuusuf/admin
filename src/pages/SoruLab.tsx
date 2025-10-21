import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { sorulabAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  BeakerIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface SoruLab {
  sorulab_id: string;
  topic: string;
  description: string;
  slug: string;
  questions_count: number;
  keywords_count: number;
  mode: string;
  difficulty: string;
  question_type: string;
  course_id: string;
  created_at: string;
  in_qdrant: boolean;
}

const SoruLab: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSoruLab, setEditingSoruLab] = useState<SoruLab | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    qa_count: 20,
    mode: 'both',
    difficulty: 'medium',
    question_type: 'mixed',
    course_id: '',
    auto_keywords: true,
    keyword_count: 30,
    add_to_chatbot: true,
    language: 'tr',
  });

  const { data: sorulabData, isLoading } = useQuery('sorulab-sets', () =>
    sorulabAPI.listSorulabSets()
  );

  const sorulabSets = Array.isArray(sorulabData?.data)
    ? sorulabData.data
    : (sorulabData?.data?.data || []);

  const createSorulabMutation = useMutation(
    (data: any) => sorulabAPI.createSorulab(data),
    {
      onSuccess: (response) => {
        toast.success(
          `SoruLab başarıyla oluşturuldu! ${response.data.questions_count} soru eklendi.`
        );
        queryClient.invalidateQueries('sorulab-sets');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'SoruLab oluşturulurken hata oluştu');
      },
    }
  );

  const updateSorulabMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => 
      sorulabAPI.updateSorulab ? sorulabAPI.updateSorulab(id, data) : Promise.reject('Update not implemented'),
    {
      onSuccess: () => {
        toast.success('SoruLab başarıyla güncellendi!');
        queryClient.invalidateQueries('sorulab-sets');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'SoruLab güncellenirken hata oluştu');
      },
    }
  );

  const deleteSorulabMutation = useMutation(
    (id: string) => sorulabAPI.deleteSorulab(id),
    {
      onSuccess: () => {
        toast.success('SoruLab başarıyla silindi');
        queryClient.invalidateQueries('sorulab-sets');
      },
      onError: () => {
        toast.error('SoruLab silinirken hata oluştu');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      topic: '',
      description: '',
      qa_count: 20,
      mode: 'both',
      difficulty: 'medium',
      question_type: 'mixed',
      course_id: '',
      auto_keywords: true,
      keyword_count: 30,
      add_to_chatbot: true,
      language: 'tr',
    });
    setEditingSoruLab(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic || !formData.course_id) {
      toast.error('Konu ve kurs kodu gereklidir');
      return;
    }

    if (editingSoruLab) {
      updateSorulabMutation.mutate({ id: editingSoruLab.sorulab_id, data: formData });
    } else {
      createSorulabMutation.mutate(formData);
    }
  };

  const handleEdit = (sorulab: SoruLab) => {
    setEditingSoruLab(sorulab);
    setFormData({
      topic: sorulab.topic || '',
      description: sorulab.description || '',
      qa_count: sorulab.questions_count || 20,
      mode: sorulab.mode || 'both',
      difficulty: sorulab.difficulty || 'medium',
      question_type: sorulab.question_type || 'mixed',
      course_id: sorulab.course_id || '',
      auto_keywords: true,
      keyword_count: sorulab.keywords_count || 30,
      add_to_chatbot: sorulab.in_qdrant || true,
      language: 'tr',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu SoruLab setini silmek istediğinizden emin misiniz?')) {
      deleteSorulabMutation.mutate(id);
    }
  };

  const getModeIcon = (mode: string) => {
    if (mode === 'chatbot') return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    if (mode === 'quiz') return <ClipboardDocumentCheckIcon className="w-5 h-5" />;
    return <BeakerIcon className="w-5 h-5" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'easy')
      return 'bg-green-500/20 text-green-400 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 light:bg-green-100 light:text-green-700';
    if (difficulty === 'hard')
      return 'bg-red-500/20 text-red-400 border-red-500/30 dark:bg-red-500/20 dark:text-red-400 light:bg-red-100 light:text-red-700';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 light:bg-yellow-100 light:text-yellow-700';
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      multiple_choice: 'Çoktan Seçmeli',
      open_ended: 'Açık Uçlu',
      true_false: 'Doğru/Yanlış',
      mixed: 'Karma',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">SoruLab Yönetimi</h1>
          <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
            AI ile otomatik soru seti oluşturun ve yönetin
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Yeni SoruLab Oluştur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                Toplam Set
              </p>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-2">
                {sorulabSets.length}
              </p>
            </div>
            <BeakerIcon className="w-10 h-10 text-primary-300 dark:text-primary-300 light:text-primary-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                Toplam Soru
              </p>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-2">
                {sorulabSets.reduce(
                  (sum: number, set: SoruLab) => sum + (set.questions_count || 0),
                  0
                )}
              </p>
            </div>
            <DocumentTextIcon className="w-10 h-10 text-accent-light dark:text-accent-light light:text-pink-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                Chatbot Setleri
              </p>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-2">
                {sorulabSets.filter((s: SoruLab) => s.mode !== 'quiz').length}
              </p>
            </div>
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-primary-300 dark:text-primary-300 light:text-primary-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                Quiz Setleri
              </p>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-2">
                {sorulabSets.filter((s: SoruLab) => s.mode !== 'chatbot').length}
              </p>
            </div>
            <ClipboardDocumentCheckIcon className="w-10 h-10 text-accent-light dark:text-accent-light light:text-pink-600" />
          </div>
        </div>
      </div>

      {/* SoruLab Sets List */}
      <div className="card">
        <div className="p-6 border-b border-primary-300/20 dark:border-primary-300/20 light:border-gray-200">
          <h2 className="text-xl font-semibold text-white dark:text-white light:text-gray-900">
            Tüm SoruLab Setleri
          </h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : sorulabSets.length === 0 ? (
            <div className="text-center py-12">
              <BeakerIcon className="mx-auto h-12 w-12 text-white/40 dark:text-white/40 light:text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white dark:text-white light:text-gray-900">
                Henüz SoruLab seti bulunmuyor
              </h3>
              <p className="mt-1 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                AI ile yeni soru seti oluşturarak başlayın
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorulabSets.map((sorulab: SoruLab) => (
                <div
                  key={sorulab.sorulab_id}
                  className="p-6 bg-white/5 dark:bg-white/5 light:bg-gray-50 rounded-xl border border-primary-300/20 dark:border-primary-300/20 light:border-gray-200 hover:border-primary-300/40 dark:hover:border-primary-300/40 light:hover:border-primary-400 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-primary-300/20 dark:bg-primary-300/20 light:bg-primary-100 rounded-lg">
                          {getModeIcon(sorulab.mode)}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white dark:text-white light:text-gray-900">
                            {sorulab.topic}
                          </h3>
                          <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                            {sorulab.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="px-3 py-1 text-xs font-medium bg-primary-300/20 dark:bg-primary-300/20 light:bg-primary-100 text-primary-300 dark:text-primary-300 light:text-primary-700 rounded-full">
                          {sorulab.course_id}
                        </span>

                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(
                            sorulab.difficulty
                          )}`}
                        >
                          {sorulab.difficulty === 'easy'
                            ? 'Kolay'
                            : sorulab.difficulty === 'hard'
                            ? 'Zor'
                            : 'Orta'}
                        </span>

                        <span className="px-3 py-1 text-xs font-medium bg-accent-light/20 dark:bg-accent-light/20 light:bg-pink-100 text-accent-light dark:text-accent-light light:text-pink-700 rounded-full">
                          {sorulab.mode === 'chatbot'
                            ? 'Chatbot'
                            : sorulab.mode === 'quiz'
                            ? 'Quiz'
                            : 'Her İkisi'}
                        </span>

                        <span className="px-3 py-1 text-xs font-medium bg-blue-500/20 dark:bg-blue-500/20 light:bg-blue-100 text-blue-400 dark:text-blue-400 light:text-blue-700 rounded-full border border-blue-500/30">
                          {getQuestionTypeLabel(sorulab.question_type)}
                        </span>

                        <div className="flex items-center text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          {sorulab.questions_count} Soru
                        </div>

                        <div className="flex items-center text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                          <AcademicCapIcon className="w-4 h-4 mr-1" />
                          {sorulab.keywords_count} Anahtar Kelime
                        </div>

                        {sorulab.in_qdrant && (
                          <span className="px-3 py-1 text-xs font-medium bg-green-500/20 dark:bg-green-500/20 light:bg-green-100 text-green-400 dark:text-green-400 light:text-green-700 rounded-full">
                            ✓ Qdrant'ta
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(sorulab)}
                        className="p-2 text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-primary-400 dark:hover:text-primary-400 light:hover:text-primary-700 hover:bg-primary-300/10 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sorulab.sorulab_id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create SoruLab Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            />
            <div className="relative card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
                  {editingSoruLab ? '✏️ SoruLab Düzenle' : 'Yeni SoruLab Oluştur'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 text-white/60 dark:text-white/60 light:text-gray-600 hover:text-primary-300 hover:bg-primary-300/10 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Konu *
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="input-field w-full"
                      placeholder="Veri Yapıları"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Kurs Kodu *
                    </label>
                    <input
                      type="text"
                      value={formData.course_id}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                      className="input-field w-full"
                      placeholder="CS101"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full"
                    rows={3}
                    placeholder="Stack ve Queue konuları..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Soru Sayısı
                    </label>
                    <input
                      type="number"
                      value={formData.qa_count}
                      onChange={(e) =>
                        setFormData({ ...formData, qa_count: parseInt(e.target.value) })
                      }
                      className="input-field w-full"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Anahtar Kelime Sayısı
                    </label>
                    <input
                      type="number"
                      value={formData.keyword_count}
                      onChange={(e) =>
                        setFormData({ ...formData, keyword_count: parseInt(e.target.value) })
                      }
                      className="input-field w-full"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Mod
                    </label>
                    <select
                      value={formData.mode}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="both" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Her İkisi</option>
                      <option value="chatbot" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Chatbot</option>
                      <option value="quiz" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Quiz</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Zorluk
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="easy" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Kolay</option>
                      <option value="medium" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Orta</option>
                      <option value="hard" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Zor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Soru Formatı
                    </label>
                    <select
                      value={formData.question_type}
                      onChange={(e) =>
                        setFormData({ ...formData, question_type: e.target.value })
                      }
                      className="input-field w-full"
                    >
                      <option value="mixed" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Karma</option>
                      <option value="multiple_choice" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Çoktan Seçmeli</option>
                      <option value="open_ended" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Açık Uçlu</option>
                      <option value="true_false" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Doğru/Yanlış</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Dil
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="tr" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">Türkçe</option>
                      <option value="en" className="bg-dark-input dark:bg-dark-input light:bg-white text-white dark:text-white light:text-gray-900">İngilizce</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.auto_keywords}
                      onChange={(e) =>
                        setFormData({ ...formData, auto_keywords: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-600 bg-dark-input border-primary-300/30 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm text-white/80 dark:text-white/80 light:text-gray-700">
                      Otomatik anahtar kelime çıkarımı
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.add_to_chatbot}
                      onChange={(e) =>
                        setFormData({ ...formData, add_to_chatbot: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-600 bg-dark-input border-primary-300/30 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm text-white/80 dark:text-white/80 light:text-gray-700">
                      Chatbot'a ekle (Qdrant)
                    </span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={createSorulabMutation.isLoading || updateSorulabMutation.isLoading}
                  >
                    {createSorulabMutation.isLoading || updateSorulabMutation.isLoading
                      ? editingSoruLab ? 'Güncelleniyor...' : 'Oluşturuluyor...'
                      : editingSoruLab ? 'SoruLab Güncelle' : 'SoruLab Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoruLab;

