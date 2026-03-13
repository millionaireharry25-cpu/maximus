import React, { useState, useRef, useEffect } from 'react';
import { Check, Edit, FileText, MessageSquare, Plus, Eye, Image as ImageIcon, X, Clock, CheckSquare, Settings, Music, Play, Pause, Upload, RefreshCw, SkipBack, SkipForward, Volume2, VolumeX, LogOut, Trash2, Lock, Shield, ExternalLink, Megaphone, Inbox, Send, Bell } from 'lucide-react';
import { auth, db, signInWithGoogle, logOut } from './firebase';
import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, getDoc, where, or } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type Ad = {
  id: string;
  title: string;
  isActive: boolean;
  type: 'image' | 'video' | 'embed' | 'text';
  mediaUrl: string;
  embedCode: string;
  text: string;
  linkUrl: string;
  intervalMinutes: number;
};

type AdminMessage = {
  id: string;
  from?: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
};

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
    time: '09:00',
    title: 'Welcome to your Workspace',
    description: 'This is a default task. You can edit it, change its status, or delete it. Add new tasks by clicking the + button.',
    status: 'todo'
  }
];

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Getting Started',
    description: 'Welcome to your notes! This is a great place to jot down ideas, save links, or write long-form content. Feel free to edit or delete this note.'
  }
];

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onStatusChange }) => {
  return (
    <div className="w-full sm:w-[280px] h-[360px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 flex flex-col text-white shadow-2xl relative overflow-hidden group">
      <div className="text-[3.5rem] leading-none font-display font-light text-center mb-3 tracking-tighter">
        {task.time}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-white/20 border border-white/10 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
          <Check size={10} />
          <span>Task</span>
        </div>
        <h3 className="text-lg font-medium truncate">{task.title}</h3>
      </div>
      
      <p className="text-xs text-white/70 line-clamp-4 mb-4 flex-grow leading-relaxed">
        {task.description}
      </p>
      
      <div className="flex justify-end gap-2 mt-auto">
        {task.status === 'todo' && (
          <button onClick={() => onStatusChange(task.id, 'in-progress')} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all">
            <Clock size={12} />
            <span>Start</span>
          </button>
        )}
        {task.status === 'in-progress' && (
          <button onClick={() => onStatusChange(task.id, 'done')} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all">
            <Check size={12} />
            <span>Done</span>
          </button>
        )}
        <button onClick={() => onEdit(task)} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all">
          <Edit size={12} />
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
    <div className="w-full sm:w-[280px] h-[240px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 flex flex-col text-white shadow-2xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-white/20 border border-white/10 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
          <FileText size={10} />
          <span>Note</span>
        </div>
        <h3 className="text-lg font-medium truncate">{note.title}</h3>
      </div>
      
      <p className="text-xs text-white/70 line-clamp-4 mb-4 flex-grow leading-relaxed">
        {note.description}
      </p>
      
      <div className="flex justify-end gap-2 mt-auto">
        <button onClick={() => onDelete(note.id)} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all">
          <X size={12} />
          <span>Delete</span>
        </button>
        <button onClick={() => onEdit(note)} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all">
          <Edit size={12} />
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
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
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Admin & Ad State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [adminTab, setAdminTab] = useState<'ads' | 'messages'>('ads');
  
  // User Ad & Message State
  const [currentAdToShow, setCurrentAdToShow] = useState<Ad | null>(null);
  const [showAdToast, setShowAdToast] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [readMessages, setReadMessages] = useState<string[]>([]);
  const [deletedMessages, setDeletedMessages] = useState<string[]>([]);
  const [userReplyTo, setUserReplyTo] = useState<AdminMessage | null>(null);
  const [adminReplyTo, setAdminReplyTo] = useState<AdminMessage | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const unsubAdsRef = useRef<(() => void) | null>(null);
  const unsubMsgsRef = useRef<(() => void) | null>(null);
  const unsubUserRef = useRef<(() => void) | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        
        // Check if admin
        if (user.email === 'millionaireharry25@gmail.com') {
          setIsAdminLoggedIn(true);
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
              setIsAdminLoggedIn(true);
            } else {
              setIsAdminLoggedIn(false);
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            setIsAdminLoggedIn(false);
          }
        }
      } else {
        setUserEmail(null);
        setUserId(null);
        setIsAdminLoggedIn(false);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load global ads and messages from Firestore
  useEffect(() => {
    if (!isAuthReady) return;

    const unsubAds = onSnapshot(collection(db, 'ads'), (snapshot) => {
      const adsData: Ad[] = [];
      snapshot.forEach(doc => {
        adsData.push({ id: doc.id, ...doc.data() } as Ad);
      });
      setAds(adsData);
    }, (error) => {
      console.error("Error fetching ads:", error);
    });
    unsubAdsRef.current = unsubAds;

    let msgsQuery = query(collection(db, 'messages'));
    
    if (!isAdminLoggedIn && userEmail) {
      msgsQuery = query(
        collection(db, 'messages'),
        or(
          where('to', '==', 'all'),
          where('to', '==', userEmail),
          where('from', '==', userEmail)
        )
      );
    } else if (!isAdminLoggedIn && !userEmail) {
      // If not logged in and not admin, only get 'all' messages
      msgsQuery = query(
        collection(db, 'messages'),
        where('to', '==', 'all')
      );
    }

    const unsubMsgs = onSnapshot(msgsQuery, (snapshot) => {
      const msgsData: AdminMessage[] = [];
      snapshot.forEach(doc => {
        msgsData.push({ id: doc.id, ...doc.data() } as AdminMessage);
      });
      // Sort in client to avoid requiring a composite index
      msgsData.sort((a, b) => b.timestamp - a.timestamp);
      setAdminMessages(msgsData);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });
    unsubMsgsRef.current = unsubMsgs;

    return () => {
      if (unsubAdsRef.current) unsubAdsRef.current();
      if (unsubMsgsRef.current) unsubMsgsRef.current();
    };
  }, [isAuthReady, isAdminLoggedIn, userEmail]);

  // Load user read and deleted messages
  useEffect(() => {
    if (userId) {
      const unsubUser = onSnapshot(doc(db, 'users', userId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.readMessages) setReadMessages(data.readMessages);
          if (data.deletedMessages) setDeletedMessages(data.deletedMessages);
        } else {
          // Create user doc if it doesn't exist
          setDoc(doc(db, 'users', userId), { readMessages: [], deletedMessages: [], role: 'user' });
        }
      }, (error) => {
        console.error("Error fetching user data:", error);
      });
      unsubUserRef.current = unsubUser;
      return () => {
        if (unsubUserRef.current) unsubUserRef.current();
      };
    }
  }, [userId]);

  // Ad Rotation Logic
  useEffect(() => {
    if (!userEmail || ads.length === 0) return;
    const activeAds = ads.filter(a => a.isActive);
    if (activeAds.length === 0) return;

    const intervals = activeAds.map(ad => {
      return setInterval(() => {
        setCurrentAdToShow(ad);
        setShowAdToast(true);
      }, ad.intervalMinutes * 60 * 1000);
    });

    // Show first active ad after 8 seconds
    const initialTimeout = setTimeout(() => {
      setCurrentAdToShow(activeAds[0]);
      setShowAdToast(true);
    }, 8000);

    return () => {
      intervals.forEach(clearInterval);
      clearTimeout(initialTimeout);
    };
  }, [userEmail, ads]);

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
      
      // Show ad toast if active
      const activeAds = ads.filter(a => a.isActive);
      if (activeAds.length > 0) {
        setTimeout(() => {
          setCurrentAdToShow(activeAds[0]);
          setShowAdToast(true);
        }, 8000); // Show after music toast
      }
    } else {
      setIsDataLoaded(false);
      setShowMusicToast(false);
      setShowAdToast(false);
    }
    return () => clearTimeout(timeoutId);
  }, [userEmail, ads]);

  // Save data on change
  useEffect(() => {
    if (userEmail && isDataLoaded) {
      localStorage.setItem(`appData_${userEmail}`, JSON.stringify({
        tasks, notes, bgMedia, playlist
      }));
    }
  }, [tasks, notes, bgMedia, playlist, userEmail, isDataLoaded]);

  const handleLogout = async () => {
    if (unsubAdsRef.current) unsubAdsRef.current();
    if (unsubMsgsRef.current) unsubMsgsRef.current();
    if (unsubUserRef.current) unsubUserRef.current();
    await logOut();
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
    const files = Array.from<File>(e.target.files || []);
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

  const handleSaveAd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAd = {
      title: formData.get('title') as string,
      isActive: formData.get('isActive') === 'on',
      intervalMinutes: Number(formData.get('intervalMinutes')) || 5,
      type: formData.get('type') as Ad['type'],
      mediaUrl: formData.get('mediaUrl') as string,
      embedCode: formData.get('embedCode') as string,
      text: formData.get('text') as string,
      linkUrl: formData.get('linkUrl') as string,
      createdAt: Date.now()
    };
    
    try {
      if (editingAd) {
        await updateDoc(doc(db, 'ads', editingAd.id), newAd);
      } else {
        await addDoc(collection(db, 'ads'), newAd);
      }
      setEditingAd(null);
      setToastMessage('Advertisement saved successfully!');
    } catch (error) {
      console.error("Error saving ad", error);
      setToastMessage('Error saving advertisement');
    }
  };

  const handleDeleteAd = (id: string) => {
    setConfirmAction({
      message: 'Are you sure you want to delete this advertisement?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'ads', id));
          setConfirmAction(null);
        } catch (error) {
          console.error("Error deleting ad", error);
        }
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMsg = {
      from: isAdminLoggedIn ? 'admin' : (userEmail || 'unknown'),
      to: formData.get('to') as string,
      subject: formData.get('subject') as string,
      body: formData.get('body') as string,
      timestamp: Date.now()
    };
    
    try {
      await addDoc(collection(db, 'messages'), newMsg);
      (e.target as HTMLFormElement).reset();
      
      if (isAdminLoggedIn) {
        setAdminReplyTo(null);
        setToastMessage('Message sent successfully!');
      } else {
        setUserReplyTo(null);
        setToastMessage('Reply sent to admin!');
      }
    } catch (error) {
      console.error("Error sending message", error);
      setToastMessage('Error sending message');
    }
  };

  const handleAdminDeleteMessage = (id: string) => {
    setConfirmAction({
      message: 'Delete this message globally?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'messages', id));
          setConfirmAction(null);
        } catch (error) {
          console.error("Error deleting message", error);
        }
      }
    });
  };

  const handleUserDeleteMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    setConfirmAction({
      message: 'Delete this message from your inbox?',
      onConfirm: async () => {
        try {
          const updated = [...deletedMessages, id];
          await setDoc(doc(db, 'users', userId), { deletedMessages: updated }, { merge: true });
          setConfirmAction(null);
        } catch (error) {
          console.error("Error deleting message", error);
        }
      }
    });
  };

  const userMessages = adminMessages
    .filter(m => (m.to === 'all' || m.to === userEmail || m.from === userEmail) && !deletedMessages.includes(m.id))
    .sort((a,b) => b.timestamp - a.timestamp);
  
  const unreadCount = userMessages.filter(m => m.to !== 'admin' && m.from !== userEmail && !readMessages.includes(m.id)).length;

  const markAsRead = async (id: string) => {
    if (!userId) return;
    if (!readMessages.includes(id)) {
      try {
        const updated = [...readMessages, id];
        await setDoc(doc(db, 'users', userId), { readMessages: updated }, { merge: true });
      } catch (error) {
        console.error("Error marking message as read", error);
      }
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white p-8 font-sans overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl">
                <Shield size={24} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-light">Admin Panel</h1>
                <p className="text-white/50 text-sm">Manage Global Settings</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAdminLoggedIn(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Exit Admin
            </button>
          </div>

          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setAdminTab('ads')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${adminTab === 'ads' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              <Megaphone size={18} />
              Advertisements
            </button>
            <button 
              onClick={() => setAdminTab('messages')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${adminTab === 'messages' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              <Send size={18} />
              Send Messages
            </button>
          </div>

          {adminTab === 'ads' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <button 
                  onClick={() => setEditingAd(null)}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  Create New Ad
                </button>
                
                {ads.map(ad => (
                  <div key={ad.id} className={`bg-white/5 border rounded-2xl p-4 transition-colors ${editingAd?.id === ad.id ? 'border-emerald-500/50' : 'border-white/10'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate pr-2">{ad.title}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingAd(ad)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteAd(ad.id)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Every {ad.intervalMinutes}m
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${ad.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                  <Megaphone size={20} />
                  {editingAd ? 'Edit Advertisement' : 'New Advertisement'}
                </h2>
                
                <form onSubmit={handleSaveAd} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Ad Title (Internal)</label>
                      <input 
                        type="text" 
                        name="title" 
                        required
                        defaultValue={editingAd?.title || ''}
                        placeholder="Summer Promo"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Interval (Minutes)</label>
                      <input 
                        type="number" 
                        name="intervalMinutes" 
                        required
                        min="1"
                        defaultValue={editingAd?.intervalMinutes || 5}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      name="isActive" 
                      defaultChecked={editingAd ? editingAd.isActive : true}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black"
                    />
                    <label htmlFor="isActive" className="font-medium cursor-pointer">Enable this Advertisement</label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Media Type</label>
                      <select 
                        name="type" 
                        defaultValue={editingAd?.type || 'image'}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video (MP4/WebM)</option>
                        <option value="embed">Embed Code (YouTube/Vimeo)</option>
                        <option value="text">Text Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">Media URL (For Image/Video)</label>
                      <input 
                        type="text" 
                        name="mediaUrl" 
                        defaultValue={editingAd?.mediaUrl || ''}
                        placeholder="https://example.com/image.png"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Embed Code (For YouTube/Vimeo/etc)</label>
                    <textarea 
                      name="embedCode" 
                      defaultValue={editingAd?.embedCode || ''}
                      placeholder='<iframe src="..."></iframe>'
                      rows={3}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Advertisement Text</label>
                    <textarea 
                      name="text" 
                      defaultValue={editingAd?.text || ''}
                      placeholder="Check out this amazing new feature..."
                      rows={2}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Action Link URL</label>
                    <input 
                      type="text" 
                      name="linkUrl" 
                      defaultValue={editingAd?.linkUrl || ''}
                      placeholder="https://example.com/offer"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 font-medium transition-colors">
                      {editingAd ? 'Save Changes' : 'Create Advertisement'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {adminTab === 'messages' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium flex items-center gap-2">
                    <Send size={20} />
                    {adminReplyTo ? 'Reply to Message' : 'Send New Message'}
                  </h2>
                  {adminReplyTo && (
                    <button onClick={() => setAdminReplyTo(null)} className="text-white/50 hover:text-white text-sm">Cancel Reply</button>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="space-y-6">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Recipient Email</label>
                    <input 
                      type="text" 
                      name="to" 
                      required
                      defaultValue={adminReplyTo ? (adminReplyTo.from === 'admin' ? adminReplyTo.to : (adminReplyTo.from || '')) : ''}
                      placeholder="user@example.com OR 'all' for everyone"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Subject</label>
                    <input 
                      type="text" 
                      name="subject" 
                      required
                      defaultValue={adminReplyTo ? (adminReplyTo.subject.startsWith('Re:') ? adminReplyTo.subject : `Re: ${adminReplyTo.subject}`) : ''}
                      placeholder="Important Update"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Message Body</label>
                    <textarea 
                      name="body" 
                      required
                      rows={5}
                      placeholder="Write your message here..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 font-medium transition-colors">
                    {adminReplyTo ? 'Send Reply' : 'Send Message'}
                  </button>
                </form>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col">
                <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                  <MessageSquare size={20} />
                  All Messages
                </h2>
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                  {adminMessages.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No messages yet</p>
                  ) : (
                    adminMessages.map(msg => (
                      <div key={msg.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{msg.subject}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                              {new Date(msg.timestamp).toLocaleDateString()}
                            </span>
                            <button onClick={() => setAdminReplyTo(msg)} className="text-white/50 hover:text-white transition-colors" title="Reply">
                              <MessageSquare size={14} />
                            </button>
                            <button onClick={() => handleAdminDeleteMessage(msg.id)} className="text-red-400/50 hover:text-red-400 transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-4 mb-2">
                          <p className="text-xs text-emerald-400">From: {msg.from || 'admin'}</p>
                          <p className="text-xs text-blue-400">To: {msg.to}</p>
                        </div>
                        <p className="text-sm text-white/70 line-clamp-2">{msg.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-medium animate-in slide-in-from-top-4 fade-in duration-300">
            {toastMessage}
          </div>
        )}

        {/* Confirm Action Modal */}
        {confirmAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-white shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-medium mb-4">Confirm Action</h3>
              <p className="text-white/70 mb-6">{confirmAction.message}</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setConfirmAction(null)} 
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAction.onConfirm} 
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="flex flex-col h-screen items-center justify-center relative font-sans p-4 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <iframe 
            src="https://player.vimeo.com/video/1169668529?background=1&autoplay=1&loop=1&muted=1" 
            className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
            frameBorder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {isAppLoading ? (
          <div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
              <div className="absolute inset-0 border-t-2 border-white/20 border-r-2 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-2 border-b-2 border-white/40 border-l-2 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              <div className="absolute inset-4 border-t-2 border-white/60 border-l-2 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-md border border-white/10 animate-pulse">
                <CheckSquare size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-white/80 font-light tracking-[0.3em] uppercase text-sm animate-pulse">Loading Workspace</h2>
          </div>
        ) : (
          <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 w-full max-w-md text-white shadow-2xl animate-in fade-in zoom-in-95 duration-700">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-md border border-white/10">
                <CheckSquare size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-light mb-2 text-center">Welcome Back</h1>
            <p className="text-white/60 text-center mb-8 text-sm">Sign in to sync your tasks and notes</p>
            <div className="flex flex-col gap-4">
              <button onClick={signInWithGoogle} className="w-full bg-white text-black rounded-xl py-3 font-medium hover:bg-gray-200 transition-colors mt-2 flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative font-sans bg-black">
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

      {isAppLoading ? (
        <div className="relative z-10 flex flex-col h-full items-center justify-center animate-in fade-in duration-1000">
          <div className="relative flex items-center justify-center w-32 h-32 mb-8">
            <div className="absolute inset-0 border-t-2 border-white/20 border-r-2 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-2 border-b-2 border-white/40 border-l-2 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
            <div className="absolute inset-4 border-t-2 border-white/60 border-l-2 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="p-4 bg-white/10 rounded-full backdrop-blur-md border border-white/10 animate-pulse">
              <CheckSquare size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-white/80 font-light tracking-[0.3em] uppercase text-sm animate-pulse">Loading Workspace</h2>
        </div>
      ) : (
        <>
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-8 animate-in fade-in duration-700">
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

          <div className="flex gap-2">
            <button 
              onClick={() => setIsInboxOpen(true)} 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 text-sm flex items-center gap-2 text-white transition-all relative"
            >
              <Inbox size={16} />
              <span className="hidden sm:inline">Inbox</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
              )}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 text-sm flex items-center gap-2 text-white transition-all">
              <Settings size={16} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
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
              <AddCard onClick={() => openModal('task', 'add')} heightClass="h-[360px]" />
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
              <AddCard onClick={() => openModal('note', 'add')} heightClass="h-[240px]" />
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-medium animate-in slide-in-from-top-4 fade-in duration-300">
          {toastMessage}
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-medium mb-4">Confirm Action</h3>
            <p className="text-white/70 mb-6">{confirmAction.message}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmAction(null)} 
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction.onConfirm} 
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advertisement Toast */}
      {showAdToast && currentAdToShow && currentAdToShow.isActive && (
        <div className="fixed bottom-6 left-6 z-40 bg-zinc-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-5 shadow-2xl w-[320px] animate-in slide-in-from-bottom-8 fade-in duration-500">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-emerald-500/20 rounded-full">
                <Megaphone size={16} className="text-emerald-400" />
              </div>
              <h3 className="font-medium text-sm">{currentAdToShow.title}</h3>
            </div>
            <button onClick={() => setShowAdToast(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          
          {currentAdToShow.type === 'image' && currentAdToShow.mediaUrl && (
            <div className="relative w-full rounded-xl overflow-hidden mb-4 bg-black/50">
              <img 
                src={currentAdToShow.mediaUrl} 
                alt="Advertisement"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {currentAdToShow.type === 'video' && currentAdToShow.mediaUrl && (
            <div className="relative w-full rounded-xl overflow-hidden mb-4 bg-black/50">
              <video 
                src={currentAdToShow.mediaUrl} 
                autoPlay 
                loop 
                muted 
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {currentAdToShow.type === 'embed' && currentAdToShow.embedCode && (
            <div 
              className="relative w-full rounded-xl overflow-hidden mb-4 bg-black/50 aspect-video [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:absolute [&>iframe]:top-0 [&>iframe]:left-0"
              dangerouslySetInnerHTML={{ __html: currentAdToShow.embedCode }}
            />
          )}

          {currentAdToShow.text && (
            <p className="text-xs text-white/80 mb-4 leading-relaxed">
              {currentAdToShow.text}
            </p>
          )}

          {currentAdToShow.linkUrl && (
            <a 
              href={currentAdToShow.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowAdToast(false)}
              className="w-full bg-emerald-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
              Learn More
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {/* Inbox Modal */}
      {isInboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Inbox size={20} />
                </div>
                <h2 className="text-xl font-medium">Inbox</h2>
              </div>
              <button onClick={() => { setIsInboxOpen(false); setUserReplyTo(null); }} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {userReplyTo ? (
              <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-emerald-400">Reply to Admin</h3>
                  <button onClick={() => setUserReplyTo(null)} className="text-xs text-white/50 hover:text-white">Cancel</button>
                </div>
                <form onSubmit={handleSendMessage} className="space-y-4 flex-grow flex flex-col">
                  <input type="hidden" name="to" value="admin" />
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Subject</label>
                    <input 
                      type="text" 
                      name="subject" 
                      required
                      defaultValue={userReplyTo.subject.startsWith('Re:') ? userReplyTo.subject : `Re: ${userReplyTo.subject}`}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-white/30 text-sm"
                    />
                  </div>
                  <div className="flex-grow flex flex-col">
                    <label className="block text-xs text-white/60 mb-1">Message</label>
                    <textarea 
                      name="body" 
                      required
                      className="w-full flex-grow bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-white/30 text-sm resize-none min-h-[150px]"
                      placeholder="Type your reply..."
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 font-medium transition-colors mt-auto">
                    Send Reply
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                {userMessages.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <Bell size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  userMessages.map(msg => {
                    const isUnread = msg.to !== 'admin' && msg.from !== userEmail && !readMessages.includes(msg.id);
                    const isSentByMe = msg.from === userEmail;
                    return (
                      <div 
                        key={msg.id} 
                        onClick={() => !isSentByMe && markAsRead(msg.id)}
                        className={`p-4 rounded-2xl border transition-colors ${isUnread ? 'bg-white/10 border-white/20 cursor-pointer' : 'bg-black/30 border-white/5'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-medium ${isUnread ? 'text-white' : 'text-white/70'}`}>
                            {msg.subject}
                            {isUnread && <span className="ml-2 inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                              {new Date(msg.timestamp).toLocaleDateString()}
                            </span>
                            {!isSentByMe && (
                              <button onClick={(e) => { e.stopPropagation(); setUserReplyTo(msg); }} className="text-white/50 hover:text-white transition-colors" title="Reply">
                                <MessageSquare size={14} />
                              </button>
                            )}
                            <button onClick={(e) => handleUserDeleteMessage(msg.id, e)} className="text-red-400/50 hover:text-red-400 transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-white/40 mb-2">
                          {isSentByMe ? 'Sent to Admin' : (msg.from === 'admin' ? 'From: Admin' : `From: ${msg.from}`)}
                        </p>
                        <p className={`text-sm ${isUnread ? 'text-white/80' : 'text-white/50'}`}>
                          {msg.body}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
