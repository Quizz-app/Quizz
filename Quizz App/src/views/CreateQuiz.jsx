import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { createQuiz } from "../services/quiz-service";
import { useState } from "react";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CreateQuiz = () => {
    const { userData } = useContext(AppContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false); //for the window for quiz creation
    

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
            await createQuiz(userData.username, quiz.title, quiz.category, quiz.isPublic, quiz.time, quiz.questions);
        } catch (error) {
            console.error(error);
        }
    }

    const handleButtonVsibility = () => {
        setButtonVisibility(buttonVisibility);
    }

    //dialog actions
    const handleButtonClick = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    //handleButtonVsibility();
    return (
        <div >
            {/* 
            <button
                onClick={handleButtonClick}
                className="btn btn-outline btn-secondary"
            >
                New Quiz +
            </button>  */}

            <div>
            
               
                   
              

               
                    <Dialog onClose={handleCloseDialog}>
                         <DialogTrigger asChild>
                            <Button variant="outline" onClick={handleButtonClick} > New Quiz +</Button>
                         </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input id="name" value="Pedro Duarte" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="username" className="text-right">
                                        Username
                                    </Label>
                                    <Input id="username" value="@peduarte" className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>


                

            </div>

            <h1>Create Quiz</h1>

            <div className="flex flex-col w-1/2">

                <label htmlFor="title">Title:</label>
                <input
                    value={quiz.title}
                    onChange={updateForm("title")}
                    type="text"
                ></input>

                <label htmlFor="category">Category:</label>
                <input
                    value={quiz.category}
                    onChange={updateForm("category")}
                    type="text"
                ></input>

                <label htmlFor="time">Time:</label>
                <input
                    value={quiz.time}
                    onChange={updateForm("time")}
                    type="number"
                ></input>

                <label htmlFor="isPublic">Visibility:</label>
                <select
                    value={quiz.isPublic ? "Public" : "Private"}
                    onChange={event => updateForm("isPublic")({ target: { value: event.target.value === "Public" } })}
                >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                </select>

                <button onClick={quizCreation}>Create Quiz</button>

            </div>

        </div>
    );
}

export default CreateQuiz;