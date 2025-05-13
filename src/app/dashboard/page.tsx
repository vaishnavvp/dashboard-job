"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import AuthCheck from "../../components/AuthCheck";
import ThemeToggle from "../../components/ThemeToggle";

const STATUSES = ["applied", "interview", "offer", "hired", "rejected"];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribers: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const jobsQuery = query(
        collection(db, "jobs"),
        where("owner", "==", user.uid)
      );
      const unsubJobs = onSnapshot(jobsQuery, (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        setJobs(data);
        setLoading(false);
      });
      unsubscribers.push(unsubJobs);

      const statsRef = collection(db, "users", user.uid, "stats");
      const unsubStats = onSnapshot(statsRef, (snap) => {
        const counts: Record<string, number> = {};
        snap.forEach((doc) => {
          counts[doc.id] = doc.data().count || 0;
        });
        setStatusCounts(counts);
      });
      unsubscribers.push(unsubStats);
    });

    return () => {
      unsubscribeAuth();
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  useEffect(() => {
    const counts: Record<string, number> = {};
    STATUSES.forEach((status) => {
      counts[status] = jobs.filter((j) => j.status === status).length;
    });
    setStatusCounts(counts);
  }, [jobs]);

  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = async (event: any) => {
    const { over, active } = event;
    if (!over || over.id === active.id) return;

    const targetStatus = over.id;
    const draggedJob = jobs.find((job) => job.id === active.id);

    if (draggedJob?.status !== targetStatus) {
      await updateDoc(doc(db, "jobs", active.id), { status: targetStatus });
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  const jobsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = jobs.filter((job) => job.status === status);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <AuthCheck>
      <main className="p-6 text-black dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Job Pipeline Dashboard</h1>
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              onClick={() => router.push("/job/new")}
              className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
            >
              Add Job
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading jobs...</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              {STATUSES.map((status) => (
                <div
                  key={status}
                  className="bg-gray-100 dark:bg-gray-800 text-sm px-4 py-2 rounded shadow"
                >
                  <span className="capitalize font-medium">{status}</span>:{" "}
                  <span>{statusCounts[status] || 0}</span>
                </div>
              ))}
            </div>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
              sensors={sensors}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {STATUSES.map((status) => (
                  <Column
                    key={status}
                    id={status}
                    jobs={jobsByStatus[status]}
                  />
                ))}
              </div>
            </DndContext>
          </>
        )}
      </main>
    </AuthCheck>
  );
}

function Column({ id, jobs }: { id: string; jobs: any[] }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 dark:bg-gray-800 rounded shadow p-3 min-h-[200px]"
    >
      <h2 className="capitalize font-semibold mb-3">{id}</h2>
      <SortableContext
        items={jobs.map((j) => j.id)}
        strategy={verticalListSortingStrategy}
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </SortableContext>
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-white dark:bg-gray-100 border dark:border-gray-600 rounded p-2 mb-2 shadow text-sm cursor-move"
    >
      <div className="font-medium text-black dark:text-gray-900">
        {job.title}
      </div>
      <div className="text-xs text-gray-500">{job.company}</div>
    </div>
  );
}
