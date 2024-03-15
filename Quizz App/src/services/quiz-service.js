import { db } from "../config/firebase-config";
import { get, set, ref, query, equalTo, orderByChild, update, push, onValue } from "firebase/database";
import { removeQuizFromAllTeams } from "./teams-service";
import { removeMemberFromClass } from "./class-service";
import { removeQuizFromAllUsers } from "./users-service";

export const createQuiz = async (creator, title, category, isPublic, questionTypes,) => {

  category = category.charAt(0).toUpperCase() + category.slice(1);

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
    retakeOption: false,
    questionTypes,
    onGoing: true,
    endsOn: null,
    image: 'https://firebasestorage.googleapis.com/v0/b/quizz-app-1a3aa.appspot.com/o/images%2F93fc27c7-2df4-4771-8451-149e892e4267.jpg?alt=media&token=7928b9f6-ea95-43b5-b8cf-bbd73c8429de',
    finishedCount: 0,

  });

  return newQuizRef.key;
};


export const getQuizByCreator = (creator, callback) => {
  if (!creator) {
    console.error('Creator is undefined');
    return;
  }

  const quizRef = query(ref(db, "quizzes"), orderByChild("creator"), equalTo(creator));

  const unsubscribe = onValue(quizRef, (snapShot) => {
    if (!snapShot.exists()) {
      callback([]);
      return;
    }

    const quizzes = Object.keys(snapShot.val()).map((key) => ({
      id: key,
      ...snapShot.val()[key],
    }));

    callback(quizzes);
  });

  return unsubscribe;
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

export const incrementFinishedCount = async (id) => {
  const quizRef = ref(db, `quizzes/${id}`);
  const snapshot = await get(quizRef);
  const quiz = snapshot.val();
  const updatedQuiz = { ...quiz, finishedCount: quiz.finishedCount + 1 };
  await update(quizRef, updatedQuiz);
};

export const deleteQuizById = async (id) => {
  const quizRef = ref(db, `quizzes/${id}`);
  await set(quizRef, null);

  removeQuizFromAllTeams(id);
  removeMemberFromClass(id);
  removeQuizFromAllUsers(id);

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


export const addQuizToTheUser = async (username, quizId) => {
  if (!username || !quizId) {
    throw new Error('Invalid username or quizId');
  }

  const userRef = ref(db, `users/${username}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();

  if (!userData) {
    throw new Error('User does not exist');
  }

  if (!userData.userQuizzes) {
    userData.userQuizzes = {};
  }

  if (userData.userQuizzes[quizId]) {
    throw new Error('Quiz already added to the user');
  }

  userData.userQuizzes[quizId] = { isCompleted: false };

  await set(userRef, userData);
}

export const listenForCategories = (callback) => {

  const categoriesRef = ref(db, 'categories');

  onValue(categoriesRef, (snapshot) => {
    const data = snapshot.val();
    const categories = Object.keys(data).map(key => data[key].name);
    callback(categories);
  });
};


export const setEndOn = async (quizId, endsOn) => {
  const quizRef = ref(db, `quizzes/${quizId}`);
  await update(quizRef, { endsOn });
}


export const setOnGoing = async (quizId) => {
  const quizRef = ref(db, `quizzes/${quizId}`);
  await update(quizRef, { onGoing: false });
}

export const observeQuiz = (quizId, callback) => {
  const quizRef = ref(db, `quizzes/${quizId}`);
  const unsubscribe = onValue(quizRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.error('No quiz found with this id');
      callback(null);
      return;
    }

    const quiz = {
      id: quizId,
      ...snapshot.val(),
    };

    callback(quiz);
  });

  return unsubscribe;
};

export const getAllQuizzes = async (callback) => {
  const snapShot = ref(db, "quizzes");
  const unsubscribe = onValue(snapShot, (snap) => {
    if (!snap.exists()) {
      return [];
    }
    const quizzes = Object.keys(snap.val()).map((key) => ({
      id: key,
      ...snap.val()[key],
    }));

    callback(quizzes);
  });

  return unsubscribe;
};


export const getTopCategories = (quizzes) => {
        
  const categoryCounts = quizzes.reduce((counts, quiz) => {
      const category = quiz.category;
      if (!counts[category]) {
          counts[category] = 0;
      }
      counts[category]++;
      return counts;
  }, {});

  
  const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(pair => pair[0]); 

  return topCategories;
}

