/* HabitFlow Firebase Authentication Layer (Race Condition Free & Sequential Persistence) */

import { 
  auth, 
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  deleteUser
} from './firebase.js';

import { saveUserProfile, fetchUserProfile } from './firestore.js';
import { uploadProfilePicture } from './storage.js';
import { stateManager } from './state.js';
import { saveProfilePictureToRTDB, getProfilePictureFromRTDB } from './rtdb-profile.js';

let isRegistrationInProgress = false;

export function listenAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (isRegistrationInProgress) {
        console.log("[AuthListener] Registration in progress. Deferring auth listener callback.");
        return;
      }

      try {
        console.log("[AuthListener] User authenticated. UID:", user.uid);
        let profile = await fetchUserProfile(user.uid);
        const userName = profile?.name || user.displayName || 'User';
        
        // Retrieve profile picture from Firebase Realtime Database under users/{userName}/profilePicture
        const rtdbPic = await getProfilePictureFromRTDB(userName);

        if (!profile || !profile.name || profile.name === 'User') {
          if (user.displayName && user.displayName !== 'User') {
            profile = {
              uid: user.uid,
              name: user.displayName,
              email: user.email,
              profileImageUrl: rtdbPic || user.photoURL || profile?.profileImageUrl || '',
              createdAt: profile?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await saveUserProfile(user.uid, profile);
          }
        }

        const userObj = {
          uid: user.uid,
          name: userName,
          email: user.email,
          profileImageUrl: rtdbPic || profile?.profileImageUrl || user.photoURL || '',
          createdAt: profile?.createdAt || new Date().toISOString()
        };
        
        callback(userObj);
      } catch (err) {
        console.error("[AuthListener Error] Failed during auth state processing:", err);
        callback({
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          profileImageUrl: user.photoURL || '',
          createdAt: new Date().toISOString()
        });
      }
    } else {
      callback(null);
    }
  });
}

export async function registerAccount(name, email, password, croppedImageBlob = null) {
  console.log("[Auth] Starting registration for:", email, "Name:", name);
  isRegistrationInProgress = true;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("[Auth] Firebase Auth user created. UID:", user.uid);

    let profileImageUrl = '';
    if (croppedImageBlob) {
      try {
        // Save to Firebase Realtime Database users/{name}/profilePicture
        const rtdbData = await saveProfilePictureToRTDB(name, croppedImageBlob);
        profileImageUrl = rtdbData || '';

        // Also upload to Firebase Storage
        const storageUrl = await uploadProfilePicture(user.uid, croppedImageBlob);
        if (!profileImageUrl) profileImageUrl = storageUrl;
      } catch (e) {
        console.error("[Auth Error] Profile picture upload failed during registration:", e);
      }
    }

    try {
      await updateProfile(user, {
        displayName: name,
        photoURL: profileImageUrl
      });
    } catch (e) {
      console.warn("[Auth Warning] Failed to update Firebase Auth profile metadata:", e);
    }

    const profileData = {
      uid: user.uid,
      name: name,
      email: user.email,
      profileImageUrl: profileImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveUserProfile(user.uid, profileData);

    stateManager.currentUser = profileData;
    isRegistrationInProgress = false;

    stateManager.notify();
    return profileData;
  } catch (error) {
    isRegistrationInProgress = false;
    console.error("[Auth Error] Registration process failed:", error);
    throw error;
  }
}

export async function loginAccount(email, password) {
  console.log("[Auth] Attempting login for:", email);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  let profile = await fetchUserProfile(user.uid);
  const userName = profile?.name || user.displayName || 'User';

  // Retrieve profile picture from Firebase Realtime Database
  const rtdbPic = await getProfilePictureFromRTDB(userName);

  if (!profile || !profile.name || profile.name === 'User') {
    if (user.displayName && user.displayName !== 'User') {
      profile = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        profileImageUrl: rtdbPic || user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveUserProfile(user.uid, profile);
    }
  }

  const userObj = {
    uid: user.uid,
    name: userName,
    email: user.email,
    profileImageUrl: rtdbPic || profile?.profileImageUrl || user.photoURL || ''
  };

  stateManager.currentUser = userObj;
  stateManager.notify();
  return userObj;
}

export async function logoutAccount() {
  await signOut(auth);
}

export async function updateAccountProfile(uid, { name, email, password, croppedImageBlob }) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No active user session");

  const targetUid = currentUser.uid;
  const oldName = stateManager.currentUser?.name || currentUser.displayName || 'User';
  const effectiveName = name || oldName;
  const updates = {};

  if (name && name !== oldName) {
    updates.name = name;
    await updateProfile(currentUser, { displayName: name });

    // Migrate existing RTDB profile picture to the new username if name changed
    try {
      const existingPic = await getProfilePictureFromRTDB(oldName);
      if (existingPic) {
        await saveProfilePictureToRTDB(name, existingPic);
      }
    } catch (e) {
      console.warn("Could not migrate RTDB picture to new name:", e);
    }
  }

  if (email && email !== currentUser.email) {
    await updateEmail(currentUser, email);
    updates.email = email;
  }

  if (croppedImageBlob) {
    console.log("[Auth] Uploading cropped image to RTDB & Storage for user:", effectiveName);
    
    // 1. Save directly to Firebase Realtime Database under users/{effectiveName}/profilePicture
    const rtdbDataUrl = await saveProfilePictureToRTDB(effectiveName, croppedImageBlob);

    // 2. Also upload to Firebase Storage
    let storageUrl = '';
    try {
      const storageRef = ref(storage, `profileImages/${targetUid}/profile.webp`);
      const metadata = { contentType: croppedImageBlob.type || 'image/webp' };
      await uploadBytes(storageRef, croppedImageBlob, metadata);
      storageUrl = await getDownloadURL(storageRef);
    } catch (e) {
      console.warn("Firebase Storage upload fallback:", e);
    }

    const finalPicUrl = rtdbDataUrl || storageUrl;
    updates.profileImageUrl = finalPicUrl;

    try {
      await updateProfile(currentUser, { photoURL: finalPicUrl });
    } catch (e) {
      console.warn("[Auth Warning] Could not update Auth photoURL:", e);
    }
  }

  if (password) {
    await updatePassword(currentUser, password);
  }

  await saveUserProfile(targetUid, updates);

  // Sync stateManager.currentUser in memory
  if (stateManager.currentUser && stateManager.currentUser.uid === targetUid) {
    if (updates.name) stateManager.currentUser.name = updates.name;
    if (updates.email) stateManager.currentUser.email = updates.email;
    if (updates.profileImageUrl) stateManager.currentUser.profileImageUrl = updates.profileImageUrl;
    stateManager.notify();
  }

  return true;
}

export async function deleteAccountPermanently() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No active user session");
  await deleteUser(currentUser);
}
