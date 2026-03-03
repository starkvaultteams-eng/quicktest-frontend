import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { adminAPI } from '../services/api';
import api from '../services/api';
import { MdUpload } from 'react-icons/md';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const refreshData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, pdfRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUploadedPDFs(),
      ]);
      const rawStats = statsRes.data;
      console.log('raw stats payload', rawStats);
      const normalizedStats = rawStats?.stats || rawStats || {};
      const statsForUi = {
        users: normalizedStats.users ?? normalizedStats.totalUsers ?? 0,
        quizzes: normalizedStats.quizzes ?? normalizedStats.totalAttempts ?? 0,
        pdfs: normalizedStats.pdfs ?? normalizedStats.totalUploads ?? 0,
      };
      setStats(statsForUi);

      const raw = pdfRes.data;
      let list = [];
      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw.pdfs)) list = raw.pdfs;
      else if (raw && typeof raw === 'object' && Object.keys(raw).length === 0) list = [];
      else if (raw && typeof raw === 'object' && raw.files && Array.isArray(raw.files)) list = raw.files;
      else if (raw && typeof raw === 'object') {
        const maybe = raw.pdfs || raw.files || raw.items || null;
        if (Array.isArray(maybe)) list = maybe;
        else list = [];
      }
      setPdfs(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const apiBase = (() => {
    try {
      const base = api.defaults?.baseURL || '';
      return base.replace(/\/api\/?$/, '') || '';
    } catch (e) {
      return '';
    }
  })();

  const buildDownloadHref = (item) => {
    if (!item || typeof item !== 'object') return '#';

    if (item.fileUrl) return item.fileUrl;
    if (item.url && /^https?:\/\//i.test(item.url)) return item.url;

    const key = item.cloudinaryPublicId || item.filename || item._id || item.id;
    if (!key) return '#';

    return `${apiBase}/uploads/${encodeURIComponent(String(key))}`;
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      await adminAPI.uploadPDF(file);
      const pdfRes = await adminAPI.getUploadedPDFs();
      const raw = pdfRes.data;
      let list = [];
      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw.pdfs)) list = raw.pdfs;
      else if (raw && typeof raw === 'object' && raw.files && Array.isArray(raw.files)) list = raw.files;
      else list = [];
      setPdfs(list);
    } catch (err) {
      console.error(err);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    const id = item._id || item.id;
    if (!id) {
      alert('Cannot delete: missing id on this file');
      return;
    }
    if (!confirm('Delete this upload? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUploadedPDF(id);
      setPdfs((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (e) {
      console.error('delete failed', e);
      alert('Delete failed');
    }
  };

  const handleDownload = (item, href) => {
    const id = item._id || item.id;
    if (!href || href === '#') {
      alert('Download link unavailable');
      if (id) {
        setPdfs((prev) =>
          prev.map((p) => {
            const key = p._id || p.id;
            return key === id ? { ...p, status: 'missing' } : p;
          })
        );
      }
      return;
    }

    try {
      window.open(href, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('download open failed', e);
      if (id) {
        setPdfs((prev) =>
          prev.map((p) => {
            const key = p._id || p.id;
            return key === id ? { ...p, status: 'missing' } : p;
          })
        );
      }
      alert('Could not open file. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[800px] mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-2">
              <button
                onClick={refreshData}
                className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('metadataCache');
                  alert('Course metadata cache cleared');
                }}
                className="px-3 py-1 bg-amber-500 text-white rounded-md text-sm hover:bg-amber-600 transition"
              >
                Clear Cache
              </button>
            </div>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {stats && Object.keys(stats).length === 0 && (
                <p className="text-sm text-red-500 mb-4">
                  Warning: `/admin/stats` returned empty object. Ensure the
                  backend provides `users`, `quizzes`, and `pdfs` counts.
                </p>
              )}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <h3 className="text-lg font-bold">Total Users</h3>
                  <p className="text-3xl font-black text-primary">{typeof stats?.users === 'number' ? stats.users : '--'}</p>
                  {stats && Object.keys(stats).length > 0 && !('users' in stats) && (
                    <>
                      <p className="text-xs text-slate-500 mt-2">Stats unavailable — try Refresh</p>
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(stats, null, 2)}</pre>
                    </>
                  )}
                </div>
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <h3 className="text-lg font-bold">Quizzes Taken</h3>
                  <p className="text-3xl font-black text-primary">{typeof stats?.quizzes === 'number' ? stats.quizzes : '--'}</p>
                  {stats && Object.keys(stats).length > 0 && !('quizzes' in stats) && (
                    <>
                      <p className="text-xs text-slate-500 mt-2">Stats unavailable — try Refresh</p>
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(stats, null, 2)}</pre>
                    </>
                  )}
                </div>
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <h3 className="text-lg font-bold">PDF Uploads</h3>
                  <p className="text-3xl font-black text-primary">{typeof stats?.pdfs === 'number' ? stats.pdfs : (Array.isArray(pdfs) ? pdfs.length : '--')}</p>
                  {stats && Object.keys(stats).length > 0 && !('pdfs' in stats) && (
                    <>
                      <p className="text-xs text-slate-500 mt-2">Showing uploads count from list</p>
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(stats, null, 2)}</pre>
                    </>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Course Materials (PDFs)</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <MdUpload className="text-xl text-primary" />
                  <span className="text-primary underline">Choose PDF</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handlePDFUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {error && <p className="text-red-500">{error}</p>}
                {uploading && <p>Uploading...</p>}
              </section>

              <section className="space-y-2">
                <h2 className="text-2xl font-bold">Uploaded Files</h2>
                <p className="text-xs text-slate-500">
                  If downloads fail, ensure link is built from <code>cloudinaryPublicId</code>, <code>filename</code>, or <code>_id</code>.
                </p>
                {pdfs.length === 0 && <p className="text-sm">No PDFs uploaded</p>}
                <div className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-sm font-medium px-3 py-2 border-b border-slate-200/10">
                    <div className="col-span-1 sm:col-span-6">Filename</div>
                    <div className="col-span-1 sm:col-span-2">Uploaded</div>
                    <div className="col-span-1 sm:col-span-2">Status</div>
                    <div className="col-span-1 sm:col-span-2 text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-200/5">
                    {Array.isArray(pdfs) ? pdfs.map((p, idx) => {
                      let href = '#';
                      let label = '';
                      let uploadedAt = '';
                      let status = p?.status || '';
                      if (typeof p === 'string') {
                        label = p;
                      } else if (p && typeof p === 'object') {
                        label = p.originalname || p.name || p.filename || (p._id ? String(p._id) : JSON.stringify(p));
                        href = buildDownloadHref(p);
                        uploadedAt = p.createdAt || p.uploadedAt || '';
                        if (!p.originalname && !p.name && !p.filename && !p._id) console.warn('Admin: unexpected upload item shape', p);
                      } else {
                        label = String(p);
                      }

                      return (
                        <div key={idx} className="grid grid-cols-12 gap-4 items-center px-3 py-3">
                          <div className="col-span-6 sm:col-span-6 truncate">{label}</div>
                          <div className="col-span-12 sm:col-span-2 text-slate-500 text-sm">{uploadedAt ? new Date(uploadedAt).toLocaleString() : '—'}</div>
                          <div className="col-span-12 sm:col-span-2 text-sm">
                            {status === 'missing' ? (
                              <span className="text-red-500 font-bold">missing</span>
                            ) : (
                              status || 'available'
                            )}
                          </div>
                          <div className="col-span-12 sm:col-span-2 flex justify-end gap-2">
                            <button onClick={() => handleDownload(p, href)} className="px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-md text-primary hover:underline">
                              Download
                            </button>
                            <button onClick={() => handleDelete(p)} className="px-3 py-1 bg-red-500 text-white rounded-md">Delete</button>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-4 text-sm text-red-500">Unexpected upload data format</div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
