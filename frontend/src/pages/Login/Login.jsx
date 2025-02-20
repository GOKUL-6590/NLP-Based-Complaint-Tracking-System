import React, { useEffect, useState } from 'react';
import './Login.css'; // Ensure consistent styles with Register
import { Link } from 'react-router-dom';
import { loginUser } from '../../service/auth_service';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Import dispatch from Redux
import { setUser } from '../../redux/userSlice'; // Import setUser action
import toast from "react-hot-toast";
import { showLoading, hideLoading } from "../../redux/alertSlice";



const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Initialize dispatch to use Redux

    // State for handling form inputs
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login Data:', loginData);

        // Clear form after submission
        setLoginData({
            email: '',
            password: '',
        });

        try {
            dispatch(showLoading())
            const response = await loginUser(loginData);
            dispatch(hideLoading())
            console.log(response);

            if (response.success) {
                // Dispatch the user data to Redux store
                dispatch(setUser(response.user));
                localStorage.setItem('user', JSON.stringify(response.user));
                toast.success(response.message);

                // Navigate based on user role
                if (response?.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (response?.user.role === 'technician') {
                    navigate('/technician/dashboard');
                } else {
                    navigate("/home")
                }

                // Display success message after redirect
                // setTimeout(() => {
                //     alert(response.message);
                // }, 100);
            } else {
                // Handle unsuccessful login
                // setTimeout(() => {
                //     alert(response.message);
                // }, 100);
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(hideLoading())
            // Extract error message and display it
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
            console.error('Error during login:', errorMessage);

            setTimeout(() => {
                alert(errorMessage);
            }, 100);
        }
    };

    useEffect(() => {
        // If the user is already logged in, redirect them to the home page
        if (localStorage.getItem("user")) {
            navigate("/home");
        }
    }, [navigate]);

    return (
        <div className="container">
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
