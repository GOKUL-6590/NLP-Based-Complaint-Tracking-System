import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import "./RaiseTicket.css";
import { createTicket } from "../../service/userService";
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { showLoading, hideLoading } from "../../redux/alertSlice";

const RaiseTicket = () => {
    const [formData, setFormData] = useState({
        systemNumber: "",
        venue: "",
        block: "",
        category: "",
        description: "",
        status: "open",
        priority: "",
    });
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch()
    const [attachments, setAttachments] = useState([]);
    const blocks = ["A Block", "B Block", "C Block", "D Block"];
    const categories = ["Hardware", "Software", "Network"];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // const onDrop = (acceptedFiles) => {
    //     const validFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"));

    //     if (validFiles.length > 0) {
    //         const filesWithPreview = validFiles.map((file) =>
    //             Object.assign(file, { preview: URL.createObjectURL(file) })
    //         );

    //         setAttachments((prev) => [...prev, ...filesWithPreview]);
    //     } else {
    //         alert("Please upload only image files.");
    //     }
    // };

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        console.log(acceptedFiles);
        console.log(rejectedFiles);
        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {

                setAttachments(prev => [...prev, reader.result])
            }
            reader.readAsDataURL(file);
        })
    }, [])



    const removeFile = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/jpg": [],
        },
        multiple: true,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.systemNumber || !formData.venue || !formData.description) {
            alert("Please fill in all required fields.");
            return;
        }

        const formDataToSubmit = new FormData();
        formDataToSubmit.append("systemNumber", formData.systemNumber);
        formDataToSubmit.append("venue", formData.venue);
        formDataToSubmit.append("block", formData.block);
        formDataToSubmit.append("category", formData.category);
        formDataToSubmit.append("description", formData.description);
        formDataToSubmit.append("status", formData.status);
        formDataToSubmit.append("priority", formData.priority);
        formDataToSubmit.append("userid", user.id);

        console.log(attachments)

        // Attach each file to the form data
        attachments.forEach((file, index) => {
            formDataToSubmit.append(`attachments[${index}]`, file);
        });


        try {

            dispatch(showLoading())
            const response = await createTicket(formDataToSubmit);
            dispatch(hideLoading())
            console.log("Form submitted successfully:", response);

            toast.success(response.message);
            // Reset form data and attachments
            setFormData({
                systemNumber: "",
                venue: "",
                block: "",
                category: "",
                description: "",
                status: "open",
                priority: "",
            });
            setAttachments([]);
        } catch (error) {
            dispatch(hideLoading())
            console.error("Error submitting the form:", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    };


    return (
        <form className="ticket-form-grid" onSubmit={handleSubmit}>
            <h2 className="form-title">Raise a Ticket</h2>

            <div className="form-group">
                <label htmlFor="systemNumber">System Number</label>
                <input
                    type="text"
                    id="systemNumber"
                    name="systemNumber"
                    value={formData.systemNumber}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="venue">Venue</label>
                <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="block">Block</label>
                <select
                    id="block"
                    name="block"
                    value={formData.block}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Block</option>
                    {blocks.map((block, index) => (
                        <option key={index} value={block}>
                            {block}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                ></textarea>
            </div>

            <div className="form-group full-width">
                <label>Attachments</label>
                <div
                    {...getRootProps({
                        className: "dropzone",
                    })}
                >
                    <input {...getInputProps()} />
                    <p>Drag & drop your files here, or click to select</p>
                </div>
                <div className="preview-container">
                    {attachments.map((file, index) => (
                        <div key={index} className="preview-item">
                            <img
                                src={file}
                                alt="Preview"
                                className="preview-image"
                            />
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeFile(index)}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" className="submit-btn">
                Submit
            </button>
        </form>
    );
};

export default RaiseTicket;
