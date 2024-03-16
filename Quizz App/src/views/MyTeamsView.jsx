import { useContext, useEffect, useState } from "react";
import { createTeam } from "../services/teams-service";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserTeams, userLeaveTeam } from "../services/users-service";
import LabelInputContainer from "../components/ui/LabelInputContainer";
import { BottomGradient } from "./MyLibrary";


const MyTeamsView = () => {

    const { userData } = useContext(AppContext)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [teams, setTeams] = useState([]);

    const [team, setTeam] = useState({
        name: "",
        description: ""
    });

    const navigate = useNavigate();

    const updateForm = (prop) => (e) => {
        setTeam({
            ...team,
            [prop]: e.target.value,
        });
    };

    useEffect(() => {
        if (userData) {
            const unsubscribe = getUserTeams(userData.username, setTeams);
            return () => unsubscribe();
        }

    }, [userData])

    const handleCreateTeam = async () => {
        try {
            const id = await createTeam(team.name, team.description, userData.username);
            setTeam({
                ...team,
                id: id
            });
            navigate(`/team/${id}`);
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
                    <Button variant="outline" onClick={handleButtonClick}> New Team +</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
                    <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 ">
                        Create team
                    </h2>
                    <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 mb-3">
                        Create your own team of educators.
                    </p>
                    <LabelInputContainer className="mb-3">
                        <Label htmlFor="name">Team name</Label>
                        <Input id="name" type="text" value={team.name} onChange={updateForm("name")} />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-3">
                        <Label htmlFor="description">Team description</Label>
                        <Input id="description" type="text" value={team.description} onChange={updateForm("description")} />
                    </LabelInputContainer>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-3">
                    </div>
                    <button
                        className=" mt-5 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 
                                            to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium 
                                            shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] 
                                            dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                        type="submit"
                        onClick={handleCreateTeam}>
                        Create team &rarr;
                        <BottomGradient />
                    </button>
                    <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
                </DialogContent>
            </Dialog>

            {teams.length > 0 && (
                <div>
                    {teams.map((team, index) => (
                        team && team.name && team.description ? (
                            <div key={index} className="card w-96 bg-base-100 shadow-xl image-full">
                                <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
                                <div className="card-body">
                                    <h2 className="card-title">{team.name}</h2>

                                    <p>{team.id}</p>
                                    <div className="card-actions justify-between">
                                        <button className="btn btn-primary" onClick={() => navigate(`/team/${team.id}`)}>Go to team</button>
                                        <button className="btn btn-primary" onClick={() => userLeaveTeam(userData.username, team.id)}>Leave team</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            null
                        )
                    ))}
                </div>
            )}
        </div>
    );
};


export default MyTeamsView;