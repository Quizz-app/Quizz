import { db } from "../config/firebase-config";
import { get, remove, set, ref, query, equalTo, orderByChild, update, push, onValue, off, serverTimestamp } from "firebase/database";
import { userQuizzesScoreAverage } from "./users-service";


export const createClass = async (name, description, creatorUsername) => {

    const creatorSnapshot = await get(ref(db, `users/${creatorUsername}`));
    const creator = creatorSnapshot.val();

    const newTeamRef = await push(ref(db, `classes`), {
        name,
        description,
        creator,
        createdOn: serverTimestamp(),
        members: {
            [creator.username]: creator // Add the creator as a member of the team
        }
    });

    const userTeamsRef = ref(db, `users/${creatorUsername}/classes`);
    await set(userTeamsRef, {
        ...creator.classes,
        [newTeamRef.key]: true
    });

    return newTeamRef.key;
};

export const addMemberToClass = async (teamId, user) => {
    const teamRef = ref(db, `classes/${teamId}`);
    const teamSnapshot = await get(teamRef);
    const userOverallScore = await userQuizzesScoreAverage(user.username);
    const teamData = teamSnapshot.val();

    if (!teamData.members) {
        teamData.members = {};
    }
    user.averageScore = userOverallScore;
    teamData.members[user.username] = user;

    await set(teamRef, teamData);

    const userTeamsRef = ref(db, `users/${user.username}/classes`);
    await set(userTeamsRef, {
        ...user.classes,
        [teamId]: true
    });
};

export const getClassById = async (id) => {
    const classRef = await get(ref(db, `classes/${id}`));

    if (!classRef.exists()) {
        console.error(`Class with id ${id} does not exist`);
        return null;
    }

    return classRef.val();
}


export const getAllClassMembers = async (classId) => {
    const classRef = ref(db, `classes/${classId}/members`);
    const classSnapshot = await get(classRef);
    const classData = classSnapshot.val();

    if (!classSnapshot.exists()) {
        console.error(`Class with id ${classId} does not exist`);
        return null;
    }

    const membersArray = Object.keys(classData).map(key => classData[key]);
    return membersArray;
}

export const removeMemberFromClass = async (classId, student) => {
    const classRef = ref(db, `classes/${classId}/members`);
    const snapShot = await get(classRef);
    const studentsObject = snapShot.val();
    const studentKey = Object.keys(studentsObject).find(key => studentsObject[key].username === student.username);

    // Remove the student from the class
    await remove(ref(db, `classes/${classId}/members/${studentKey}`));

    // Remove the class from the student's classes
    await remove(ref(db, `users/${student.username}/classes/${classId}`));
}

export const onClassMembersChange = (teamId, callback) => {
    const teamRef = ref(db, `classes/${teamId}/members`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
        const members = snapshot.val();
        const membersArray = Object.keys(members || {}).map(key => members[key]);
        callback(membersArray);
    });

    // Return the unsubscribe function
    return () => off(teamRef, unsubscribe);
};

export const inviteUserToClass = async (classId, user, inviter) => {
    const userRef = ref(db, `users/${user.username}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();


    const classRef = ref(db, `classes/${classId}`);
    const classSnapshot = await get(classRef);
    const classData = classSnapshot.val();

    if (!userData.invitations) {
        userData.invitations = {};
    }

    userData.invitesForClass[classId] = {
        classId,
        className: classData.name,
        inviter: inviter,
        status: 'pending',
    };

    await set(classRef, classData);
}

export const deleteClass = async (classId) => {
    // Create a reference to the class and delete it
    const classRef = ref(db, `classes/${classId}`);
    await remove(classRef);

    // Create a reference to the users and get all user data
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();

    // Loop over all users
    for (const userId in usersData) {
        // If the user is a member of the class, remove the class from the user's classes
        if (usersData[userId].classes && usersData[userId].classes[classId]) {
            const userClassRef = ref(db, `users/${userId}/classes/${classId}`);
            await remove(userClassRef);
        }
    }
}

export const getAllClassQuizzes = (classId, callback) => {
    const classRef = ref(db, `classes/${classId}/quizzes`);
    const unsubscribe = onValue(classRef, (snapshot) => {
        const quizzesObject = snapshot.val();
        const quizzesArray = Object.keys(quizzesObject || {}).map(key => quizzesObject[key]);
        callback(quizzesArray);
    });

    // Return the unsubscribe function
    return () => off(classRef, unsubscribe);
};

export const getClassesByCreator = (creatorUsername) => {
    return new Promise((resolve, reject) => {
        const classesRef = ref(db, `classes`);
        const classesQuery = query(classesRef, orderByChild('creator/username'), equalTo(creatorUsername));
        onValue(classesQuery, (snapshot) => {
            const classes = snapshot.val();
            resolve(classes);
        }, (error) => {
            reject(error);
        });
    });
}

export const getUserClasses = (username, callback) => {
    const userClassesRef = ref(db, `users/${username}/classes`);  //get the ref

    const unsubscribe = onValue(userClassesRef, (snapshot) => {
        const classes = snapshot.val() || {};   //get the data in an onvalue
        const classesIds = Object.keys(classes); //get the keys of the data(ids)

        const classPromises = classesIds.map(async (classId) => {
            const classRef = ref(db, `classes/${classId}`);  //get the ref of the class
            return get(classRef);
        });

        Promise.all(classPromises)  //get the data of the classes
            .then((snapshots) => {
                const classes = snapshots.map((snapshot, index) => {
                    return {
                        id: classesIds[index],
                        ...snapshot.val(),
                    }
                });
                callback(classes);
            })
    });

    // Return the unsubscribe function

    return () => off(userClassesRef, unsubscribe);
}