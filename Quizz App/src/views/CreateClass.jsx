import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllStudents } from "../services/users-service";
import { onClassMembersChange, getClassById, removeMemberFromClass, inviteUserToClass, deleteClass, getAllClassQuizzes } from "../services/class-service.js";
import TableRow from "../components/TableRow";
import { AppContext } from "../context/AppContext";
import { removeQuizFromTeam } from "../services/teams-service.js";

const CreateClass = () => {
    const { userData, isLoading } = useContext(AppContext)
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [classz, setClass] = useState([]);
    const [classQuizzes, setTeamQuizzes] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        getAllStudents().then(setStudents)
    }, []);

    useEffect(() => {
        getClassById(id).then(setClass);
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

    useEffect(() => {
        if (!isLoading) {
            // Do something with userData here
        }
    }, [isLoading, userData]);

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

    const filteredStudents = students.filter(student => student.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
        <div className="hero min-h-screen flex flex-col bg-base-200 rounded-lg">
            <div className="hero-content text-center flex flex-col w-full">
                <div>
                    <input className="input input-bordered w-24 md:w-auto mt-2 mb-2" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for students" />
                </div>
                <div className="w-full">
                <div className="ml-10 mr-10">
                        {searchTerm.length >= 3 &&
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
                                        {filteredStudents.map((student, index) =>
                                            <tr key={index}>
                                                <th>{index + 1}</th>
                                                <td>{student.username}</td>
                                                <td>{student.role}</td>
                                                <td>{student.email}</td>
                                                <button onClick={() => handleInviteMember(student)} className="btn btn-xs">Add to team</button>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                    <div className="divider"></div>
                    <h1 className="text-2xl">Class members</h1>
                    <div className="divider"></div>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>First and last name</th>
                                    <th>Email</th>

                                </tr>
                            </thead>
                            {members && userData && classz.creator && members.map((member, index) => (
                                <TableRow key={index} member={member} creator={classz.creator.username} handleRemoveMember={() => handleRemoveMember(member)} />
                            ))}
                        </table>
                    </div>
                </div>
                <div>
                    {userData && classz.creator && (userData.isAdmin || userData.username === classz.creator.username) &&
                        <button className="btn btn-primary" onClick={() => handleDeleteClass()}>Delete class</button>
                    }
                </div>
                <hr />
                <div>
                    <h1>Class Quizzes</h1>

                    {classQuizzes.map((quiz, index) => (
                        <div className="border flex flex-row justify-between" key={index}>
                        <h2>{quiz.title}</h2>
                        <p>{quiz.description}</p>
                        <p>{quiz.creator}</p>
                        <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Got to quiz</button>
                        <button onClick={() => handleRemoveQuiz(quiz.id)}>Remove quiz</button>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreateClass;