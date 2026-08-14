/* HabitFlow Firebase Realtime Database Profile Image Engine */

import { rtdb, rtdbRef, rtdbSet, rtdbGet } from './firebase.js';

/**
 * Converts a Blob / File object into a Base64 Data URL string
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    if (!blob) return resolve('');
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result || '');
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

/**
 * Sanitizes a username so it is a valid Realtime Database key.
 * Firebase RTDB keys cannot contain `.`, `#`, `$`, `[`, `]`, or `/`
 */
export function sanitizeUsernameKey(userName) {
  if (!userName || typeof userName !== 'string') return 'User';
  const sanitized = userName.trim().replace(/[.#$\[\]\/]/g, '_');
  return sanitized || 'User';
}

/**
 * Saves or updates a user's profile picture in Realtime Database under:
 * users/{UserName}/profilePicture
 */
export async function saveProfilePictureToRTDB(userName, imageBlobOrDataUrl) {
  if (!userName) return null;
  try {
    const key = sanitizeUsernameKey(userName);
    let pictureData = imageBlobOrDataUrl;

    if (imageBlobOrDataUrl instanceof Blob) {
      pictureData = await blobToBase64(imageBlobOrDataUrl);
    }

    if (!pictureData || typeof pictureData !== 'string') {
      console.warn("[RTDB Warning] No valid profile picture data to save for:", userName);
      return null;
    }

    console.log("[RTDB] Saving profile picture under users/" + key + "/profilePicture...");
    const targetRef = rtdbRef(rtdb, `users/${key}`);
    await rtdbSet(targetRef, {
      profilePicture: pictureData
    });

    console.log("[RTDB] Profile picture saved successfully for:", key);
    return pictureData;
  } catch (error) {
    console.error("[RTDB Error] Failed to save profile picture for " + userName + ":", error);
    throw error;
  }
}

/**
 * Retrieves a user's profile picture from Realtime Database under:
 * users/{UserName}/profilePicture
 */
export async function getProfilePictureFromRTDB(userName) {
  if (!userName) return null;
  try {
    const key = sanitizeUsernameKey(userName);
    const picRef = rtdbRef(rtdb, `users/${key}/profilePicture`);
    const snapshot = await rtdbGet(picRef);

    if (snapshot.exists()) {
      const val = snapshot.val();
      if (val && typeof val === 'string' && val.trim()) {
        console.log("[RTDB] Successfully retrieved profile picture for:", key);
        return val.trim();
      }
    }
    return null;
  } catch (error) {
    console.warn("[RTDB Warning] Could not retrieve profile picture for " + userName + ":", error);
    return null;
  }
}
