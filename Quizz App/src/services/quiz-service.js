import { db } from "../config/firebase-config";
import { get, set, ref, query, equalTo, orderByChild, update, push, } from "firebase/database";



export const createQuiz = async (creator, title, category, isPublic, time, questionTypes) => {

  await set(ref(db, `categories/${category}`), {
    name: category,
    createdOn: new Date().toString(),
  });

  const newQuizRef = await push(ref(db, `quizzes`), {
    creator,
    title,
    category,
    isPublic,
    createdOn: new Date().toString(),
    time,
    questionTypes
  });

  return newQuizRef.key;
};

export const getAllQuizzes = async () => {
  const snapShot = await get(ref(db, "quizzes"), orderByChild("createdOn"));

  if (!snapShot.exists()) {
    return [];
  }
  const quizzes = Object.keys(snapShot.val()).map((key) => ({
    id: key,
    ...snapShot.val()[key],

  }));

  return quizzes;
};

export const getQuizById = async (id) => {
  const snapShot = await get(ref(db, `quizzes/${id}`));

  if (!snapShot.exists()) {
    return null;
  }

  const quiz = {
    id,
    ...snapShot.val(),
  };

  return quiz;
};