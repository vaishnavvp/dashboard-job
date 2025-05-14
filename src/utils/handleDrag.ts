/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/handleDrag.ts

export async function handleDrag(
    jobs: any[],
    event: { over: any; active: any },
    updateStatus: (id: string, status: string) => Promise<void>
  ) {
    const { over, active } = event;
    if (!over || over.id === active.id) return;
  
    const targetStatus = over.id;
    const draggedJob = jobs.find((job) => job.id === active.id);
  
    if (draggedJob?.status !== targetStatus) {
      await updateStatus(active.id, targetStatus);
    }
  }
  