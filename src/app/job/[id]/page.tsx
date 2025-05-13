"use client";

import { db, storage } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const STATUSES = ["applied", "interview", "offer", "hired", "rejected"];

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    company: "",
    logoURL: "",
    notes: "",
    status: "applied",
  });
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      const ref = doc(db, "jobs", id as string);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setForm(snapshot.data() as any);
      }
      setLoading(false);
    };

    fetchJob();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = doc(db, "jobs", id as string);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      alert("This job no longer exists.");
      return;
    }

    let updatedForm = { ...form };

    // If file selected, upload to Firebase Storage
    if (file) {
      setUploading(true);
      const storageRef = ref(storage, `logos/${id}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await uploadTask;
      const url = await getDownloadURL(storageRef);
      updatedForm.logoURL = url;
      setUploading(false);
    }

    await updateDoc(ref, updatedForm);
    router.push("/dashboard");
  };

  if (loading) return <p className="p-4">Loading job...</p>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Edit Job</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          name="title"
          placeholder="Job Title"
          onChange={handleChange}
          value={form.title}
          required
        />
        <input
          className="w-full border px-3 py-2 rounded"
          name="company"
          placeholder="Company Name"
          onChange={handleChange}
          value={form.company}
          required
        />

        {/* Company Logo Preview */}
        {form.logoURL && (
          <img
            src={form.logoURL}
            alt="Company Logo"
            className="w-32 h-32 object-contain border rounded"
          />
        )}

        {/* Upload Logo Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
        />

        <textarea
          className="w-full border px-3 py-2 rounded"
          name="notes"
          placeholder="Notes"
          onChange={handleChange}
          value={form.notes}
        />
        <select
          className="w-full border px-3 py-2 rounded"
          name="status"
          onChange={handleChange}
          value={form.status}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
