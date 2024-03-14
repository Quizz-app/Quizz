import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllTeachers } from "../services/users-service";
import { onTeamMembersChange, getTeamById, removeMemberFromTeam, inviteUserToTeam, deleteTeam, getAllTeamQuizzes, removeQuizFromTeam } from "../services/teams-service";
import TableRow from "../components/TableRow";
import { AppContext } from "../context/AppContext";
import QuizCard from "./QuizCard";


const CreateTeam = () => {
    const { userData } = useContext(AppContext)
    const { id } = useParams();
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [team, setTeam] = useState([]);
    const [teamQuizzes, setTeamQuizzes] = useState([]);
    const [showResults, setShowResults] = useState(true);

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

    const [currentPage, setCurrentPage] = useState(1);
    const quizzesPerPage = 3;
    const totalPages = Math.ceil(teamQuizzes.length / quizzesPerPage);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const indexOfLastQuiz = currentPage * quizzesPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;

    const currentQuizzes = teamQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);



    return (
        <div className="hero min-h-screen flex flex-col bg-base-200 rounded-lg">
            <div className="hero-content text-center flex flex-col w-full">
                <div className="flex">
                    <input className="input input-bordered w-full max-w-xs" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for teacher" />

                    <label className="btn btn-circle swap swap-rotate ml-3">

                        {/* this hidden checkbox controls the state */}
                        <input type="checkbox" onChange={() => setShowResults(!showResults)} />

                        {/* hamburger icon */}
                        <svg className="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" /></svg>

                        {/* close icon */}
                        <svg className="swap-on fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" /></svg>

                    </label>
                </div>
                <div className="w-full">
                    <div className="ml-10 mr-10">
                        {searchTerm.length >= 3 && showResults &&
                            <div className="overflow-x-auto">
                                <h1 className="text-xl mb-5 mt-3">Results</h1>
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
                                    <th>Remove member</th>
                                </tr>
                            </thead>
                            {members && userData && team.creator && members.map((member, index) => (
                                <TableRow key={index} member={member} creator={team.creator.username} handleRemoveMember={() => handleRemoveMember(member)} />
                            ))}
                        </table>
                    </div>
                </div>
                <div>
                    {userData && team.creator && (userData.isAdmin || userData.username === team.creator.username) &&
                        <button className="btn btn-secondary" onClick={() => handleDeleteTeam()}>Delete team</button>
                    }
                </div>
                <div className="flex flex-col">
                    <div className="divider"></div>
                    <h1 className="text-2xl">Team quizzes</h1>
                    <div className="divider"></div>
                    <div className="flex flex-row">
                        {currentQuizzes.map((quiz, index) => (
                            <div key={index} className="card w-96 bg-gradient-to-r from-cyan-500 to-blue-500 text-primary-content mr-5">
                                <div className="card-body flex">
                                    <h2 className="card-title">{quiz.title}</h2>
                                    <p>{quiz.description}</p>
                                    <div className="card-actions justify-between">
                                        <button className="btn" onClick={() => navigate(`/quiz/${quiz.id}`)}>Got to quiz</button>
                                        <button className="btn" onClick={() => handleRemoveQuiz(quiz.id)}>Remove quiz</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                    <div className="justify-center flex mt-5 mb-3">
                        {currentPage > 1 && <button className="join-item btn btn-outline mr-2" onClick={() => paginate(currentPage - 1)}>Previous</button>}
                        {pageNumbers.map(number => (
                            <button key={number} className={`join-item btn mr-2 ${number === currentPage ? 'btn-primary' : ''}`} onClick={() => paginate(number)}>{number}</button>
                        ))}
                        {currentPage < totalPages && <button className="join-item btn btn-outline" onClick={() => paginate(currentPage + 1)}>Next</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTeam;