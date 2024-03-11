import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { createQuiz, getQuizByCreator, getQuizById, listenForCategories } from "../services/quiz-service";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom";
import QuizCard from "./QuizCard";
import { addQuizToCreator, getUserQuizzes } from "../services/users-service";

const MyLibrary = () => {
    const { user, userData } = useContext(AppContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [studentQuizzes, setStudentQuizzes] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        let unsubscribeQuizByCreator;
        if (userData && (userData.role === 'teacher' || userData.isAdmin === true)) {
            unsubscribeQuizByCreator = getQuizByCreator(userData.username, quizzes => setMyQuizzes(quizzes));
        }
        const unsubscribeUserQuizzes = getUserQuizzes(userData?.username, async (quizzes) => {
            const quizzesArray = await Promise.all(Object.entries(quizzes).map(async ([id, quiz]) => {
                const fullQuiz = await getQuizById(id);
                return { ...fullQuiz, ...quiz };
            }));
            const completedQuizzes = quizzesArray.filter(quiz => quiz.isCompleted);
            const nonCompletedQuizzes = quizzesArray.filter(quiz => !quiz.isCompleted);
            setStudentQuizzes({ completed: completedQuizzes, nonCompleted: nonCompletedQuizzes });
        });

        return () => {
            unsubscribeUserQuizzes();
            if (unsubscribeQuizByCreator) {
                unsubscribeQuizByCreator();
            }
        };
    }, [userData]);

    useEffect(() => {
        listenForCategories(setSuggestions);
    }, []);

    const [quiz, setQuiz] = useState({
        title: "",
        creator: "",
        category: "",
        questions: [],
        isPublic: true,
    });

    const updateForm = (prop) => (e) => {
        setQuiz({
            ...quiz,
            [prop]: e.target.value,
        });
    };

    const quizCreation = async () => {
        try {
            let category = quiz.category.trim() !== '' ? quiz.category : selectedOption;
            
            const id = await createQuiz(userData.username, quiz.title, category, quiz.isPublic, quiz.questions);
            await addQuizToCreator(userData.username, id);
            setQuiz({
                ...quiz,
                id: id
            });
            navigate(`/quiz/${id}`);
        } catch (error) {
            console.error(error);
        }
    }

    const handleButtonClick = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    return (
        <>
            {userData && (userData.role === 'teacher' || userData.isAdmin === true) ? (
                <div className="flex flex-col h-full items-start justify-start p-6">
                    {myQuizzes.map(quiz => (
                        <QuizCard key={quiz.id} content={quiz.title} id={quiz.id} quiz={quiz} />
                    ))}

                    <Dialog onClose={handleCloseDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={handleButtonClick}> New Quiz +</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral text-black dark:text-white">
                            <DialogHeader>
                                <DialogTitle>Create Quiz</DialogTitle>
                                <DialogDescription>
                                    {`Create a new quiz by filling out the form below.`}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">
                                        Title
                                    </Label>
                                    <Input id="title" value={quiz.title} onChange={updateForm('title')} className="col-span-3" />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">
                                        Crate Category
                                    </Label>
                                    <Input id="category" value={quiz.category} onChange={updateForm('category')} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="visibility" className="text-right">
                                        Or choose category
                                    </Label>
                                    <div className="relative w-[180px]">
                                        <select onChange={event => setSelectedOption(event.target.value)} className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                                            {suggestions.length > 0 && suggestions.map((suggestion, index) => (
                                                <option key={index} value={suggestion}>{suggestion}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M5.305 7.695a.999.999 0 0 1 1.414 0L10 11.076l3.28-3.381a.999.999 0 1 1 1.44 1.402l-4 4.242a1 1 0 0 1-1.44 0l-4-4.242a.999.999 0 0 1 0-1.402z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="visibility" className="text-right">
                                        Visibility
                                    </Label>
                                    <div className="relative w-[180px]">
                                        <select
                                            className="block appearance-none w-full bg-white border border-black-700 text-black-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-black-500"
                                            value={quiz.isPublic ? 'Public' : 'Private'}
                                            onChange={event => setQuiz(prevQuiz => ({ ...prevQuiz, isPublic: event.target.value === 'Public' }))}
                                        >
                                            <option value="Public">Public</option>
                                            <option value="Private">Private</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M5.305 7.695a.999.999 0 0 1 1.414 0L10 11.076l3.28-3.381a.999.999 0 1 1 1.44 1.402l-4 4.242a1 1 0 0 1-1.44 0l-4-4.242a.999.999 0 0 1 0-1.402z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={quizCreation}>Create Quiz</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <div className="flex flex-col h-full items-start justify-start p-6">
                    <h2 className="text-4xl font-bold mb-4">Completed</h2>
                    {studentQuizzes.completed && studentQuizzes.completed.length > 0 ? (
                        studentQuizzes.completed.map(quiz => (
                            <QuizCard key={quiz.id} content={quiz.title} id={quiz.id} quiz={quiz} isCompleted={true} />
                        ))
                    ) : (
                        <p>No completed quizzes yet.</p>
                    )}
                    <h2 className="text-4xl font-bold mb-4">Todo</h2>
                    {studentQuizzes.nonCompleted && studentQuizzes.nonCompleted.length > 0 ? (
                        studentQuizzes.nonCompleted.map(quiz => (
                            <QuizCard key={quiz.id} content={quiz.title} id={quiz.id} quiz={quiz} isCompleted={false} />
                        ))
                    ) : (
                        <p>No quizzes to do yet.</p>
                    )}
                </div>
            )}

        </>
    );
}

export default MyLibrary;   