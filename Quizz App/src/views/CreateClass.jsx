import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllStudents } from "../services/users-service";
import { onClassMembersChange, getClassById, removeMemberFromClass, inviteUserToClass, deleteClass, getAllClassQuizzes } from "../services/class-service.js";
import TableRow from "../components/TableRow";
import { AppContext } from "../context/AppContext";
import { removeQuizFromTeam } from "../services/teams-service.js";
import { Input } from ".././components/ui/input";
import QuizCardPaginated from "../components/QuizCardPaginated.jsx";
import TableWithPagination from "../components/TableWithPagination.jsx";
import { AnimatePresence, motion } from "framer-motion";

const CreateClass = () => {
    const { userData } = useContext(AppContext)
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [currentClass, setCurrentClass] = useState([]);
    const [classQuizzes, setTeamQuizzes] = useState([]);
    const [showResults, setShowResults] = useState(true);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        getAllStudents().then(setStudents)
    }, []);

    useEffect(() => {
        getClassById(id).then(setCurrentClass);
    }, [id]);

    useEffect(() => {
        const unsubscribe = onClassMembersChange(id, setMembers);
        return () => unsubscribe();
    }, [id]);

    const handleInviteMember = async (student) => {
        if (members.some(member => member.username === student.username)) {
            alert('This student is already in the class');
        } else {
            if (userData) {
                //console.log(id, student, userData.username);
                await inviteUserToClass(id, student, userData.username);
            }

        }
    };
    const filteredStudents = students.filter(student => student.email.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        const unsubscribe = getAllClassQuizzes(id, setTeamQuizzes);
        return () => unsubscribe();
    }, [id])

    const handleRemoveMember = (member) => {
        removeMemberFromClass(id, member);
    };

    const handleRemoveQuiz = (quizId) => {
        removeQuizFromTeam(id, quizId);
    };

    const handleDeleteClass = () => {
        deleteClass(id);
        navigate('/my-classes');

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
                                            {filteredStudents.length > 0 ? (
                                                <TableWithPagination array={filteredStudents} pages={itemsPerPage} addMember={handleInviteMember} buttonText={'Invite student'} />
                                            ) : (
                                                <div className="flex justify-center mt-5 mb-5">
                                                    <h2 className=" text-2xl ml-5 mr-5">{`No results found. Sorry :(`}</h2>
                                                </div>
                                            )}
                                        </div>
                                    }
                                </div>
                                <div className="divider"></div>
                                <h1 className="text-2xl">Class members of {currentClass.name}</h1>
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
                                        {members && userData && currentClass.creator && members.map((member, index) => (
                                            <TableRow key={index} member={member} creator={currentClass.creator.username} handleRemoveMember={() => handleRemoveMember(member)} />
                                        ))}
                                    </table>
                                </div>
                            </div>
                            <div>
                                {userData && currentClass.creator && (userData.isAdmin || userData.username === currentClass.creator.username) &&
                                    <button className="btn btn-secondary" onClick={() => handleDeleteClass()}>Delete class</button>
                                }
                            </div>
                            <div className="divider"></div>
                            <div className="">
                                <QuizCardPaginated currentQuiz={classQuizzes} quizzesPerPage={itemsPerPage} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default CreateClass;