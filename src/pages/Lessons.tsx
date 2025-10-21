import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { lessonAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import UserSelectDropdown from '../components/Common/UserSelectDropdown';
import {
  VideoCameraIcon,
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  LinkIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Lesson {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  meet_link?: string;
  instructor_username: string;
  participant_count: number;
  course_id: string;
  status: string;
  created_at: string;
}

const Lessons: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    days: [] as string[],
    total_hours: 0,
    max_students: 40,
    course_id: '',
    meet_link: '',
    instructor_usernames: [] as string[],
    education_goal: '',
    education_summary: '',
    importance: '',
    learning_outcomes: '',
    curriculum: [''],
    participant_usernames: [] as string[],
  });

  const { data: lessonsData, isLoading } = useQuery('lessons', () => lessonAPI.getAll());

  const { data: usersData } = useQuery('users', () => authAPI.getAllUsers());

  const lessons = Array.isArray(lessonsData?.data)
    ? lessonsData.data
    : (lessonsData?.data?.data || []);

  const usersList = Array.isArray(usersData?.data)
    ? usersData.data
    : (usersData?.data?.data || []);

  const createLessonMutation = useMutation(
    (data: any) => lessonAPI.createMeeting(data),
    {
      onSuccess: () => {
        toast.success('Ders başarıyla oluşturuldu ve davetiyeler gönderildi!');
        queryClient.invalidateQueries('lessons');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Ders oluşturulurken hata oluştu');
      },
    }
  );

  const deleteLessonMutation = useMutation(
    (id: number) => lessonAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Ders başarıyla silindi');
        queryClient.invalidateQueries('lessons');
      },
      onError: () => {
        toast.error('Ders silinirken hata oluştu');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      title: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      days: [],
      total_hours: 0,
      max_students: 40,
      course_id: '',
      meet_link: '',
      instructor_usernames: [],
      education_goal: '',
      education_summary: '',
      importance: '',
      learning_outcomes: '',
      curriculum: [''],
      participant_usernames: [],
    });
    setEditingLesson(null);
  };

  const toggleDay = (day: string) => {
    if (formData.days.includes(day)) {
      setFormData({
        ...formData,
        days: formData.days.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        days: [...formData.days, day],
      });
    }
  };

  const addCurriculumItem = () => {
    setFormData({
      ...formData,
      curriculum: [...formData.curriculum, ''],
    });
  };

  const removeCurriculumItem = (index: number) => {
    const newCurriculum = formData.curriculum.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      curriculum: newCurriculum.length > 0 ? newCurriculum : [''],
    });
  };

  const updateCurriculumItem = (index: number, value: string) => {
    const newCurriculum = [...formData.curriculum];
    newCurriculum[index] = value;
    setFormData({
      ...formData,
      curriculum: newCurriculum,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.start_date || !formData.end_date || !formData.start_time || !formData.end_time) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    const participantArray = formData.participant_usernames;

    const start_datetime = `${formData.start_date}T${formData.start_time}:00`;
    const end_datetime = `${formData.end_date}T${formData.end_time}:00`;

    const cleanCurriculum = formData.curriculum.filter((item) => item.trim() !== '');

    const lessonData = {
      title: formData.title,
      start_datetime: start_datetime,
      end_datetime: end_datetime,
      days: formData.days.length > 0 ? formData.days : undefined,
      time: `${formData.start_time}-${formData.end_time}`,
      total_hours: formData.total_hours || undefined,
      max_students: formData.max_students || undefined,
      course_id: formData.course_id,
      meet_link: formData.meet_link || undefined,
      instructor_usernames: formData.instructor_usernames.length > 0 ? formData.instructor_usernames : undefined,
      education_goal: formData.education_goal || undefined,
      education_summary: formData.education_summary || undefined,
      importance: formData.importance || undefined,
      learning_outcomes: formData.learning_outcomes || undefined,
      curriculum: cleanCurriculum.length > 0 ? cleanCurriculum : undefined,
      participant_usernames: participantArray,
    };

    if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson.id, data: lessonData });
    } else {
      createLessonMutation.mutate(lessonData);
    }
  };

  const updateLessonMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => lessonAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Ders başarıyla güncellendi!');
        queryClient.invalidateQueries('lessons');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Ders güncellenirken hata oluştu');
      },
    }
  );

  const handleEdit = (lesson: Lesson) => {
    const startDate = new Date(lesson.start_datetime);
    const endDate = new Date(lesson.end_datetime);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    const startTimeStr = startDate.toTimeString().substring(0, 5);
    const endTimeStr = endDate.toTimeString().substring(0, 5);

    setEditingLesson(lesson);
    setFormData({
      title: lesson.title || '',
      start_date: startDateStr,
      end_date: endDateStr,
      start_time: startTimeStr,
      end_time: endTimeStr,
      days: (lesson as any).days || [],
      total_hours: (lesson as any).total_hours || 0,
      max_students: (lesson as any).max_students || 40,
      course_id: lesson.course_id || '',
      meet_link: lesson.meet_link || '',
      instructor_usernames: (lesson as any).instructor_usernames || [],
      education_goal: (lesson as any).education_goal || '',
      education_summary: (lesson as any).education_summary || '',
      importance: (lesson as any).importance || '',
      learning_outcomes: (lesson as any).learning_outcomes || '',
      curriculum: (lesson as any).curriculum || [''],
      participant_usernames: [],
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
      deleteLessonMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Ders Yönetimi</h1>
          <p className="mt-2 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
            Google Meet ile canlı ders oluşturun ve yönetin
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Yeni Ders Oluştur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">Toplam Ders</p>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-2">
                {lessons.length}
              </p>
            </div>
            <VideoCameraIcon className="w-10 h-10 text-primary-300 dark:text-primary-300 light:text-primary-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">Yaklaşan Dersler</p>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-2">
                {lessons.filter((l: Lesson) => new Date(l.start_datetime) > new Date()).length}
              </p>
            </div>
            <CalendarDaysIcon className="w-10 h-10 text-accent-light dark:text-accent-light light:text-pink-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">Toplam Katılımcı</p>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-2">
                {lessons.reduce((sum: number, l: Lesson) => sum + l.participant_count, 0)}
              </p>
            </div>
            <UserGroupIcon className="w-10 h-10 text-primary-300 dark:text-primary-300 light:text-primary-600" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-600">Bu Hafta</p>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mt-2">
                {lessons.filter((l: Lesson) => {
                  const lessonDate = new Date(l.start_datetime);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return lessonDate > weekAgo;
                }).length}
              </p>
            </div>
            <ClockIcon className="w-10 h-10 text-accent-light dark:text-accent-light light:text-pink-600" />
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="card">
        <div className="p-6 border-b border-primary-300/20 dark:border-primary-300/20 light:border-gray-200">
          <h2 className="text-xl font-semibold text-white dark:text-white light:text-gray-900">
            Tüm Dersler
          </h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12">
              <VideoCameraIcon className="mx-auto h-12 w-12 text-white/40 dark:text-white/40 light:text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white dark:text-white light:text-gray-900">
                Henüz ders bulunmuyor
              </h3>
              <p className="mt-1 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                Yeni ders oluşturarak başlayın
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson: Lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 bg-white/5 dark:bg-white/5 light:bg-gray-50 rounded-xl border border-primary-300/20 dark:border-primary-300/20 light:border-gray-200 hover:border-primary-300/40 dark:hover:border-primary-300/40 light:hover:border-primary-400 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <VideoCameraIcon className="w-5 h-5 text-primary-300 dark:text-primary-300 light:text-primary-600" />
                        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                          {lesson.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-primary-300/20 dark:bg-primary-300/20 light:bg-primary-100 text-primary-300 dark:text-primary-300 light:text-primary-700 rounded-full">
                          {lesson.course_id}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-white/70 dark:text-white/70 light:text-gray-700">
                        {lesson.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/60 dark:text-white/60 light:text-gray-600">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="w-4 h-4 mr-1" />
                          {new Date(lesson.start_datetime).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {new Date(lesson.start_datetime).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(lesson.end_datetime).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {lesson.participant_count} Katılımcı
                        </div>
                      </div>

                      {lesson.meet_link && (
                        <div className="mt-3">
                          <a
                            href={lesson.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-primary-400 dark:hover:text-primary-400 light:hover:text-primary-700"
                          >
                            <LinkIcon className="w-4 h-4 mr-1" />
                            Google Meet Linki
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-2 text-primary-300 dark:text-primary-300 light:text-primary-600 hover:text-primary-400 dark:hover:text-primary-400 light:hover:text-primary-700 hover:bg-primary-300/10 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
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

      {/* Create/Edit Lesson Modal */}
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
            <div className="relative card p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
                  {editingLesson ? '✏️ Dersi Düzenle' : 'Yeni Ders Oluştur'}
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
                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    Ders Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field w-full"
                    placeholder="Python Temelleri"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Toplam Saat
                    </label>
                    <input
                      type="number"
                      value={formData.total_hours}
                      onChange={(e) => setFormData({ ...formData, total_hours: parseInt(e.target.value) || 0 })}
                      className="input-field w-full"
                      placeholder="60"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Max Öğrenci
                    </label>
                    <input
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 0 })}
                      className="input-field w-full"
                      placeholder="40"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Google Meet Linki
                    </label>
                    <input
                      type="url"
                      value={formData.meet_link}
                      onChange={(e) => setFormData({ ...formData, meet_link: e.target.value })}
                      className="input-field w-full"
                      placeholder="https://meet.google.com/abc-defg-hij"
                    />
                  </div>

                  <div>
                    <UserSelectDropdown
                      users={usersList.filter((u: any) => 
                        u.roles?.includes('instructor') || u.roles?.includes('admin')
                      )}
                      selectedUsers={formData.instructor_usernames}
                      onSelect={(usernames) => setFormData({ ...formData, instructor_usernames: usernames })}
                      label="Öğretmen Ataması"
                      placeholder="Öğretmen arayın ve seçin..."
                      multiple={true}
                      showTagsInside={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Eğitim Amacı
                    </label>
                    <textarea
                      value={formData.education_goal}
                      onChange={(e) => setFormData({ ...formData, education_goal: e.target.value })}
                      className="input-field w-full"
                      rows={2}
                      placeholder="Öğrenciler temel veri yapılarını öğrenecek"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                      Önem/Öncelik
                    </label>
                    <textarea
                      value={formData.importance}
                      onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                      className="input-field w-full"
                      rows={2}
                      placeholder="Yazılım geliştirme için temel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    Eğitim Özeti
                  </label>
                  <textarea
                    value={formData.education_summary}
                    onChange={(e) => setFormData({ ...formData, education_summary: e.target.value })}
                    className="input-field w-full"
                    rows={3}
                    placeholder="Eğitimin genel özeti ve kapsamı..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    Kazanımlar
                  </label>
                  <textarea
                    value={formData.learning_outcomes}
                    onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
                    className="input-field w-full"
                    rows={3}
                    placeholder="Öğrencilerin bu eğitimden kazanacakları beceriler (her satıra bir kazanım)"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700">
                      Müfredat
                    </label>
                    <button
                      type="button"
                      onClick={addCurriculumItem}
                      className="px-3 py-1 text-xs bg-primary-300/20 hover:bg-primary-300/30 text-primary-300 dark:text-primary-300 light:text-primary-700 rounded-lg transition-colors flex items-center"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Madde Ekle
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.curriculum.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-white/60 dark:text-white/60 light:text-gray-600 text-sm font-medium min-w-[24px]">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateCurriculumItem(index, e.target.value)}
                          className="input-field flex-1"
                          placeholder="Müfredat maddesi..."
                        />
                        {formData.curriculum.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCurriculumItem(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-white/40 dark:text-white/40 light:text-gray-500">
                    Her müfredat maddesi ayrı bir kutucukta görünecek
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    Ders Günleri
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
                      <label
                        key={day}
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-primary-300/10 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.days.includes(day)}
                          onChange={() => toggleDay(day)}
                          className="w-4 h-4 text-primary-600 bg-dark-input border-primary-300/30 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <span className="text-sm text-white/80 dark:text-white/80 light:text-gray-700">
                          {day.substring(0, 3)}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-white/40 dark:text-white/40 light:text-gray-500">
                    Derslerin hangi günlerde yapılacağını seçin
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    Ders Saatleri *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/60 dark:text-white/60 light:text-gray-500 mb-1">
                        Başlangıç Saati
                      </label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="input-field w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 dark:text-white/60 light:text-gray-500 mb-1">
                        Bitiş Saati
                      </label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="input-field w-full"
                        required
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-white/40 dark:text-white/40 light:text-gray-500">
                    Örnek: 14:00 - 16:00
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 dark:text-white/80 light:text-gray-700 mb-2">
                    Tarih Aralığı *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/60 dark:text-white/60 light:text-gray-500 mb-1">
                        Başlangıç Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="input-field w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 dark:text-white/60 light:text-gray-500 mb-1">
                        Bitiş Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="input-field w-full"
                        required
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-white/40 dark:text-white/40 light:text-gray-500">
                    Derslerin yapılacağı tarih aralığı
                  </p>
                </div>

                <div>
                  <UserSelectDropdown
                    users={usersList.filter((u: any) => 
                      u.roles?.includes('student')
                    )}
                    selectedUsers={formData.participant_usernames}
                    onSelect={(usernames) => setFormData({ ...formData, participant_usernames: usernames })}
                    label="Katılımcı Öğrenciler"
                    placeholder="Öğrenci arayın ve seçin..."
                    multiple={true}
                    showTagsInside={false}
                  />
                  <p className="mt-1 text-xs text-white/40 dark:text-white/40 light:text-gray-500">
                    Seçilen öğrencilere otomatik olarak davetiye gönderilecektir
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={createLessonMutation.isLoading || updateLessonMutation.isLoading}
                  >
                    {createLessonMutation.isLoading || updateLessonMutation.isLoading
                      ? editingLesson ? 'Güncelleniyor...' : 'Oluşturuluyor...'
                      : editingLesson ? 'Dersi Güncelle' : 'Ders Oluştur'}
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

export default Lessons;

