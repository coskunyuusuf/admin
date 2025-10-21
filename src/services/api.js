import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      toast.error('Backend sunucusuna bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.', {
        duration: 5000,
        icon: '⚠️',
      });
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      }
    } else if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz bulunmuyor.');
    } else if (error.response?.status === 404) {
      toast.error('İstenen kaynak bulunamadı.');
    } else if (error.response?.status >= 500) {
      toast.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    } else if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.detail || 'Geçersiz istek.';
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  assignRole: (roleData) => api.post('/assign_role', roleData),
  getAllUsers: () => api.get('/admin/users'),
};

export const profileAPI = {
  getMyProfile: () => api.get('/profile/me'),
  updateMyProfile: (data) => api.patch('/profile/me', data),
  getUserProfile: (username) => api.get(`/profile/${username}`),
  getPreferences: () => api.get('/profile/preferences'),
  updatePreferences: (data) => api.patch('/profile/preferences', data),
  getStats: () => api.get('/profile/stats'),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteAvatar: () => api.delete('/profile/avatar'),
  changeEmail: (data) => api.post('/profile/change-email', data),
  changePassword: (data) => api.post('/profile/change-password', data),
  getPublicInstructors: () => api.get('/profile/instructors/public'),
};

export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getDetailedStats: () => api.get('/dashboard/detailed-stats'),
  getWeeklyPerformance: () => api.get('/dashboard/weekly-performance'),
  getRecentActivities: (limit = 20) => api.get(`/dashboard/recent-activities?limit=${limit}`),
  getGoals: () => api.get('/dashboard/goals'),
};

export const statsAPI = {
  getSystemStats: () => api.get('/stats'),
  getAPIStats: () => api.get('/debug/api-stats'),
};

