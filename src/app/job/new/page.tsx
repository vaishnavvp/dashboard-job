"use client";

import { db, storage } from "../../../lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const STATUSES = ["applied", "interview", "offer", "hired", "rejected"];

export default function NewJobPage() {
  const router = useRouter();
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    status: "applied",
    logoURL: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);

    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in");

    setLoading(true);

    try {
      let logoURL = "";

      if (file) {
        const imageRef = ref(storage, `logos/${user.uid}_${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        // logoURL = await getDownloadURL(imageRef);
        // Already correct if using getDownloadURL after uploadBytes:
        logoURL = await getDownloadURL(imageRef); // This is already CORS-safe

      }

      await addDoc(collection(db, "jobs"), {
        ...form,
        logoURL,
        owner: user.uid,
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (err) {
      alert("Failed to save job.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {preview && (
          <Image
            src={preview}
            alt="Logo Preview"
            width={120}
            height={80}
            className="rounded"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
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
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Job"}
        </button>
      </form>
    </main>
  );
}
