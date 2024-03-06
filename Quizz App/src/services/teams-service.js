import { db } from "../config/firebase-config";
import { get, remove, set, ref, query, equalTo, orderByChild, update, push, onValue } from "firebase/database";


/**
 * Creates a new team and adds it to the database.
 *
 * @param {string} name - The name of the team.
 * @param {string} description - The description of the team.
 * @param {string} creatorUsername - The username of the creator of the team.
 * 
 * @returns {Promise<string>} The key of the newly created team in the database.
 *
 * @async
 * @function
 */
export const createTeam = async (name, description, creatorUsername) => {

    const creatorSnapshot = await get(ref(db, `users/${creatorUsername}`));
    const creator = creatorSnapshot.val();

    const newTeamRef = await push(ref(db, `teams`), {
        name,
        description,
        creator,
        createdOn: new Date().toString(),
        members: {
            [creator.username]: creator // Add the creator as a member of the team
        }
    });

    // Add the new team to the creator's teams
    const userTeamsRef = ref(db, `users/${creatorUsername}/teams`);
    await set(userTeamsRef, {
        ...creator.teams,
        [newTeamRef.key]: true
    });

    return newTeamRef.key;
}

/**
 * Adds a member to a team in the database.
 *
 * @param {string} teamId - The ID of the team.
 * @param {Object} user - The user object to add to the team. The user object should have a 'username' property.
 * 
 * @returns {Promise<void>} Returns a promise which resolves when the operation is complete.
 *
 * @async
 * @function
 */
export const addMemberToTeam = async (teamId, user) => {
    const teamRef = ref(db, `teams/${teamId}`);
    const teamSnapshot = await get(teamRef);
    const teamData = teamSnapshot.val();

    if (!teamData.members) {
        teamData.members = {};
    }


    teamData.members[user.username] = user;

    await set(teamRef, teamData);
}

/**
 * Retrieves a team from the database by its ID.
 *
 * @param {string} teamId - The ID of the team to retrieve.
 * 
 * @returns {Promise<Object|null>} The team data as an object if found, or null if the team does not exist.
 *
 * @async
 * @function
 */
export const getTeamById = async (teamId) => {
    const snapShot = await get(ref(db, `teams/${teamId}`));

    if (!snapShot.exists()) {
        console.error('Team does not exist');
        return null;
    }
    return snapShot.val();
}

/**
 * Retrieves all members of a team from the database by the team's ID.
 *
 * @param {string} teamId - The ID of the team to retrieve members from.
 * 
 * @returns {Promise<Array>} An array of team members. If the team does not exist, returns an empty array.
 *
 * @async
 * @function
 */
export const getAllTeamMembers = async (teamId) => {
    const snapShot = await get(ref(db, `teams/${teamId}/members`));

    if (!snapShot.exists()) {
        console.error('Team does not exist');
        return [];
    }

    const membersObject = snapShot.val();
    const membersArray = Object.keys(membersObject).map(key => membersObject[key]);

    return membersArray;
}

/**
 * Removes a member from a team in the database and also removes the team from the user's teams.
 *
 * @param {string} teamId - The ID of the team.
 * @param {Object} member - The member object to remove from the team. The member object should have a 'username' property.
 * 
 * @returns {Promise<void>} Returns a promise which resolves when the operation is complete.
 *
 * @async
 * @function
 */
export const removeMemberFromTeam = async (teamId, member) => {
    const teamRef = ref(db, `teams/${teamId}/members`);
    const snapShot = await get(teamRef);
    const membersObject = snapShot.val();
    const memberKey = Object.keys(membersObject).find(key => membersObject[key].username === member.username);

    // Remove the member from the team
    await remove(ref(db, `teams/${teamId}/members/${memberKey}`));

    // Remove the team from the user's teams
    await remove(ref(db, `users/${member.username}/teams/${teamId}`));
}

/**
 * Sets up a listener for changes in the members of a team in the database.
 *
 * @param {string} teamId - The ID of the team to listen for changes.
 * @param {Function} callback - The function to call when the team members change. The function is called with an array of the team members.
 * 
 * @returns {Function} A function that when called, unsubscribes from the listener.
 *
 * @function
 */
export const onTeamMembersChange = (teamId, callback) => {
    const teamRef = ref(db, `teams/${teamId}/members`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
        const membersObject = snapshot.val();
        const membersArray = Object.keys(membersObject || {}).map(key => membersObject[key]);
        callback(membersArray);
    });

    return unsubscribe;
}

/**
 * Invites a user to join a team.
 *
 * @param {string} teamId - The ID of the team to which the user is being invited.
 * @param {Object} user - The user object of the user being invited. The user object should have a 'username' property.
 * @param {string} inviter - The username of the person who is inviting the user.
 * 
 * @returns {Promise<void>} Returns a promise which resolves when the operation is complete.
 *
 * @async
 * @function
 */
export const inviteUserToTeam = async (teamId, user, inviter) => {
    const userRef = ref(db, `users/${user.username}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();

    // Fetch the team data from the database
    const teamSnapshot = await get(ref(db, `teams/${teamId}`));
    const teamData = teamSnapshot.val();

    if (!userData.invitesForTeam) {
        userData.invitesForTeam = {};
    }

    userData.invitesForTeam[teamId] = {
        teamId,
        teamName: teamData.name,
        inviter: inviter,
        status: 'pending',
    };

    await set(userRef, userData);
}

/**
 * Deletes a team from the database and removes it from the teams of all users.
 *
 * @param {string} teamId - The ID of the team to delete.
 * 
 * @returns {Promise<void>} Returns a promise which resolves when the operation is complete.
 *
 * @async
 * @function
 */
export const deleteTeam = async (teamId) => {

    const teamRef = ref(db, `teams/${teamId}`);
    await remove(teamRef);
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    const usersData = usersSnapshot.val();

    for (let userId in usersData) {
        if (usersData[userId].teams && usersData[userId].teams[teamId]) {
            const userTeamRef = ref(db, `users/${userId}/teams/${teamId}`);
            await remove(userTeamRef);
        }
    }
};



export const getAllTeamQuizzes = (teamId, callback) => {
    const teamRef = ref(db, `teams/${teamId}/quizzes`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
        const quizzesObject = snapshot.val();
        const quizzesArray = Object.keys(quizzesObject || {}).map(key => quizzesObject[key]);
        callback(quizzesArray);
    });

    return unsubscribe;
}
