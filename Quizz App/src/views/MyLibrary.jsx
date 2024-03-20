import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { createQuiz, getQuizByCreator, getQuizById, listenForCategories } from "../services/quiz-service";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom";
import { addQuizToCreator, getUserQuizzes } from "../services/users-service";
import { cn } from "@/utils/cn";
import LabelInputContainer from "../components/ui/LabelInputContainer";
import QuizCardPaginated from "../components/QuizCardPaginated";
import { AnimatePresence, motion } from "framer-motion";
import { quizTitlePattern } from "../constants/constants";
import toast from "react-hot-toast";


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
            unsubscribeQuizByCreator = getQuizByCreator(userData.username, quizzes => {
                const reversedQuizzes = [...quizzes].reverse();
                setTeacherQuizzes(reversedQuizzes);
            });
        }
        const unsubscribeUserQuizzes = getUserQuizzes(userData?.username, async (quizzes) => {
            const quizzesArray = await Promise.all(Object.entries(quizzes).map(async ([id, quiz]) => {
                const fullQuiz = await getQuizById(id);
                return { ...fullQuiz, ...quiz };
            }));
            quizzesArray.reverse();
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

        if (!quizTitlePattern.test(quiz.title)) {
            return toast.error('Title must be between 3 and 30 characters');
        }


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

            <AnimatePresence mode='wait'>
                <motion.div
                    initial={{ opacity: 0, x: -200 }} // Starts from the left
                    animate={{ opacity: 1, x: 0 }} // Moves to the center
                    exit={{ opacity: 0, x: 200 }} // Exits to the right
                    transition={{ duration: 0.9 }}
                >
                    {userData && (userData.role === 'teacher' || userData.isAdmin === true) ? (
                        <>
                            <div className="mx-20 mt-20">
                                <div className="flex flex-row h-full  justify-between mt-10 ">

                                    <div className="flex flex-row">
                                        <h1 className="text-4xl font-bold">My Library</h1>
                                        <div className="ml-5">
                                            <p >Here you can view and manage your quizzes,</p>
                                            <p >create new ones and you will be directed to the creation panel.</p>
                                        </div>
                                    </div>

                                    <div className="mr-7">
                                        <Dialog onClose={handleCloseDialog}>
                                            <DialogTrigger asChild>
                                                {/* <Button variant="outline" onClick={handleButtonClick}> New Quiz +</Button> */}
                                                <motion.button
                                                    onClick={handleButtonClick}
                                                    className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(144,238,144,0.9)] px-8 py-2 bg-[#90ee90] rounded-md text-white font-bold transition duration-200 ease-linear "
                                                    initial={{ scale: 2 }}
                                                    animate={{ scale: [1, 1.05, 1] }}
                                                    transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
                                                >
                                                    New Quiz +
                                                </motion.button>

                                            </DialogTrigger>
                                            <DialogContent className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
                                                <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 ">
                                                    Hey there, quiz enthusiast!
                                                </h2>
                                                <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 mb-3">
                                                    {` It's time to step into the spotlight and showcase your quiz-making skills. Be the pioneer and set the bar high for others to follow!`}
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
                                <div className="border-t-2 border-black-700 mt-5 mb-5"></div>
                                <div>
                                    <QuizCardPaginated currentQuiz={teacherQuizzes} quizzesPerPage={quizzesPerPageTeacher} />
                                </div>
                            </div>

                        </>
                    ) : (
                        <>
                            <div className="flex flex-col h-full  justify-between mx-20 mb-10 mt-10">
                                <p>Here you can see the quizzes you have completed or the ones assigned to you.</p>
                                <p>You can also view the results of your quizzes.</p>
                            </div>
                            <div>
                                <div className="flex flex-col h-full justify-between mx-20 mb-10">
                                    <div>
                                        <div className="w-full mb-5">
                                            <h2 className="text-4xl font-bold mb-4 ">Completed</h2>
                                            <div className="border-t-2 border-base-400 mb-5"></div>
                                        </div>
                                        {studentQuizzes?.completed?.length > 0 ? (
                                            <QuizCardPaginated currentQuiz={studentQuizzes?.completed} quizzesPerPage={quizzesPerPageStudent} />
                                        ) : (
                                            <h2 className="text-2xl font-bold">{`You haven't taken any quizzes yet. Get started with your first quiz :)`}</h2>
                                        )}
                                    </div>
                                    <div>
                                        <div className="w-full mb-10">
                                            <h2 className="text-4xl font-bold mb-4 mt-5">Todo</h2>
                                            <div className="border-t-2 border-base-400 mb-5"></div>
                                        </div>
                                        {studentQuizzes?.nonCompleted?.length > 0 ? (
                                            <QuizCardPaginated currentQuiz={studentQuizzes?.nonCompleted} quizzesPerPage={quizzesPerPageStudent} />
                                        ) : (<h2 className="text-2xl mt-5 font-bold">{`Wow, you've completed all your quizzes! Time to take a well-deserved break, don't you think?`}</h2>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence >
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