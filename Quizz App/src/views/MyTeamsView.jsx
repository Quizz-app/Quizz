import { useContext, useEffect, useState } from "react";
import { createTeam} from "../services/teams-service";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserTeams, userLeaveTeam } from "../services/users-service";


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
                    <Button variant="outline" onClick={handleButtonClick} > New Team +</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral text-black dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Create team</DialogTitle>
                        <DialogDescription>
                            {`Create your own team of educators.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Team name
                            </Label>
                            <Input id="title" value={team.name} onChange={updateForm('name')} className="col-span-3" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Team description
                            </Label>
                            <Input id="category" value={team.description} onChange={updateForm('description')} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleCreateTeam}>Create Team</Button>
                    </DialogFooter>
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