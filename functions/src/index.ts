import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const updateJobStats = functions.firestore
  .document("jobs/{jobId}")
  .onWrite(async (change, context) => {
    const jobId = context.params.jobId;
    const before = change.before.data();
    const after = change.after.data();
    console.log(jobId, "jobid");


    // Exit if job was deleted
    if (!after) return;

    const uid = after.owner;
    const prevStatus = before?.status;
    const newStatus = after.status;

    const statsRef = db.collection("users").doc(uid).collection("stats");

    const batch = db.batch();

    // Decrement old status
    if (prevStatus && prevStatus !== newStatus) {
      const prevRef = statsRef.doc(prevStatus);
      batch.set(prevRef, {count: admin.firestore.FieldValue.increment(-1)},
        {merge: true});
    }

    // Increment new status
    if (newStatus) {
      const newRef = statsRef.doc(newStatus);
      batch.set(newRef, {count: admin.firestore.FieldValue.increment(-1)},
        {merge: true});
    }

    return batch.commit();
  });
