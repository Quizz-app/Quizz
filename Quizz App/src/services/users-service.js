import {
  get, set, ref, query, equalTo, orderByChild, update, onValue,
} from "firebase/database";
import { db } from "../config/firebase-config.js";
import { addQuizToTheUser, getQuizById } from "./quiz-service.js";
import { addMemberToTeam } from "./teams-service.js";
import { toast } from "react-toastify";
import { sendEmailVerification } from "firebase/auth";
import { serverTimestamp } from "firebase/database";
import { addMemberToClass } from "./class-service.js";
import { getWeek, getMonth, getYear, parseISO } from 'date-fns';


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
    createdOn: serverTimestamp(),
    likedPosts: {},
    isAdmin: false,
    isBlocked: false,
    role,
    teams: {},
    // quizzes: {},
    avatar:
      "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg",
  });
};

export const getUserByUsername = (handle) => {
  return get(ref(db, `users/${handle}`));
};

export const getAllUsers = async () => {
  const snapshot = await get(ref(db, `users`));
  const data = snapshot.val();
  return data ? Object.values(data) : [];
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

export const getAllStudents = async () => {
  try {
    const snapshot = await get(
      query(ref(db, "users"), orderByChild("role"), equalTo("student"))
    );
    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([key, value]) => ({
        key,
        ...value,
      }));
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

/**
 * Retrieves all users with the role of 'teacher' from the database.
 *
 * @returns {Promise<Array|Null>} An array of teacher objects if found, an empty array if no teachers exist, or null if an error occurs.
 *
 * @async
 * @function
 */
export const getAllTeachers = async () => {
  try {
    const snapshot = await get(
      query(ref(db, "users"), orderByChild("role"), equalTo("teacher"))
    );
    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([key, value]) => ({
        key,
        ...value,
      }));
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};


export const getUserQuizzes = (username, callback) => {
  const userQuizzesRef = ref(db, `users/${username}/quizzes`);

  const unsubscribe = onValue(userQuizzesRef, (snapshot) => {
    callback(snapshot.val() || {});
  });

  return () => unsubscribe();
};

export const getUserQuizById = async (username, quizId) => {
  try {
    const snapshot = await get(
      query(ref(db, `users/${username}/quizzes/${quizId}`))
    );

    // console.log(snapshot.val());
    if (!snapshot.val()) {
      console.log("No such quiz found for this user");
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
      console.log("No valid quiz id found");
    }

    return quizzData;
  } catch (error) {
    console.error("Error getting user quizzes:", error);
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
};

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

/**
 * Responds to an invite to join a team.
 *
 * @param {string} username - The username of the user responding to the invite.
 * @param {string} teamId - The ID of the team to which the user was invited.
 * @param {boolean} accept - Whether the user accepts or declines the invite.
 *
 * @returns {Promise<void>} Returns a promise which resolves when the operation is complete.
 *
 * @throws {Error} Throws an error if no such invite exists.
 *
 * @async
 * @function
 */

export const respondToTeamInvite = async (username, teamId, accept) => {
  const userRef = ref(db, `users/${username}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();

  if (!userData.invitesForTeam || !userData.invitesForTeam[teamId]) {
    throw new Error("No such invite");
  }

  if (accept) {
    await addMemberToTeam(teamId, userData);
    userData.invitesForTeam[teamId].status = "accepted";

    if (!userData.teams) {
      userData.teams = {};
    }

    userData.teams[teamId] = true;
  } else {
    userData.invitesForTeam[teamId].status = "declined";
  }
  delete userData.invitesForTeam[teamId];
  await set(userRef, userData);
};

export const respondToClassInvite = async (username, classId, accept) => {
  const userRef = ref(db, `users/${username}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();

  if (!userData.invitesForClass || !userData.invitesForClass[classId]) {
    throw new Error("No such invite");
  }

  if (accept) {
    await addMemberToClass(classId, userData);
    userData.invitesForClass[classId].status = "accepted";

    if (!userData.classes) {
      userData.classes = {};
    }

    userData.classes[classId] = true;
  } else {
    userData.invitesForClass[classId].status = "declined";
  }
  delete userData.invitesForClass[classId];
  await set(userRef, userData);
};


export const respondToQuizInvite = async (username, quizId, accept) => {
  const userRef = ref(db, `users/${username}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();

  if (!userData.invitesForQuiz || !userData.invitesForQuiz[quizId]) {
    throw new Error("No such invite");
  }

  if (accept) {
    if (!userData.quizzes) {
      userData.quizzes = {};
    }

    if (userData.quizzes[quizId]) {
      throw new Error("Quiz already added to the user");
    }
    userData.quizzes[quizId] = { isCompleted: false };

    userData.invitesForQuiz[quizId].status = "accepted";
  } else {
    userData.invitesForQuiz[quizId].status = "declined";
  }
  delete userData.invitesForQuiz[quizId];
  await set(userRef, userData);
};

/**
 * Sets up a listener for changes in the teams of a user in the database.
 *
 * @param {string} username - The username of the user to listen for changes.
 * @param {Function} callback - The function to call when the user's teams change. The function is called with an array of the user's teams.
 *
 * @returns {Function} A function that when called, unsubscribes from the listener.
 *
 * @function
 */
export const getUserTeams = (username, callback) => {
  const userTeamsRef = ref(db, `users/${username}/teams`);

  const unsubscribe = onValue(userTeamsRef, (snapshot) => {
    const userTeams = snapshot.val() || {};
    const teamIds = Object.keys(userTeams);

    const teamPromises = teamIds.map((teamId) => {
      const teamRef = ref(db, `teams/${teamId}`);
      return get(teamRef);
    });

    Promise.all(teamPromises).then((teamSnapshots) => {
      const teams = teamSnapshots.map((teamSnapshot, index) => {
        return {
          id: teamIds[index],
          ...teamSnapshot.val(),
        };
      });

      callback(teams);
    });
  });

  return () => unsubscribe();
};

export const getUserClasses = async (username, callback) => {
  const userClassesRef = ref(db, `users/${username}/classes`);

  const unsubscribe = onValue(userClassesRef, (snapshot) => {
    const userClasses = snapshot.val() || {};
    const classIds = Object.keys(userClasses);

    const classPromises = classIds.map((classId) => {
      const classRef = ref(db, `classes/${classId}`);
      return get(classRef);
    });

    Promise.all(classPromises).then((classSnapshots) => {
      const classes = classSnapshots.map((classSnapshot, index) => {
        return {
          id: classIds[index],
          ...classSnapshot.val(),
        };
      });
    
      callback(Object.values(classes));
    });
  });

  
  return () => unsubscribe();
}

/**
 * Removes a user from a team and removes the team from the user's teams.
 *
 * @param {string} username - The username of the user to remove from the team.
 * @param {string} teamId - The ID of the team from which to remove the user.
 *
 * @returns {Promise<void>} Returns a promise which resolves when the operation is complete.
 *
 * @throws {Error} Throws an error if the user is not in the team or if the user is not a member of the team.
 *
 * @async
 * @function
 */
export const userLeaveTeam = async (username, teamId) => {
  const userRef = ref(db, `users/${username}`);
  const userSnapshot = await get(userRef);
  const userData = userSnapshot.val();

  if (!userData.teams || !userData.teams[teamId]) {
    throw new Error("User is not in this team");
  }

  // Remove the user from the team
  const teamRef = ref(db, `teams/${teamId}`);
  const teamSnapshot = await get(teamRef);
  const teamData = teamSnapshot.val();

  if (!teamData.members || !teamData.members[username]) {
    throw new Error("User is not a member of this team");
  }
  2;

  delete teamData.members[username];
  await set(teamRef, teamData);

  // Remove the team from the user's teams
  delete userData.teams[teamId];
  await set(userRef, userData);
};

//Listen of invites for to join a team
export const getUserTeamInvites = (username, callback) => {
  const userInvitesRef = ref(db, `users/${username}/invitesForTeam`);
  // console.log(userInvitesRef);
  const unsubscribe = onValue(userInvitesRef, (snapshot) => {
    callback(snapshot.val() || {});
  });

  return () => unsubscribe();
};

//Listen for invites to join a quiz
export const getUserQuizInvites = (username, callback) => {
  const userInvitesRef = ref(db, `users/${username}/invitesForQuiz`);
  // console.log(userInvitesRef);
  const unsubscribe = onValue(userInvitesRef, (snapshot) => {
    callback(snapshot.val() || {});
  });

  return () => unsubscribe();
};


export const getUserClassInvites = (username, callback) => {
  const userInviteRef = ref(db, `users/${username}/invitesForClass`);

  const unsubscribe = onValue(userInviteRef, (snapshot) => {
    callback(snapshot.val() || {});
  });

  return () => unsubscribe();
};

export const verifyUser = async (user) => {
  try {
    await sendEmailVerification(user);
    toast.success("Verification email sent!");
  } catch (error) {
    toast.error("Something went wrong. Please, try again.");
  }
};

export const updateBlockedUser = (username) => {
  const updateUser = {};
  updateUser[`/users/${username}/isBlocked`] = true;

  return update(ref(db), updateUser);
};

export const updateUnblockedUser = (username) => {
  const updateUser = {};
  updateUser[`/users/${username}/isBlocked`] = false;

  return update(ref(db), updateUser);
};

export const updateAdminStatus = async (username) => {
  console.log(username);
  const isAdmin = await get(ref(db, `/users/${username}/isAdmin`));
  const updateUser = {};
  updateUser[`/users/${username}/isAdmin`] = !isAdmin.val();
  console.log(isAdmin.val());
  return update(ref(db), updateUser);
};

export const setScoreToUser = async (username, quizId, score) => {
  const userQuizRef = ref(db, `users/${username}/quizzes/${quizId}`);
  const snapshot = await get(userQuizRef);


  let quizData;
  if (snapshot.val()) {
    quizData = snapshot.val();
  } else {
    quizData = {};
  }

  console.log(score);
  quizData.score = Number(score);

  await update(userQuizRef, quizData);
  await userQuizzesScoreAverage(username);
};

export const setGradeToUser = async (username, quizId, grade) => {
  const userQuizRef = ref(db, `users/${username}/quizzes/${quizId}`);
  const snapshot = await get(userQuizRef);

  let quizData;
  if (snapshot.val()) {
    quizData = snapshot.val();
  } else {
    quizData = {};
  }

  quizData.grade = grade;

  await update(userQuizRef, quizData);
}

export const userQuizzesSolved = async (username) => {
  const userQuizzesRef = ref(db, `users/${username}/quizzes`);
  const snapshot = await get(userQuizzesRef);
  const data = snapshot.val();
  return data ? Object.values(data).filter((quiz) => quiz.isCompleted === true).length : 0;
}

export const userQuizzesCreated = async (username) => {
  const userQuizzesRef = ref(db, `users/${username}/createdQuizzes`);
  const snapshot = await get(userQuizzesRef);
  const data = snapshot.val();
  console.log(data);
  return data ? Object.values(data).length : 0;
}

export const userQuizzesScoreAverage = async (username) => {
  const userQuizzesRef = ref(db, `users/${username}/quizzes`);

  onValue(userQuizzesRef, async (snapshot) => {
    const data = snapshot.val();
    const quizzes = Object.values(data);
    const totalScore = quizzes.reduce((acc, quiz) => acc + quiz.score, 0);

    await updateAverageScoreInClass(username, totalScore / quizzes.length);
  });

};

export const updateAverageScoreInClass = async (username, score) => {
  const userClassesSnapshot = await get(ref(db, `users/${username}/classes`));
  const userClasses = userClassesSnapshot.val();

  for (const classId in userClasses) {
    const classSnapshot = await get(ref(db, `classes/${classId}`));
    const classData = classSnapshot.val();

    if (classData.members && classData.members[username]) {
      classData.members[username].averageScore = score;
      await set(ref(db, `classes/${classId}`), classData);
    }
  }

}

export const userQuizzesMostOccurringGrade = async (username) => {
  const userQuizzesRef = ref(db, `users/${username}/quizzes`);
  const snapshot = await get(userQuizzesRef);
  const data = snapshot.val();
  const quizzes = Object.values(data);

  const gradeCounts = quizzes.reduce((acc, quiz) => {
    acc[quiz.grade] = (acc[quiz.grade] || 0) + 1;
    return acc;
  }, {});

  let mostOccurringGrade = null;
  let maxCount = 0;
  for (const grade in gradeCounts) {
    if (gradeCounts[grade] > maxCount) {
      maxCount = gradeCounts[grade];
      mostOccurringGrade = grade;
    }
  }

  return mostOccurringGrade;
};


export const userQuizzesScoreAveragePerWeek = async (username, month, year) => {
  const userQuizzesRef = ref(db, `users/${username}/quizzes`);

  onValue(userQuizzesRef, async (snapshot) => {
    const data = snapshot.val();
    const quizzes = Object.values(data);

    // Filter quizzes by month and year
    const quizzesInMonth = quizzes.filter(quiz => {
      const quizDate = parseISO(quiz.date);
      return getMonth(quizDate) + 1 === month && getYear(quizDate) === year;
    });

    // Group quizzes by week
    const quizzesByWeek = quizzesInMonth.reduce((acc, quiz) => {
      const quizDate = parseISO(quiz.date);
      const week = getWeek(quizDate);

      if (!acc[week]) {
        acc[week] = [];
      }

      acc[week].push(quiz);

      return acc;
    }, {});

    // Calculate average score for each week
    const averageScores = Object.entries(quizzesByWeek).map(([week, quizzes]) => {
      const totalScore = quizzes.reduce((acc, quiz) => acc + quiz.score, 0);
      return {
        week,
        averageScore: totalScore / quizzes.length,
      };
    });

    // Update average score in class for each week
    for (const { week, averageScore } of averageScores) {
      await updateAverageScoreInClass(username, averageScore, week);
    }
  });
};


export const scheduleUserQuizzesScoreAveragePerWeek = (username) => {
    return new Promise((resolve) => {
        const userQuizzesRef = ref(db, `users/${username}/quizzes`);

        onValue(userQuizzesRef, async (snapshot) => {
            const data = snapshot.val();
            const quizzes = Object.values(data);

            // Calculate average score
            const totalScore = quizzes.reduce((acc, quiz) => acc + quiz.score, 0);
            const averageScore = totalScore / quizzes.length;

            // Resolve the promise with the average score
            resolve(averageScore);
        });
    });
};