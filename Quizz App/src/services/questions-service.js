import { ref, push, get, update, remove } from 'firebase/database';
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
    const questionsSnapshot = await get(ref(db, `quizzes/${quizId}/questions`));
    const questions = questionsSnapshot.val();

    if (!questionsSnapshot.exists()) {
        throw new Error('No questions found');
    }

    return questions;

};