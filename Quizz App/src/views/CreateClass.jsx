import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllStudents } from "../services/users-service";
import { onClassMembersChange, getClassById, removeMemberFromClass, inviteUserToClass, deleteClass, getAllClassQuizzes } from "../services/class-service.js";
import TableRow from "../components/TableRow";
import { AppContext } from "../context/AppContext";

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

    const handleDeleteClass = () => {
        deleteClass(id);
        navigate('/my-classes');

    };

    const filteredStudents = students.filter(student => student.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
        <div>
            <input className="input input-bordered w-24 md:w-auto mt-2 mb-2" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for students" />
            <div className="flex flex-col">
                <div className="ml-10 mr-10">
                    {searchTerm.length >= 3 && filteredStudents.map((student, index) =>
                        <div className="border mb-2" key={index}>
                            <label htmlFor="">Student username</label>
                            <div className="border mb-3">
                                {student.username}
                            </div>
                            <button onClick={() => handleInviteMember(student)} className="ml-5">Add to class</button>
                        </div>
                        // <TableRow key={index} teacher={teacher} handleRemoveMember={() => handleRemoveMember(teacher)} />
                    )}
                </div>
                {`Members of team ${classz.name}`}
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
                            <TableRow key={index} teacher={member} creator={classz.creator.username} handleRemoveMember={() => handleRemoveMember(member)} />
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
                {userData && classz.creator && (userData.isAdmin || userData.username === classz.creator.username) &&
                    <button className="border" onClick={() => handleDeleteClass()}>Delete team</button>
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
                        <button onClick={() => navigate(`/quiz/${quiz.id}`)}>Go to quiz</button>
                        <button>Remove quiz Trqbva da se opravi</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreateClass;