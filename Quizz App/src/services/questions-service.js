import { ref, push, get, update, remove, onValue, query } from 'firebase/database';
import { db } from '../config/firebase-config';

export const addQuestion = async (quizId, content, answers, points, correctAnswer) => {

    const quizSnapshot = await get(ref(db, `quizzes/${quizId}`));
    if (!quizSnapshot.exists()) {
        throw new Error('Quiz not found');
    }

    const question = {
        content,
        answers,
        correctAnswer,
        points
    };

    await push(ref(db, `quizzes/${quizId}/questions`), question);

    return question;
};

export const getQuestionsByQuizId = async (quizId) => {
    const questionsSnapshot = await get(query(ref(db, `quizzes/${quizId}/questions`)));

    if (!questionsSnapshot.exists()) {
        throw new Error('No questions found');
    }

    const questionsObject = questionsSnapshot.val();
    const questionsArray = Object.keys(questionsObject).map(key => ({
        id: key,
        ...questionsObject[key]
    }));

    return questionsArray;
};

export const listenForQuestions = (quizId, callback) => {
    const questionsRef = ref(db, `quizzes/${quizId}/questions`);

    const unsubscribe = onValue(questionsRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback([]);
            return;
        }

        const questionsObject = snapshot.val();
        const questionsArray = Object.keys(questionsObject).map(key => ({
            id: key,
            ...questionsObject[key]
        }));

        callback(questionsArray);
    });

    return () => unsubscribe();
};

export const updateQuestion = async (quizId, questionId, content, answers, points, correctAnswer) => {
    const questionRef = ref(db, `quizzes/${quizId}/questions/${questionId}`);

    const questionSnapshot = await get(questionRef);
    if (!questionSnapshot.exists()) {
        throw new Error('Question not found');
    }

    const updatedQuestion = {
        content,
        answers,
        correctAnswer,
        points
    };

    await update(questionRef, updatedQuestion);

    return updatedQuestion;
};

export const deleteQuestion = async (quizId, questionId) => {
    const questionSnapshot = await get(ref(db, `quizzes/${quizId}/questions/${questionId}`));

    if (!questionSnapshot.exists()) {
        throw new Error('Question not found');
    }

    return remove(ref(db, `quizzes/${quizId}/questions/${questionId}`));
};
