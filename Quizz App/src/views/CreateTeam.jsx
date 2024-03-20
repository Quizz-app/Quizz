import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllTeachers } from "../services/users-service";
import { onTeamMembersChange, getTeamById, removeMemberFromTeam, inviteUserToTeam, deleteTeam, getAllTeamQuizzes, removeQuizFromTeam } from "../services/teams-service";
import TableRow from "../components/TableRow";
import { AppContext } from "../context/AppContext";
import { Input } from ".././components/ui/input";
import QuizCardPaginated from "../components/QuizCardPaginated";
import TableWithPagination from "../components/TableWithPagination";
import { AnimatePresence, motion } from "framer-motion";

const CreateTeam = () => {
    const { userData } = useContext(AppContext)
    const { id } = useParams();
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [team, setTeam] = useState([]);
    const [teamQuizzes, setTeamQuizzes] = useState([]);
    const [showResults, setShowResults] = useState(true);
    const itemsPerPage = 5;
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


    return (
        <>
            <AnimatePresence mode='wait'>
                <motion.div
                    initial={{ opacity: 0, x: -200 }} // Starts from the left
                    animate={{ opacity: 1, x: 0 }} // Moves to the center
                    exit={{ opacity: 0, x: 200 }} // Exits to the right
                    transition={{ duration: 0.99 }}
                >
                <div className="hero min-h-screen flex flex-col bg-base rounded-lg">
                    <div className="hero-content text-center flex flex-col w-full">
                        <div className="flex mt-5">
                            <Input className="input input-bordered w-full max-w-xs" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for teacher" />
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
                                        <div className="divider"></div>
                                        {filteredTeachers.length > 0 ? (
                                            <TableWithPagination array={filteredTeachers} pages={itemsPerPage} addMember={handleInviteMember} buttonText={'Invite teacher'} />
                                        ) : (
                                            <div className="flex justify-center mt-5 mb-5">
                                                <h2 className=" text-2xl ml-5 mr-5">{`No results found. Sorry :(`}</h2>
                                            </div>
                                        )}
                                    </div>
                                }
                            </div>
                            <div className="divider"></div>
                            <h1 className="text-2xl">Team members of {team.name}</h1>
                            <div className="divider"></div>
                            <div className="teacher-table">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>First and last name</th>
                                            <th>Email</th>
                                            <th>Action</th>
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
                        <div className="divider"></div>
                        <div className="">
                            <QuizCardPaginated currentQuiz={teamQuizzes} quizzesPerPage={itemsPerPage} deleteQuiz={handleRemoveQuiz} teamId={id} />
                        </div>
                    </div>
                </div>
                </motion.div>
            </AnimatePresence>
            </>
            );
};

            export default CreateTeam;