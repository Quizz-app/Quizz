import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { createQuiz, deleteQuizById, getQuizByCreator, getQuizById, listenForCategories } from "../services/quiz-service";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom";
import { addQuizToCreator, getUserQuizzes } from "../services/users-service";
import { ThreeDCardDemo } from "../components/ThreeDCardDemo";
import { cn } from "@/utils/cn";
import LabelInputContainer from "../components/ui/LabelInputContainer";
import QuizCardPaginated from "../components/QuizCardPaginated";


const MyLibrary = () => {
    const { userData } = useContext(AppContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [teacherQuizzes, setTeacherQuizzes] = useState([]);
    const [studentQuizzes, setStudentQuizzes] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const quizzesPerPageTeacher = 10;
    const quizzesPerPageStudent = 5;
    const navigate = useNavigate();


    useEffect(() => {
        let unsubscribeQuizByCreator;
        if (userData && (userData.role === 'teacher' || userData.isAdmin === true)) {
            unsubscribeQuizByCreator = getQuizByCreator(userData.username, quizzes => setTeacherQuizzes(quizzes));
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
            <div className="m-10">
                {userData && (userData.role === 'teacher' || userData.isAdmin === true) ? (
                    <>
                        <div className="flex flex-row h-full items-start justify-between ml-5">
                            <div className="">
                                <h2 className="text-4xl font-bold mb-4">My Quizzes</h2>
                            </div>
                            <div className="">
                                <Dialog onClose={handleCloseDialog}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" onClick={handleButtonClick}> New Quiz +</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
                                        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 ">
                                            Hey there, quiz enthusiast!
                                        </h2>
                                        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 mb-3">
                                            {`It's time to step into the spotlight and showcase your quiz-making skills. Be the pioneer and set the bar high for others to follow!`}
                                        </p>
                                        <LabelInputContainer className="mb-3">
                                            <Label htmlFor="title">Quiz title</Label>
                                            <Input id="title" placeholder="Quiz title" type="text" value={quiz.title} onChange={updateForm("title")} />
                                        </LabelInputContainer>
                                        <LabelInputContainer className="mb-3">
                                            <Label htmlFor="crate-category">Create category</Label>
                                            <Input id="create-category" placeholder="Create category" type="text" value={quiz.category} onChange={updateForm("category")} />
                                        </LabelInputContainer>
                                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-3">
                                            <LabelInputContainer>
                                                <div className="">
                                                    <Label htmlFor="visibility" className="text-right">
                                                        Or choose category
                                                    </Label>
                                                    <div className="relative w-[180px]">
                                                        <select onChange={event => setSelectedOption(event.target.value)}
                                                            className={cn(
                                                                `flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm  file:border-0 file:bg-transparent 
                                                          file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
                                                          focus-visible:outline-none focus-visible:ring-[2px]  focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600
                                                           disabled:cursor-not-allowed disabled:opacity-50
                                                           dark:shadow-[0px_0px_1px_1px_var(--neutral-700)]
                                                           group-hover/input:shadow-none transition duration-400
                                                           `)}
                                                            placeholder="Choose category">
                                                            <option value="">Choose category</option>
                                                            {suggestions.length > 0 && suggestions.map((suggestion, index) => (
                                                                <option key={index} value={suggestion}>{suggestion}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </LabelInputContainer>
                                            <LabelInputContainer>
                                                <div className="">
                                                    <Label htmlFor="visibility" className="text-right">
                                                        Visibility
                                                    </Label>
                                                    <div className="relative w-[180px]">
                                                        <select
                                                            onChange={event => setQuiz(prevQuiz => ({ ...prevQuiz, isPublic: event.target.value === 'Public' }))}
                                                            className={cn(
                                                                `flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm  file:border-0 file:bg-transparent 
                                                          file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
                                                          focus-visible:outline-none focus-visible:ring-[2px]  focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600
                                                           disabled:cursor-not-allowed disabled:opacity-50
                                                           dark:shadow-[0px_0px_1px_1px_var(--neutral-700)]
                                                           group-hover/input:shadow-none transition duration-400
                                                           `)}>
                                                            <option value="Public">Public</option>
                                                            <option value="Private">Private</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </LabelInputContainer>
                                        </div>
                                        <button
                                            className=" mt-5 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 
                                            to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium 
                                            shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] 
                                            dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                                            type="submit"
                                            onClick={quizCreation}>
                                            Create quiz &rarr;
                                            <BottomGradient />
                                        </button>
                                        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <div>
                            <QuizCardPaginated currentQuiz={teacherQuizzes} quizzesPerPage={quizzesPerPageTeacher} />
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-4xl font-bold mb-4">Completed</h2>
                        {studentQuizzes?.completed &&
                            <QuizCardPaginated currentQuiz={studentQuizzes?.completed} quizzesPerPage={quizzesPerPageStudent} />}
                        <h2 className="text-4xl font-bold mb-4">Todo</h2>
                        {studentQuizzes?.nonCompleted &&
                            <QuizCardPaginated currentQuiz={studentQuizzes?.nonCompleted} quizzesPerPage={quizzesPerPageStudent} />}
                    </>
                )}
            </div>
        </>
    );
}

export default MyLibrary;

export const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};