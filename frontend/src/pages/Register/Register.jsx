import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';
import { registerUser } from '../../service/auth_service';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../redux/alertSlice';
import logo from "../../assets/logo2.png";

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        phoneNumber: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const isTechnician = formData.role === 'technician';
        const payload = {
            ...formData,
            pendingApproval: isTechnician,
        };

        try {
            dispatch(showLoading());
            const response = await registerUser(payload);
            dispatch(hideLoading());

            if (response.success) {
                navigate("/");
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            toast.error(error.response?.data.error || 'Registration failed.');
        }
    };

    return (
        <div className="container">
            <div className="website-header">
                <img src={logo} alt="Tikify Logo" className="login-logo" />
                <span className="website-name">Tikify</span>
            </div>
            <div className="register">
                <h2>Register</h2>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                required
                            />
                        </label>
                    </div>
                    <div className="form-row">
                        <label>
                            Password:
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                required
                            />
                        </label>
                        <label>
                            Confirm Password:
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                }
                                required
                            />
                        </label>
                    </div>
                    <div className="form-row">
                        <label>
                            Phone Number:
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, phoneNumber: e.target.value })
                                }
                                required
                            />
                        </label>
                        <label>
                            Role:
                            <select
                                name="role"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                                required
                            >
                                <option value="user">User</option>
                                <option value="technician">Technician</option>
                            </select>
                        </label>
                    </div>
                    <button type="submit">Register</button>
                </form>
                <p>
                    Already have an account? <Link to="/">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;