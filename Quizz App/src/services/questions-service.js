import { ref, push, get, update, remove, query } from 'firebase/database';
import { db } from '../config/firebase-config';

export const addQuestion = async (quizId, content, answers, time, points, correctAnswer) => {
    // validation if the quiz exists
    const quizSnapshot = await get(ref(db, `quizzes/${quizId}`));
    if (!quizSnapshot.exists()) {
        throw new Error('Quiz not found');
    }

    const question = {
        content,
        answers,
        correctAnswer,
        time,
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

export const updateQuestion = async (quizId, questionId, content, answers, time, points, correctAnswer) => {
    const questionRef = ref(db, `quizzes/${quizId}/questions/${questionId}`);

    const questionSnapshot = await get(questionRef);
    if (!questionSnapshot.exists()) {
        throw new Error('Question not found');
    }

    const updatedQuestion = {
        content,
        answers,
        correctAnswer,
        time,
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