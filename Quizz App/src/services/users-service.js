import { get, set, ref, query, equalTo, orderByChild, update} from "firebase/database";
import { db } from "../config/firebase-config.js";

export const createUsername = (firstName, lastName, username, uid, email, role) => {
  return set(ref(db, `users/${username}`), {
    firstName,
    lastName,
    username: username,
    uid,
    email,
    createdOn: new Date().toString(),
    likedPosts: {},
    isAdmin: false,
    isBlocked: false,
    role,
  });
};

export const getUserByUsername = (handle) => {
  return get(ref(db, `users/${handle}`));
};

export const getAllUsers = async () => {
  const snapshot = get(ref(db, `users`));
  return snapshot;
};

export const getUserData = (uid) => {
  return get(query(ref(db, "users"), orderByChild("uid"), equalTo(uid)));
};

export const updateUser = async (username, userData) => {
  const userRef = ref(db, `users/${username}`);
  await update(userRef, userData);
};
