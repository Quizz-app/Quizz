import { useContext, useEffect, useState } from "react";
import { createClass, getUserClasses } from "../services/class-service";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LabelInputContainer from "../components/ui/LabelInputContainer";
import { BottomGradient } from "./MyLibrary";


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
            {classes && classes.length > 0 && (
                <div className="flex flex-row">
                    {classes.map((classItem, index) => (
                        classItem && classItem.name && classItem.description ? (
                            <div key={index} className="card w-80 shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(144,238,144,0.9)] px-8 py-2 bg-[#90ee90] rounded-md text-dark font-light transition duration-200 ease-linear mr-6">
                                <div className="card-body">
                                    <h2 className="card-title">{classItem.name}</h2>
                                    <p>{classItem.description}</p>
                                    <div className="flex justify-center items-center mt-5">
                                        <button className="btn btn-sm bg-base-300 shadow-xl" onClick={() => navigate(`/class/${classItem.id}`)}>Go to class</button>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyClassesView;