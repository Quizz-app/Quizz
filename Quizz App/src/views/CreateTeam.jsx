import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllTeachers } from "../services/users-service";
import { onTeamMembersChange, getTeamById, removeMemberFromTeam, inviteUserToTeam, deleteTeam, getAllTeamQuizzes, removeQuizFromTeam } from "../services/teams-service";
import TableRow from "../components/TableRow";
import { AppContext } from "../context/AppContext";
import { BentoGrid, BentoGridItem } from "../components/ui/bento-grid";

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

    const handleInviteMember = async (teacher) => {
        if (members.some(member => member.username === teacher.username)) {
            alert('This member is already in the team');
        } else {
            await inviteUserToTeam(id, teacher, userData.username);
        }
    };
    const filteredTeachers = teachers.filter(teacher => teacher.email.toLowerCase().includes(searchTerm.toLowerCase()));

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

    const handleRemoveQuiz = (quizId) => {
        removeQuizFromTeam(id, quizId);
    };
    const handleDeleteTeam = () => {
        deleteTeam(id);
        navigate('/my-teams');

    };



    return (
        <div className="hero min-h-screen flex flex-col bg-base-200 rounded-lg">
            <div className="hero-content text-center flex flex-col w-full">
                <div>
                    <input className="input input-bordered w-full max-w-xs" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for teacher" />
                </div>

                <div className="w-full">
                    <div className="ml-10 mr-10">
                        {searchTerm.length >= 3 &&
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Name</th>
                                            <th>Job</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeachers.map((teacher, index) =>
                                            <tr key={index}>
                                                <th>{index + 1}</th>
                                                <td>{teacher.username}</td>
                                                <td>{teacher.role}</td>
                                                <td>{teacher.email}</td>
                                                <button onClick={() => handleInviteMember(teacher)} className="btn btn-xs">Add to team</button>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                    <div className="divider"></div>
                    <h1 className="text-2xl">Team members</h1>
                    <div className="divider"></div>
                    <div className="teacher-table">
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
                        <button className="btn btn-primary" onClick={() => handleDeleteTeam()}>Delete team</button>
                    }
                </div>
                <hr />
                <div>
                    <h1>Team Quizzes</h1>

                    {teamQuizzes.map((quiz, index) => (
                        <div className="border flex flex-row justify-between" key={index}>
                            <h2>{quiz.title}</h2>
                            <p>{quiz.description}</p>
                            <p>{quiz.creator}</p>
                            <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Got to quiz</button>
                            <button onClick={() => handleRemoveQuiz(quiz.id)}>Remove quiz</button>
                        </div>
                    ))}
                </div>

                <BentoGrid className="max-w-4xl mx-auto">
                    {teamQuizzes.map((quiz, i) => (
                        <BentoGridItem
                            key={i}
                            title={quiz.title}
                            description={quiz.description}
                            header={quiz.description}
                            icon={quiz.icon}
                            className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                            remove={() => handleRemoveQuiz(quiz.id)}
                        />
                    ))}
                </BentoGrid>
            </div>

        </div>
    );
};

export default CreateTeam;