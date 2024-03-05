import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllTeachers } from "../services/users-service";
import { onTeamMembersChange, getTeamById, removeMemberFromTeam, inviteUserToTeam, deleteTeam } from "../services/teams-service";
import TableRow from "../components/TableRow";
import { AppContext } from "../context/AppContext";

const CreateTeam = () => {
    const { userData, isLoading } = useContext(AppContext)
    const { id } = useParams();
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [team, setTeam] = useState([]);

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

    const handleRemoveMember = (member) => {
        removeMemberFromTeam(id, member);

    };

    const handleDeleteTeam = () => {
        deleteTeam(id);
        navigate('/my-teams');

    };

    
    

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
                <hr />
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
                            <TableRow key={index} teacher={member} handleRemoveMember={() => handleRemoveMember(member)} creator={team.creator.username} />
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
        </div>
    );
};

export default CreateTeam;