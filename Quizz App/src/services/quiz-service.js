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

export const getQuizByCreator = async (creator) => {

  if (!creator) {
    console.error('Creator is undefined');
    return [];
  }

  const snapShot = await get(query(ref(db, "quizzes"), orderByChild("creator"), equalTo(creator)));

  if (!snapShot.exists()) {
    return [];
  }

  const quizzes = Object.keys(snapShot.val()).map((key) => ({
    id: key,
    ...snapShot.val()[key],
  }));

  return quizzes;
}


export const getQuizById = async (id) => {
  const snapShot = await get(ref(db, `quizzes/${id}`));

  if (!snapShot.exists()) {
    console.error('No quiz found with this id');
    return null;
  }

  const quiz = {
    id: id,
    ...snapShot.val(),
  };

  return quiz;
};


export const updateQuiz = async (id, updatedQuiz) => {
  const quizRef = ref(db, `quizzes/${id}`);
  await update(quizRef, updatedQuiz);
  const snapshot = await get(quizRef);
  return snapshot.val();
};

export const deleteQuizById = async (id) => {
  const quizRef = ref(db, `quizzes/${id}`);
  await set(quizRef, null);
  return true;
};

/**
 * Adds a quiz to a team.
 *
 * @param {string} teamId - The ID of the team to which the quiz will be added.
 * @param {string} quizId - The ID of the quiz to be added to the team.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If there is an error during the operation.
 *
 */
export const addQuizToTeam = async (teamId, quizId) => {
  const quizRef = ref(db, `quizzes/${quizId}`);
  const quizSnapshot = await get(quizRef);
  const quizData = quizSnapshot.val();

  const teamRef = ref(db, `teams/${teamId}`);
  const teamSnapshot = await get(teamRef);
  const teamData = teamSnapshot.val();

  if (!teamData.quizzes) {
    teamData.quizzes = {};
  }

  teamData.quizzes[quizId] = quizData;

  await set(teamRef, teamData);

};


export const inviteUserToQuiz = async (quizId, user, inviter) => {
  console.log(user);
  const userRef = ref(db, `users/${user.username}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();

  const quizRef = await get(ref(db, `quizzes/${quizId}`));
  const quizData = quizRef.val();

  if (!userData.invitesForQuiz) {
    userData.invitesForQuiz = {};
  }

  userData.invitesForQuiz[quizId] = {
    quizId,
    quizTitle: quizData.title,
    inviter: inviter,
    status: 'pending',
  };

  await set(userRef, userData);

};


export const addQuizToUser = async (userId, quiz) => {
  const userRef = ref(db, `users/${userId}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();

  if (!userData.quizzes) {
    userData.quizzes = {};
  }

  userData.quizzes[quiz.id] = false;

  await set(userRef, userData);

}