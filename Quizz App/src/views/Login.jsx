import { useContext, useEffect, useState } from 'react';
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
            navigate(location.state?.from.pathname || '/');
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

    console.log(user)

    return (
        <div>
            {/* <h1>Login</h1>
            <input type="text" placeholder="Email" onChange={updateForm('email')} />
            <input type="password" placeholder="Password" onChange={updateForm('password')} />
            <button onClick={login}>Login</button> */}
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold">Login now!</h1>
                        <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
                    </div>
                    <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                        <form className="card-body">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input type="email" placeholder="email" className="input input-bordered" required />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Password</span>
                                </label>
                                <input type="password" placeholder="password" className="input input-bordered" required />
                                <label className="label">
                                    <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                                </label>
                            </div>
                            <div className="form-control mt-6">
                                <button className="btn btn-primary">Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )

};

export default Login;
