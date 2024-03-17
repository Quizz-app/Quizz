import { useContext, useEffect, useState } from "react";
import { createClass, getUserClasses } from "../services/class-service";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LabelInputContainer from "../components/ui/LabelInputContainer";
import { BottomGradient } from "./MyLibrary";
import { motion, AnimatePresence } from "framer-motion";
import TeamCard from "../components/TeamCard";


const MyClassesView = () => {

    const { userData } = useContext(AppContext)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [classes, setClasses] = useState({});

    const [classData, setClassData] = useState({
        name: "",
        description: ""
    });

    const navigate = useNavigate();

    const updateForm = (prop) => (e) => {
        setClassData({
            ...classData,
            [prop]: e.target.value,
        });
    };

    useEffect(() => {
        if (userData) {
            getUserClasses(userData.username, setClasses);

        }

    }, [userData])

    console.log((classes));

    const handleCreateClass = async () => {
        try {
            const id = await createClass(classData.name, classData.description, userData.username);
            setClassData({
                ...classData,
                id: id
            });
            navigate(`/class/${id}`);
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
        <AnimatePresence mode='wait'>
            <motion.div
                initial={{ opacity: 0, x: -200 }} // Starts from the left
                animate={{ opacity: 1, x: 0 }} // Moves to the center
                exit={{ opacity: 0, x: 200 }} // Exits to the right
                transition={{ duration: 0.9 }}
            >
                <div className="m-10">
                    <div className="flex flex-row h-full items-start justify-between ml-5">
                        <div className="">
                            <h2 className="text-4xl font-bold mb-4">My Classes</h2>
                        </div>
                        <div>

                            <Dialog onClose={handleCloseDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" onClick={handleButtonClick}> New Class +</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
                                    <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 ">
                                        Create class
                                    </h2>
                                    <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 mb-3">
                                        Create your own class of students.
                                    </p>
                                    <LabelInputContainer className="mb-3">
                                        <Label htmlFor="name">Class name</Label>
                                        <Input id="name" type="text" value={classData.name} onChange={updateForm("name")} />
                                    </LabelInputContainer>
                                    <LabelInputContainer className="mb-3">
                                        <Label htmlFor="description">Class description</Label>
                                        <Input id="description" type="text" value={classData.description} onChange={updateForm("description")} />
                                    </LabelInputContainer>
                                    <button
                                        className=" mt-5 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 
                                            to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium 
                                            shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] 
                                            dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                                        type="submit"
                                        onClick={handleCreateClass}>
                                        Create class &rarr;
                                        <BottomGradient />
                                    </button>
                                </DialogContent>
                            </Dialog>

                        </div>
                    </div>
                    <div>
                        {classes.length > 0 && (
                            <div className="flex flex-col">
                                <div className="grid grid-cols-5">
                                    {classes.map((claz, index) => (
                                        <TeamCard key={index} team={claz} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default MyClassesView;