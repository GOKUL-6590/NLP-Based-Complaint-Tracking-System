import React, { useEffect, useState } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import { loginUser } from '../../service/auth_service';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import toast from "react-hot-toast";
import { showLoading, hideLoading } from "../../redux/alertSlice";
import logo from "../../assets/logo2.png"; // Import the logo

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login Data:', loginData);

        setLoginData({
            email: '',
            password: '',
        });

        try {
            dispatch(showLoading());
            const response = await loginUser(loginData);
            dispatch(hideLoading());
            console.log(response);

            if (response.success) {
                dispatch(setUser(response.user));
                localStorage.setItem('user', JSON.stringify(response.user));
                toast.success(response.message);

                if (response?.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (response?.user.role === 'technician') {
                    navigate('/technician/dashboard');
                } else {
                    navigate("/home");
                }
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
            console.error('Error during login:', errorMessage);
            setTimeout(() => {
                alert(errorMessage);
            }, 100);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("user")) {
            navigate("/home");
        }
    }, [navigate]);

    return (
        <div className="container">
            {/* Website Name and Logo outside the login container */}
            <div className="website-header">
                <img src={logo} alt="Tikify Logo" className="login-logo" />
                <span className="website-name">Tikify</span>
            </div>
            <div className="login">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter your email"
                            value={loginData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <br />
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <br />
                    <button type="submit" className="form-button">Login</button>
                </form>
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;