/* HabitFlow Firebase Storage Adapter (WebP Profile Uploads with Logging) */

import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from './firebase.js';

export async function uploadProfilePicture(uid, imageBlob) {
  try {
    const storageRef = ref(storage, `profileImages/${uid}/profile.webp`);
    const metadata = { contentType: 'image/webp' };

    await uploadBytes(storageRef, imageBlob, metadata);
    const downloadUrl = await getDownloadURL(storageRef);

    if (!downloadUrl || typeof downloadUrl !== 'string') {
      throw new Error("Failed to obtain valid download URL from Firebase Storage");
    }

    return downloadUrl;
  } catch (error) {
    console.error("[Storage Error] Upload failed:", error);
    throw error;
  }
}

export async function deleteProfilePicture(uid) {
  try {
    const storageRef = ref(storage, `profileImages/${uid}/profile.webp`);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.warn("Could not delete profile picture:", error);
    return false;
  }
}
