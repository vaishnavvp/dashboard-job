/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { db, storage } from "../../../lib/firebase";
import Image from "next/image";
import { ref as storageRefFn, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
      const docRef = doc(db, "jobs", id as string);
      const snapshot = await getDoc(docRef);
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

    const docRef = doc(db, "jobs", id as string);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      alert("This job no longer exists.");
      return;
    }

    const updatedForm = { ...form };

    // If a file is selected, upload it to Firebase Storage
    if (file) {
      setUploading(true);
      const logoRef = storageRefFn(storage, `logos/${id}`);
      const uploadTask = uploadBytesResumable(logoRef, file);
      await uploadTask;
      const url = await getDownloadURL(logoRef);
      updatedForm.logoURL = url;
      setUploading(false);
    }

    await updateDoc(docRef, updatedForm);
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

        {form.logoURL && (
           <Image
           src={form.logoURL}
           alt="Logo Preview"
           width={120}
           height={80}
           className="rounded"
         />
        )}

        <input type="file" accept="image/*" onChange={handleLogoChange} />

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
