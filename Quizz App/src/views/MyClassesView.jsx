import { useContext, useEffect, useState } from "react";
import { createClass, getClassesByCreator } from "../services/class-service";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const MyClassesView = () => {

    const { userData } = useContext(AppContext)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [classes, setClasses] = useState([]);

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
            getClassesByCreator(userData.username).then(classes => setClasses(classes || []));
        }

    }, [userData])

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
                    <Button variant="outline" onClick={handleButtonClick} > New Class +</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral text-black dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Create class</DialogTitle>
                        <DialogDescription>
                            {`Create your own class of students.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Class name
                            </Label>
                            <Input id="title" value={classData.name} onChange={updateForm('name')} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Class description
                            </Label>
                            <Input id="category" value={classData.description} onChange={updateForm('description')} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleCreateClass}>Create Class</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {classes && classes.length > 0 && (
                <div>
                    {classes.map((classItem, index) => (
                        classItem && classItem.name && classItem.description ? (
                            <div key={index} className="card w-96 bg-base-100 shadow-xl image-full">
                                <figure><img src="https://daisyui.com/images/stock.jpg" alt="class image" /></figure>
                                <div className="justify-end card-body">
                                    <h2 className="card-title">{classItem.name}</h2> 
                                    <p>{classItem.description}</p>
                                    <div className="card-actions">
                                        <Button variant="outline" onClick={() => navigate(`/class/${classItem.id}`)}>Go to class</Button>
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