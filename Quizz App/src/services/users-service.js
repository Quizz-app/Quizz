import { toast } from 'react-hot-toast';
import {
  get,
  set,
  ref,
  query,
  equalTo,
  orderByChild,
  update,
} from "firebase/database";
import { db } from "../config/firebase-config.js";
import { sendEmailVerification } from 'firebase/auth';

export const createUsername = (
  firstName,
  lastName,
  username,
  uid,
  email,
  role
) => {
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

export const updateUserInfo = async (username, prop, value) => {
  await update(ref(db, `users/${username}`), { [prop]: value });
};

//get all admins
export const getAllAdmins = async () => {
  try {
    const snapshot = get(
      query(ref(db, "users"), orderByChild("isAdmin"), equalTo(true))
    );
    return snapshot;
  } catch (err) {
    console.error(err);
    return null;
  }
};

//get all educators
export const getAllEducators = async () => {
  try {
    const snapshot = get(
      query(ref(db, "users"), orderByChild("role"), equalTo("educator"))
    );
    return snapshot;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const verifyUser = async (user) => {
  try {
      await sendEmailVerification(user);
      toast.success('Verification email sent!')
  } catch (error) {
      toast.error('Something went wrong. Please, try again.')
  }
}