export const notesAPI = {
  getNotes: (params = {}) => api.get('/notes/', { params }),
  createNote: (data) => api.post('/notes/', data),
  getNote: (id) => api.get(`/notes/${id}`),
  updateNote: (id, data) => api.patch(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  pinNote: (id) => api.post(`/notes/${id}/pin`),
  archiveNote: (id) => api.post(`/notes/${id}/archive`),
  getCategories: () => api.get('/notes/categories/list'),
  getTags: () => api.get('/notes/tags/list'),
  getStats: () => api.get('/notes/stats'),
  bulkDelete: (data) => api.post('/notes/bulk/delete', data),
  bulkArchive: (data) => api.post('/notes/bulk/archive', data),
  exportNotes: (data) => api.post('/notes/export', data),
  importNotes: (data) => api.post('/notes/import', data),
};

export const calendarAPI = {
  getEvents: (params = {}) => api.get('/calendar/events', { params }),
  createEvent: (data) => api.post('/calendar/events', data),
  getEvent: (id) => api.get(`/calendar/events/${id}`),
  updateEvent: (id, data) => api.patch(`/calendar/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/calendar/events/${id}`),
  cancelEvent: (id) => api.post(`/calendar/events/${id}/cancel`),
  getTodayAgenda: () => api.get('/calendar/agenda/today'),
  getWeekAgenda: () => api.get('/calendar/agenda/week'),
  getStats: () => api.get('/calendar/stats'),
  getReminders: (hours = 24) => api.get(`/calendar/reminders?hours_ahead=${hours}`),
  bulkCreate: (data) => api.post('/calendar/events/bulk', data),
  bulkDelete: (data) => api.delete('/calendar/events/bulk', data),
  checkConflicts: (params) => api.get('/calendar/conflicts', { params }),
  importCalendar: (data) => api.post('/calendar/import', data),
  exportCalendar: (params) => api.get('/calendar/export', { params }),
};

export const uploadsAPI = {
  uploadFile: (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    return api.post('/uploads/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getFiles: (params = {}) => api.get('/uploads/', { params }),
  getFile: (id) => api.get(`/uploads/${id}`),
  updateFile: (id, data) => api.patch(`/uploads/${id}`, data),
  deleteFile: (id) => api.delete(`/uploads/${id}`),
  downloadFile: (id) => api.get(`/uploads/download/${id}`),
  getCategoriesStats: () => api.get('/uploads/categories/stats'),
  bulkDelete: (data) => api.post('/uploads/bulk/delete', data),
  getPublicFiles: () => api.get('/uploads/public/list'),
  downloadPublicFile: (id) => api.get(`/uploads/public/download/${id}`),
};

// Messages API
export const messagesAPI = {
  sendMessage: (data) => api.post('/messages/send', data),
  getInbox: (params = {}) => api.get('/messages/inbox', { params }),
  getSentMessages: (params = {}) => api.get('/messages/sent', { params }),
  searchMessages: (params = {}) => api.get('/messages/search', { params }),
  getMessage: (id) => api.get(`/messages/${id}`),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  markAsRead: (data) => api.patch('/messages/mark-read', data),
  getConversations: () => api.get('/messages/conversations/list'),
  getAvailableRecipients: () => api.get('/messages/recipients/available'),
  sendWithAttachment: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/messages/send-with-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadAttachment: (id) => api.get(`/messages/attachments/${id}/download`),
  getAttachmentInfo: (id) => api.get(`/messages/attachments/${id}/info`),
};

// Instructors API
export const instructorsAPI = {
  sendQuestion: (data) => api.post('/instructors/questions/send', data),
  getIncomingQuestions: (params = {}) => api.get('/instructors/questions/inbox', { params }),
  getOutgoingQuestions: (params = {}) => api.get('/instructors/questions/outgoing', { params }),
  respondToQuestion: (id, data) => api.post(`/instructors/questions/${id}/respond`, data),
  updateQuestionStatus: (id, data) => api.patch(`/instructors/questions/${id}/status`, data),
  addCourse: (data) => api.post('/instructors/courses', data),
  getCourses: (params = {}) => api.get('/instructors/courses', { params }),
  getCourse: (id) => api.get(`/instructors/courses/${id}`),
  updateCourse: (id, data) => api.patch(`/instructors/courses/${id}`, data),
  updateCourseStatus: (id, data) => api.patch(`/instructors/courses/${id}/status`, data),
  uploadCourseImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/instructors/courses/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getCourseImage: (id) => api.get(`/instructors/courses/${id}/image`),
  createCurriculum: (courseId, data) => api.post(`/instructors/courses/${courseId}/curriculum`, data),
  getCurriculum: (courseId) => api.get(`/instructors/courses/${courseId}/curriculum`),
  addCurriculumItem: (courseId, data) => api.post(`/instructors/courses/${courseId}/curriculum/item`, data),
  updateCurriculumItem: (courseId, itemId, data) => api.patch(`/instructors/courses/${courseId}/curriculum/${itemId}`, data),
  deleteCurriculumItem: (courseId, itemId) => api.delete(`/instructors/courses/${courseId}/curriculum/${itemId}`),
  updateCurriculumStatus: (courseId, itemId, data) => api.patch(`/instructors/courses/${courseId}/curriculum/${itemId}/status`, data),
  getCourseProgress: (courseId) => api.get(`/instructors/courses/${courseId}/progress`),
  updateCourseProgress: (courseId, data) => api.patch(`/instructors/courses/${courseId}/progress`, data),
  addStudentsToCourse: (courseId, data) => api.post(`/instructors/courses/${courseId}/students`, data),
  getCourseStudents: (courseId, params = {}) => api.get(`/instructors/courses/${courseId}/students`, { params }),
  removeStudentFromCourse: (courseId, username) => api.delete(`/instructors/courses/${courseId}/students/${username}`),
  getStudentSessions: (username) => api.get(`/instructors/students/${username}/sessions`),
  getStudentPerformance: (username) => api.get(`/instructors/students/${username}/performance`),
  getStudentWeeklyActivity: (username, weeks = 4) => api.get(`/instructors/students/${username}/weekly-activity?weeks=${weeks}`),
  getStudentBadges: (username) => api.get(`/instructors/students/${username}/badges`),
  getStudentComparativeStats: (username) => api.get(`/instructors/students/${username}/comparative-stats`),
  getCourseDocuments: (courseId, params = {}) => api.get(`/instructors/courses/${courseId}/docs`, { params }),
  addCourseDocument: (courseId, data) => api.post(`/instructors/courses/${courseId}/docs`, data),
  uploadCourseDocument: (courseId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    return api.post(`/instructors/courses/${courseId}/docs/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadCourseDocument: (courseId, docId) => api.get(`/instructors/courses/${courseId}/docs/${docId}/download`),
  getDocumentInfo: (courseId, docId) => api.get(`/instructors/courses/${courseId}/docs/${docId}/info`),
  deleteCourseDocument: (courseId, docId) => api.delete(`/instructors/courses/${courseId}/docs/${docId}`),
  createAssignment: (data) => api.post('/instructors/assignments', data),
  getAssignments: (params = {}) => api.get('/instructors/assignments', { params }),
  updateAssignmentStatus: (id, data) => api.patch(`/instructors/assignments/${id}/status`, data),
  createAnnouncement: (data) => api.post('/instructors/announcements', data),
  getAnnouncements: (params = {}) => api.get('/instructors/announcements', { params }),
  deleteAnnouncement: (id) => api.delete(`/instructors/announcements/${id}`),
  curateResource: (data) => api.post('/instructors/resources/curate', data),
  getCuratedResources: (params = {}) => api.get('/instructors/resources/curated', { params }),
  getDashboard: () => api.get('/instructors/dashboard'),
  bulkImportStudents: (data) => api.post('/instructors/bulk/students/import', data),
  exportCourseStudents: (courseId) => api.get(`/instructors/export/students/${courseId}`),
};

export const pointsAPI = {
  getMyPoints: () => api.get('/points/me'),
  getLeaderboard: (params = {}) => api.get('/points/leaderboard', { params }),
  getWeeklyActivity: () => api.get('/points/weekly-activity'),
  sessionComplete: (data) => api.post('/points/session-complete', data),
  quizComplete: (data) => api.post('/points/quiz-complete', data),
  chatComplete: (data) => api.post('/points/chat-complete', data),
  badgeEarned: (data) => api.post('/points/badge-earned', data),
  resourceRead: (data) => api.post('/points/resource-read', data),
  instructorEvaluation: (data) => api.post('/points/instructor-evaluation', data),
  addManualPoints: (data) => api.post('/points/admin/add-manual', data),
  resetPoints: (data) => api.post('/points/admin/reset', data),
  getAllUsersPoints: (params = {}) => api.get('/points/admin/all-users', { params }),
};

export const badgesAPI = {
  getMyBadges: () => api.get('/badges'),
  getCatalog: () => api.get('/badges/catalog'),
  weeklyPerformance: (data) => api.post('/badges/weekly-performance', data),
  leaderboardPosition: (data) => api.post('/badges/leaderboard-position', data),
  awardTeacherBadge: (data) => api.post('/badges/teacher-badge', data),
  recordChatbotError: (data) => api.post('/badges/chatbot-error', data),
  recordStudySession: (data) => api.post('/badges/study-session', data),
  recordOvertimeStudy: (data) => api.post('/badges/overtime-study', data),
  sessionAbandoned: (data) => api.post('/badges/session-abandoned', data),
  consecutiveChat: (data) => api.post('/badges/consecutive-chat', data),
  getAllUsers: () => api.get('/admin/users'),
  awardBadge: (username, badge_id) => api.post('/badges/admin/award', { username, badge_id }),
};

export const sessionsAPI = {
  getSessions: () => api.get('/sessions'),
  getSession: (id) => api.get(`/sessions/${id}`),
  getActiveSessions: () => api.get('/sessions/active'),
  clearSession: (id) => api.delete(`/sessions/${id}`),
};

export const askAPI = {
  askQuestion: (data) => api.post('/ask', data),
  test: () => api.get('/test'),
  getStats: () => api.get('/stats'),
  askSmart: (data) => api.post('/ask/smart', data),
  askAuto: (data) => api.post('/ask/auto', data),
  analyzeSession: (id) => api.get(`/session/analysis/${id}`),
};

export const feedbackAPI = {
  submitFeedback: (data) => api.post('/feedback', data),
};

export const codeAPI = {
  generateCode: (data) => api.post('/code', data),
  streamCode: (data) => api.post('/code_stream', data),
};

export const quizAPI = {
  generateQuiz: (data) => api.post('/quiz/generate', data),
  startAttempt: (data) => api.post('/quiz/attempt/start', data),
  submitQuiz: (data) => api.post('/quiz/submit', data),
  abandonQuiz: (data) => api.post('/quiz/abandon', data),
};

export const topicsAPI = {
  createTopic: (data) => api.post('/topics/create', data),
  generateTopicContent: (data) => api.post('/topics/topics/generate', data),
  listTopics: () => api.get('/topics/list'),
};

export const sorulabAPI = {
  createSorulab: (data) => api.post('/sorulab/create', data),
  listSorulabSets: (params = {}) => api.get('/sorulab/list', { params }),
  getSorulabDetail: (id) => api.get(`/sorulab/${id}`),
  updateSorulab: (id, data) => api.patch(`/sorulab/${id}`, data),
  updateQuestion: (setId, questionId, data) => api.patch(`/sorulab/${setId}/questions/${questionId}`, data),
  deleteQuestion: (setId, questionId) => api.delete(`/sorulab/${setId}/questions/${questionId}`),
  assignToStudents: (id, data) => api.post(`/sorulab/${id}/assign`, data),
  exportSorulab: (id, format = 'json') => api.get(`/sorulab/${id}/export?format=${format}`),
  deleteSorulab: (id) => api.delete(`/sorulab/${id}`),
};

export const focusAPI = {
  startTimer: (data) => api.post('/focus/start', data),
  appendTask: (data) => api.post('/focus/append-task', data),
  finishTimer: (data) => api.post('/focus/finish', data),
  getStats: () => api.get('/focus/stats'),
};

export const resourcesAPI = {
  searchResources: (params = {}) => api.get('/resources/search', { params }),
  readResource: (data) => api.post('/resources/read', data),
};

export const healthAPI = {
  getHealth: () => api.get('/health'),
  getRoutes: () => api.get('/debug/routes'),
};

export const announcementAPI = {
  getAll: () => api.get('/announcements'),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.patch(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const lessonAPI = {
  getAll: () => api.get('/calendar/lessons'),
  getById: (id) => api.get(`/calendar/lessons/${id}`),
  createMeeting: (data) => api.post('/calendar/create-meeting', data),
  update: (id, data) => api.patch(`/calendar/lessons/${id}`, data),
  cancel: (id) => api.post(`/calendar/lessons/${id}/cancel`),
  delete: (id) => api.delete(`/calendar/lessons/${id}`),
  getUpcoming: () => api.get('/calendar/lessons/upcoming'),
};

export default api;
