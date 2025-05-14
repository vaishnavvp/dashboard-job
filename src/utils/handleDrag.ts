/* eslint-disable @typescript-eslint/no-explicit-any */
const STATUSES = ["applied", "interview", "offer", "hired", "rejected"];

export async function handleDrag(
  jobs: any[],
  event: { active: any; over: any },
  updateStatus: (id: string, status: string) => Promise<void>
) {
  const { active, over } = event;
  if (!over || over.id === active.id) return;

  const targetStatus = over.id;

  // ✅ only update if dropped on a valid status column
  if (!STATUSES.includes(targetStatus)) return;

  const draggedJob = jobs.find((job) => job.id === active.id);
  if (draggedJob?.status !== targetStatus) {
    await updateStatus(active.id, targetStatus);
  }
}
