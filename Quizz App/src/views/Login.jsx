import  { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { loginUser } from '../services/auth-service';


const Login = () => {
    const { user, setContext } = useContext(AppContext);
    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const navigate = useNavigate();
    const location = useLocation();

    const updateForm = prop => e => {
        setForm({ ...form, [prop]: e.target.value });
    };

    useEffect(() => {
        if (user) {
            navigate(location.state?.from.pathname || '/home');
        }
    }, [user]);

    const login = async () => {
        try {
            const credentials = await loginUser(form.email, form.password);
            setContext({ user: credentials.user, userData: null });
        }
        catch (err) {
            console.log(err.message);
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <input type="text" placeholder="Email" onChange={updateForm('email')} />
            <input type="password" placeholder="Password" onChange={updateForm('password')} />
            <button onClick={login}>Login</button>
        </div>
    )
  
};

export default Login;
