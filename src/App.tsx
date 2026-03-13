import React, { useState, useRef, useEffect } from 'react';
import { Check, Edit, FileText, MessageSquare, Plus, Eye, Image as ImageIcon, X, Clock, CheckSquare, Settings, Music, Play, Pause, Upload, RefreshCw, SkipBack, SkipForward, Volume2, VolumeX, LogOut, Trash2 } from 'lucide-react';

type Task = {
  id: string;
  time: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
};

type Note = {
  id: string;
  title: string;
  description: string;
};

type ModalState = {
  isOpen: boolean;
  type: 'task' | 'note';
  mode: 'add' | 'edit';
  data?: any;
};

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    time: '06:00',
    title: 'Plan For the Day...',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    status: 'todo'
  },
  {
    id: '2',
    time: '07:00',
    title: 'Plan For the Day...',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    status: 'todo'
  },
  {
    id: '3',
    time: '08:30',
    title: 'Plan For the Day...',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    status: 'todo'
  }
];

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Plan For the Day...',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'
  },
  {
    id: '2',
    title: 'Plan For the Day...',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'
  },
  {
    id: '3',
    title: 'Plan For the Day...',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'
  }
];

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onStatusChange }) => {
  return (
    <div className="w-full sm:w-[340px] h-[420px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 flex flex-col text-white shadow-2xl relative overflow-hidden group">
      <div className="text-[5.5rem] leading-none font-display font-light text-center mb-6 tracking-tighter">
        {task.time}
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 border border-white/10 rounded-full px-3 py-1 text-xs flex items-center gap-1.5 backdrop-blur-md">
          <Check size={12} />
          <span>Task</span>
        </div>
        <h3 className="text-xl font-medium truncate">{task.title}</h3>
      </div>
      
      <p className="text-sm text-white/70 line-clamp-4 mb-6 flex-grow leading-relaxed">
        {task.description}
      </p>
      
      <div className="flex justify-end gap-2 mt-auto">
        {task.status === 'todo' && (
          <button onClick={() => onStatusChange(task.id, 'in-progress')} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-sm flex items-center gap-2 transition-all">
            <Clock size={14} />
            <span>Start</span>
          </button>
        )}
        {task.status === 'in-progress' && (
          <button onClick={() => onStatusChange(task.id, 'done')} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-sm flex items-center gap-2 transition-all">
            <Check size={14} />
            <span>Done</span>
          </button>
        )}
        <button onClick={() => onEdit(task)} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-sm flex items-center gap-2 transition-all">
          <Edit size={14} />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  return (
    <div className="w-full sm:w-[340px] h-[260px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 flex flex-col text-white shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 border border-white/10 rounded-full px-3 py-1 text-xs flex items-center gap-1.5 backdrop-blur-md">
          <FileText size={12} />
          <span>Note</span>
        </div>
        <h3 className="text-xl font-medium truncate">{note.title}</h3>
      </div>
      
      <p className="text-sm text-white/70 line-clamp-4 mb-6 flex-grow leading-relaxed">
        {note.description}
      </p>
      
      <div className="flex justify-end gap-2 mt-auto">
        <button onClick={() => onDelete(note.id)} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-sm flex items-center gap-2 transition-all">
          <X size={14} />
          <span>Delete</span>
        </button>
        <button onClick={() => onEdit(note)} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-sm flex items-center gap-2 transition-all">
          <Edit size={14} />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
};

interface AddCardProps {
  onClick: () => void;
  heightClass: string;
}

const AddCard: React.FC<AddCardProps> = ({ onClick, heightClass }) => {
  return (
    <button 
      onClick={onClick}
      className={`min-w-[80px] w-[80px] ${heightClass} bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all snap-center group`}
    >
      <Plus size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

interface ModalProps {
  state: ModalState;
  onClose: () => void;
  onSave: (type: 'task' | 'note', mode: 'add' | 'edit', data: any) => void;
  onDelete: (type: 'task' | 'note', id: string) => void;
}

const Modal: React.FC<ModalProps> = ({ state, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(state.data || {
    title: '',
    description: '',
    time: state.type === 'task' ? '12:00' : undefined,
    status: 'todo'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(state.type, state.mode, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {state.mode === 'add' ? 'Add' : 'Edit'} {state.type === 'task' ? 'Task' : 'Note'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {state.type === 'task' && (
            <div>
              <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Time</label>
              <input 
                type="time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange}
                required
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              required
              placeholder="Enter title..."
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              required
              rows={4}
              placeholder="Enter description..."
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
            />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            {state.mode === 'edit' ? (
               <button type="button" onClick={() => { onDelete(state.type, formData.id); onClose(); }} className="px-5 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium">
                 Delete
               </button>
            ) : <div />}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('currentUser'));
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [bgMedia, setBgMedia] = useState<{ type: 'image' | 'video' | 'iframe', url: string } | null>({
    type: 'iframe',
    url: 'https://player.vimeo.com/video/1169668529?background=1&autoplay=1&loop=1&muted=1'
  });
  
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'task', mode: 'add' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [playlist, setPlaylist] = useState<{ url: string, name: string }[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showMusicToast, setShowMusicToast] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load data on login
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (userEmail) {
      const savedData = localStorage.getItem(`appData_${userEmail}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setTasks(parsed.tasks || INITIAL_TASKS);
          setNotes(parsed.notes || INITIAL_NOTES);
          if (parsed.bgMedia) {
            setBgMedia(parsed.bgMedia);
          } else {
            setBgMedia({ type: 'iframe', url: 'https://player.vimeo.com/video/1169668529?background=1&autoplay=1&loop=1&muted=1' });
          }
          if (parsed.playlist) setPlaylist(parsed.playlist);
        } catch (e) {
          console.error("Failed to parse saved data", e);
        }
      } else {
        setTasks(INITIAL_TASKS);
        setNotes(INITIAL_NOTES);
        setPlaylist([]);
        setBgMedia({ type: 'iframe', url: 'https://player.vimeo.com/video/1169668529?background=1&autoplay=1&loop=1&muted=1' });
        
        // Show music feature toast for new users after 5 seconds
        timeoutId = setTimeout(() => {
          setShowMusicToast(true);
        }, 5000);
      }
      setIsDataLoaded(true);
    } else {
      setIsDataLoaded(false);
      setShowMusicToast(false);
    }
    return () => clearTimeout(timeoutId);
  }, [userEmail]);

  // Save data on change
  useEffect(() => {
    if (userEmail && isDataLoaded) {
      localStorage.setItem(`appData_${userEmail}`, JSON.stringify({
        tasks, notes, bgMedia, playlist
      }));
    }
  }, [tasks, notes, bgMedia, playlist, userEmail, isDataLoaded]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email') as string;
    if (email) {
      setUserEmail(email);
      localStorage.setItem('currentUser', email);
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem('currentUser');
    setIsSettingsOpen(false);
    setIsMusicPlaying(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying, currentTrackIndex, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnd = () => {
    if (playlist.length > 0) {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
    if (isMuted) setIsMuted(false);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newTracks = files.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setPlaylist(prev => [...prev, ...newTracks]);
      if (playlist.length === 0) {
        setIsMusicPlaying(true);
      }
    }
  };

  const playNext = () => {
    if (playlist.length > 0) {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
      setIsMusicPlaying(true);
    }
  };

  const playPrev = () => {
    if (playlist.length > 0) {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      setIsMusicPlaying(true);
    }
  };

  const removeTrack = (indexToRemove: number) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter((_, index) => index !== indexToRemove);
      if (newPlaylist.length === 0) {
        setIsMusicPlaying(false);
        setCurrentTrackIndex(0);
        setProgress(0);
      } else if (currentTrackIndex >= newPlaylist.length) {
        setCurrentTrackIndex(newPlaylist.length - 1);
      } else if (currentTrackIndex === indexToRemove) {
        setProgress(0);
      }
      return newPlaylist;
    });
  };

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setBgMedia({ type, url });
    }
  };

  const openModal = (type: 'task' | 'note', mode: 'add' | 'edit', data?: any) => {
    setModal({ isOpen: true, type, mode, data });
  };

  const handleSave = (type: 'task' | 'note', mode: 'add' | 'edit', data: any) => {
    if (type === 'task') {
      if (mode === 'add') {
        setTasks([...tasks, { ...data, id: Date.now().toString() }]);
      } else {
        setTasks(tasks.map(t => t.id === data.id ? data : t));
      }
    } else {
      if (mode === 'add') {
        setNotes([...notes, { ...data, id: Date.now().toString() }]);
      } else {
        setNotes(notes.map(n => n.id === data.id ? data : n));
      }
    }
    setModal({ ...modal, isOpen: false });
  };

  const handleDelete = (type: 'task' | 'note', id: string) => {
    if (type === 'task') {
      setTasks(tasks.filter(t => t.id !== id));
    } else {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const handleTaskStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  if (!userEmail) {
    return (
      <div className="flex flex-col h-screen items-center justify-center relative font-sans p-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <iframe 
            src="https://player.vimeo.com/video/1169668529?background=1&autoplay=1&loop=1&muted=1" 
            className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 w-full max-w-md text-white shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-md border border-white/10">
              <CheckSquare size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-light mb-2 text-center">Welcome Back</h1>
          <p className="text-white/60 text-center mb-8 text-sm">Sign in to sync your tasks and notes</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-white/60 mb-1 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required
                placeholder="you@example.com"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <button type="submit" className="w-full bg-white text-black rounded-xl py-3 font-medium hover:bg-gray-200 transition-colors mt-2">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {bgMedia?.type === 'video' ? (
          <video src={bgMedia.url} autoPlay loop muted className="w-full h-full object-cover" />
        ) : bgMedia?.type === 'iframe' ? (
          <iframe 
            src={bgMedia.url} 
            className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
          />
        ) : (
          <img src={bgMedia?.url} alt="Background" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setIsBgModalOpen(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm flex items-center gap-2 text-white transition-all">
            <ImageIcon size={16} />
            <span className="hidden sm:inline">Change Background</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleBgChange} accept="image/*,video/*" className="hidden" />

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full p-1">
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`p-2 rounded-full transition-colors ${activeTab === 'tasks' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70'}`}
            >
              <CheckSquare size={18} />
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`p-2 rounded-full transition-colors ${activeTab === 'notes' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70'}`}
            >
              <FileText size={18} />
            </button>
          </div>

          <button onClick={() => setIsSettingsOpen(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 text-sm flex items-center gap-2 text-white transition-all">
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

        {/* Main Scrollable Area */}
        <div className="flex-grow overflow-y-auto pb-8 scrollbar-hide">
          
          {activeTab === 'tasks' ? (
            <div className="flex flex-wrap gap-6 pb-4 items-start content-start">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={() => openModal('task', 'edit', task)} 
                  onStatusChange={handleTaskStatus} 
                />
              ))}
              <AddCard onClick={() => openModal('task', 'add')} heightClass="h-[420px]" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 pb-4 items-start content-start">
              {notes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={() => openModal('note', 'edit', note)} 
                  onDelete={(id) => handleDelete('note', id)} 
                />
              ))}
              <AddCard onClick={() => openModal('note', 'add')} heightClass="h-[260px]" />
            </div>
          )}

        </div>
      </div>
      
      {/* Modal */}
      {modal.isOpen && (
        <Modal 
          state={modal} 
          onClose={() => setModal({ ...modal, isOpen: false })} 
          onSave={handleSave} 
          onDelete={handleDelete}
        />
      )}

      {/* Background Selection Modal */}
      {isBgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Change Background</h2>
              <button onClick={() => setIsBgModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  setBgMedia({ type: 'iframe', url: 'https://player.vimeo.com/video/1169668529?background=1&autoplay=1&loop=1&muted=1' });
                  setIsBgModalOpen(false);
                }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Play size={20} className="text-white/70" />
                </div>
                <div>
                  <p className="font-medium">Default Video</p>
                  <p className="text-xs text-white/50">Animated background</p>
                </div>
              </button>

              <button 
                onClick={() => {
                  setBgMedia({ type: 'image', url: 'https://i.postimg.cc/bvx9CrbN/Whisk-93e052c68ed3504851a4124bf1df14bddr.jpg' });
                  setIsBgModalOpen(false);
                }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <ImageIcon size={20} className="text-white/70" />
                </div>
                <div>
                  <p className="font-medium">Default Image</p>
                  <p className="text-xs text-white/50">Static background</p>
                </div>
              </button>

              <div className="h-px w-full bg-white/10 my-2"></div>

              <button 
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsBgModalOpen(false);
                }}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <Upload size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium">Custom Upload</p>
                  <p className="text-xs text-white/50">Upload your own image or video</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Account Sync */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Account & Sync</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="overflow-hidden pr-2">
                      <p className="text-sm truncate">{userEmail}</p>
                      <p className="text-xs text-white/50">Logged in</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/20 rounded-xl px-3 py-2 text-sm flex items-center gap-2 transition-all shrink-0"
                    >
                      <LogOut size={14} />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                  <div className="h-px w-full bg-white/10 my-1"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Sync your data</p>
                      <p className="text-xs text-white/50">Save to local storage</p>
                    </div>
                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-sm flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
                    >
                      <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Background Music */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Background Music</h3>
                
                <div className="flex flex-col gap-4">
                  {playlist.length > 0 ? (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                            <Music size={20} className="text-white/70" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{playlist[currentTrackIndex].name}</p>
                            <p className="text-xs text-white/50 truncate">Track {currentTrackIndex + 1} of {playlist.length}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeTrack(currentTrackIndex)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors shrink-0 ml-2"
                          title="Remove Track"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2 mb-4 text-xs text-white/50">
                        <span>{formatTime(progress)}</span>
                        <input 
                          type="range" 
                          min={0} 
                          max={duration || 100} 
                          value={progress} 
                          onChange={handleSeek}
                          className="flex-grow h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <span>{formatTime(duration)}</span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          </button>
                          <input 
                            type="range" 
                            min={0} 
                            max={1} 
                            step={0.01} 
                            value={isMuted ? 0 : volume} 
                            onChange={handleVolumeChange}
                            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={playPrev} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <SkipBack size={18} fill="currentColor" />
                          </button>
                          <button 
                            onClick={toggleMusic}
                            className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                          >
                            {isMusicPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                          </button>
                          <button onClick={playNext} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <SkipForward size={18} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-black/20 rounded-xl border border-white/5">
                      <Music size={24} className="mx-auto mb-2 text-white/30" />
                      <p className="text-sm text-white/50">No music uploaded yet</p>
                    </div>
                  )}

                  <button 
                    onClick={() => musicInputRef.current?.click()}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload size={16} />
                    <span>{playlist.length > 0 ? 'Add More Tracks' : 'Upload Music'}</span>
                  </button>
                  <input 
                    type="file" 
                    ref={musicInputRef} 
                    onChange={handleMusicUpload} 
                    accept="audio/*" 
                    multiple
                    className="hidden" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      {playlist.length > 0 && (
        <audio 
          ref={audioRef} 
          src={playlist[currentTrackIndex].url} 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleTrackEnd}
        />
      )}

      {/* Music Feature Discovery Toast */}
      {showMusicToast && (
        <div className="fixed bottom-6 right-6 z-40 bg-zinc-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl w-[320px] animate-in slide-in-from-bottom-8 fade-in duration-500">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/10 rounded-full">
                <Music size={16} />
              </div>
              <h3 className="font-medium text-sm">Background Music</h3>
            </div>
            <button onClick={() => setShowMusicToast(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <div className="relative w-full rounded-xl overflow-hidden mb-4 bg-black/50">
            <img 
              src="https://i.postimg.cc/YScC2f9n/Whisk-f8fab621eca94599a2442f39de1f483ddr.png" 
              alt="Music Feature Demo"
              className="w-full h-auto object-cover"
            />
          </div>

          <p className="text-xs text-white/70 mb-4 leading-relaxed">
            Did you know? You can upload and play your own background music to stay focused!
          </p>
          <button 
            onClick={() => {
              setShowMusicToast(false);
              setIsSettingsOpen(true);
            }}
            className="w-full bg-white text-black rounded-xl py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Try it now
          </button>
        </div>
      )}
    </div>
  );
}
