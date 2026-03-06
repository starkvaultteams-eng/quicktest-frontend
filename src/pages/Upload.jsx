import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { adminAPI, quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdUpload, MdFileUpload } from 'react-icons/md';

export default function Upload() {
  const [myUploads, setMyUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetch = async () => {
    try {
      const res = await quizAPI.getMyUploads();
      setMyUploads(res.data.uploads || res.data);
      setLoadError('');
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        // not authenticated / session expired
        navigate('/login');
        return;
      }
      setLoadError('Failed to load your uploads');
      // do not redirect; user can still try uploading or log in again
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleApprove = async (item) => {
    const id = item?._id || item?.id;
    if (!id) return;
    try {
      await adminAPI.updateUploadedPDFStatus(id, 'approved');
      setMyUploads((prev) =>
        prev.map((u) => ((u._id || u.id) === id ? { ...u, status: 'approved' } : u))
      );
    } catch (e) {
      console.error('approve failed', e);
      alert('Approve failed');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <MdFileUpload /> Contribute Materials
          </h1>
          {loadError && <p className="text-red-500 mb-4">{loadError}</p>}
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Please upload any helpful resources (PDFs or images).
            Submissions are not automatically processed - the instructor will
            review them manually and incorporate them into the question bank.
          </p>

          <div className="glass-card rounded-3xl p-6 border-2 border-primary/20">
            <label className="block mb-2 font-medium">Upload a file (PDF/Image)</label>
            <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
              <MdUpload /> Choose File
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setUploading(true);
                  try {
                    await quizAPI.uploadPDF(f);
                    await fetch();
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploading && <p className="text-sm text-slate-500">Uploading...</p>}
          </div>

          {myUploads.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MdFileUpload /> Your Submissions
              </h2>
              <ul className="space-y-2">
                {myUploads.map((u) => (
                  <li key={u._id || u.filename} className="flex items-center gap-2">
                    <MdFileUpload className="text-primary" />
                    <span>{u.originalname || u.filename}</span>
                    <span className="text-sm text-slate-500">- {u.status}</span>
                    {user?.isAdmin && (
                      <button
                        onClick={() => handleApprove(u)}
                        disabled={u.status === 'approved'}
                        className="ml-2 px-2 py-1 text-xs rounded bg-emerald-600 text-white disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
