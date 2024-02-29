import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { createQuiz, getAllQuizzes, getQuizByCreator } from "../services/quiz-service";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { useNavigate } from "react-router-dom";
import QuizCard from "./QuizCard";
import { get } from "firebase/database";


const MyLibrary = () => {
    const { userData } = useContext(AppContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [myQuizzes, setMyQuizzes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (userData){
            getQuizByCreator(userData.username).then(quizzes => setMyQuizzes(quizzes))
        }
    }, [userData])

    console.log(myQuizzes)

    const [quiz, setQuiz] = useState({
        title: "",
        creator: "",
        category: "",
        time: 0,
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
            const id = await createQuiz(userData.username, quiz.title, quiz.category, quiz.isPublic, quiz.time, quiz.questions);
            setQuiz({
                ...quiz,
                id: id
            });
            navigate(`/quiz/${id}`);
        } catch (error) {
            console.error(error);
        }
    }

    //dialog actions
    const handleButtonClick = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    return (
        <div>

            {myQuizzes.map(quiz => (
                <QuizCard key={quiz.id} content={quiz.title} id={quiz.id} />
            ))}


            <Dialog onClose={handleCloseDialog}>
                <DialogTrigger asChild>
                    <Button variant="outline" onClick={handleButtonClick} > New Quiz +</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral text-black dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            {`Make changes to your profile here. Click save when you're done.`}
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
                                Category
                            </Label>
                            <Input id="category" value={quiz.category} onChange={updateForm('category')} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="visibility" className="text-right">
                                Visibility
                            </Label>
                            <div className="relative w-[180px]">
                                <select
                                    className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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


    )
}

export default MyLibrary;   