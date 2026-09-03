import React from 'react';

export default function UpdateNotification({ latestVersion, downloadUrl, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center">
        <h2 className="text-xl font-bold text-emerald-700 mb-3">Versi baru tersedia</h2>
        <p className="text-slate-700 mb-4">
          Versi <span className="font-medium text-emerald-600">{latestVersion}</span> sudah siap.
        </p>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
        >
          Unduh APK terbaru
        </a>
        <button
          onClick={onClose}
          className="mt-3 text-sm text-slate-500 hover:underline"
        >
          Nanti saja
        </button>
      </div>
    </div>
  );
}
