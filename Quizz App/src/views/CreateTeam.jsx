import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllTeachers } from "../services/users-service";
import { onTeamMembersChange, getTeamById, removeMemberFromTeam, inviteUserToTeam, deleteTeam, getAllTeamQuizzes } from "../services/teams-service";
import TableRow from "../components/TableRow";
import { AppContext } from "../context/AppContext";

const CreateTeam = () => {
    const { userData, isLoading } = useContext(AppContext)
    const { id } = useParams();
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [team, setTeam] = useState([]);
    const [teamQuizzes, setTeamQuizzes] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        getAllTeachers().then(setTeachers)
    }, []);

    useEffect(() => {
        getTeamById(id).then(setTeam);
    }, [id]);

    useEffect(() => {
        const unsubscribe = onTeamMembersChange(id, setMembers);
        return () => unsubscribe();
    }, [id]);

    const handleInviteMember = (teacher) => {
        if (members.some(member => member.username === teacher.username)) {
            alert('This member is already in the team');
        } else {
            inviteUserToTeam(id, teacher, userData.username);
        }
    };

    useEffect(() => {
        if (!isLoading) {
            // Do something with userData here
        }
    }, [isLoading, userData]);

    useEffect(() => {
        const unsubscribe = getAllTeamQuizzes(id, setTeamQuizzes);
        return () => unsubscribe();
    }, [id])

    const handleRemoveMember = (member) => {
        removeMemberFromTeam(id, member);
    };

    const handleDeleteTeam = () => {
        deleteTeam(id);
        navigate('/my-teams');

    };


    console.log(teamQuizzes);

    const filteredTeachers = teachers.filter(teacher => teacher.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
        <div>
            <input className="input input-bordered w-24 md:w-auto mt-2 mb-2" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for teacher" />
            <div className="flex flex-col">
                <div className="ml-10 mr-10">
                    {searchTerm.length >= 3 && filteredTeachers.map((teacher, index) =>
                        <div className="border mb-2" key={index}>
                            <label htmlFor="">Teacher username</label>
                            <div className="border mb-3">
                                {teacher.username}
                            </div>
                            <button onClick={() => handleInviteMember(teacher)} className="ml-5">Add to team</button>
                        </div>
                        // <TableRow key={index} teacher={teacher} handleRemoveMember={() => handleRemoveMember(teacher)} />
                    )}
                </div>
                {`Members of team ${team.name}`}
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>First and last name</th>
                                <th>Email</th>

                            </tr>
                        </thead>
                        {members && userData && team.creator && members.map((member, index) => (
                            <TableRow key={index} teacher={member} creator={team.creator.username} handleRemoveMember={() => handleRemoveMember(member)} />
                        ))}
                        <tfoot>
                            <tr>
                                <th>Username</th>
                                <th>First and last name</th>
                                <th>Email</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div>
                {userData && team.creator && (userData.isAdmin || userData.username === team.creator.username) &&
                    <button className="border" onClick={() => handleDeleteTeam()}>Delete team</button>
                }
            </div>
            <hr />
            <div>
                <h1>Team Quizzes</h1>

                {teamQuizzes.map((quiz, index) => (
                    <div  className="border flex flex-row justify-between"key={index}>
                        <h2>{quiz.title}</h2>
                        <p>{quiz.description}</p>
                        <p>{quiz.creator}</p>
                        <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Got to quiz</button>
                        <button>Remove quiz Trqbva da se opravi</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreateTeam;