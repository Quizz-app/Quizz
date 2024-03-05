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
import { getQuizById } from "./quiz-service.js";

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


export const getUserQuizzes = async (username) => {
  try {
    const snapshot = await get(query(ref(db, `users/${username}/quizzes`)));

    if (!snapshot.val()) {
      console.log('No quizzes found for this user');
      return [];
    }

    const quizzes = Object.keys(snapshot.val()).map((key) => {
      return {
        id: key,
        ...snapshot.val()[key],
      };
    });

    const quizzesData = [];
    for (const quiz of quizzes) {
      if (quiz.id) {
        const quizData = await getQuizById(quiz.id.trim());
        if (quizData) {
          quizzesData.push({
            ...quizData,
            isCompleted: quiz.isCompleted, // Add this line
          });
        } else {
          console.log(`No quiz found with id ${quiz.id}`);
        }
      } else {
        console.log('No valid quiz id found');
      }
    }

    console.log(quizzesData);
    return quizzesData;
  } catch (error) {
    console.error('Error getting user quizzes:', error);
  }
};


export const getUserQuizById = async (username, quizId) => {
  try {
    const snapshot = await get(query(ref(db, `users/${username}/quizzes/${quizId}`)));

    console.log(snapshot.val());
    if (!snapshot.val()) {
      console.log('No such quiz found for this user');
      return null;
    }

    const quiz = {
      id: snapshot.key,
      ...snapshot.val(),
    };

    let quizzData = null;

    if (quiz.id) {
      const quizData = await getQuizById(quiz.id.trim());
      if (quizData) {
        quizzData = {
          ...quizData,
          ...quiz,
        };
      } else {
        console.log(`No quiz found with id ${quiz.id}`);
      }
    } else {
      console.log('No valid quiz id found');
    }

    return quizzData;
  } catch (error) {
    console.error('Error getting user quizzes:', error);
  }
};

export const addQuizToUser = async (username, quizId) => {
  const userRef = ref(db, `users/${username}/quizzes/${quizId}`);
  await set(userRef, {
    isCompleted: false,
  });
};

export const removeQuizFromUser = async (username, quizId) => {
  const userRef = ref(db, `users/${username}/quizzes/${quizId}`);
  await set(userRef, null);
};

export const addQuizToCreator = async (username, quizId) => {
  const userRef = ref(db, `users/${username}/createdQuizzes/${quizId}`);
  await set(userRef, true);
}

export const addUserAnswer = async (username, quizId, questionId, answer) => {
  const userQuizRef = ref(db, `users/${username}/quizzes/${quizId}`);
  const snapshot = await get(userQuizRef);

  let quizData;
  if (snapshot.val()) {
    quizData = snapshot.val();
  } else {
    quizData = {};
  }

  if (!quizData.userAnswers) {
    quizData.userAnswers = {};
  }

  // Set the answer directly instead of pushing it to an array
  quizData.userAnswers[questionId] = answer;

  await update(userQuizRef, quizData);
};

export const updateQuizCompletion = async (username, quizId, isCompleted) => {
  const userQuizRef = ref(db, `users/${username}/quizzes/${quizId}`);
  await update(userQuizRef, { isCompleted });
};
