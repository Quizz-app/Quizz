import { db } from "../config/firebase-config";
import {
    get,
    set,
    ref,
    query,
    equalTo,
    orderByChild,
    update,
    push,
  } from "firebase/database";



export const createQuiz = async (creator, title, category, isPublic, time,  questionTypes) =>{

   await set(ref(db, `categories/${category}`), {
        name: category,
        createdOn: new Date().toString(),
      });

    return  push(ref(db, `quizzes`), {
        creator,
        title,
        category,
        isPublic,
        createdOn: new Date().toString(),
        time,
        questionTypes
    });

}




// export const addPost = async (author, title, content, tags) => {
 
//     return push(ref(db, 'posts'), {
//         author,
//         title,
//         content,
//         createdOn: Date.now(),
//         comments: {},
//         likedBy: {},
//         tags: tags || []
//     });

// }