import React, { useState } from 'react';
import { emailInput } from './FormComponents';


const Contact = () => {
    const [score, setScore] = useState("_");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        if (message.length < 20) {
            alert('Message must be at least 10 characters long');
        }
        console.log('Form submitted with values:', { email, message, score });
        setMessage('');
        setScore('_');
        setEmail('');
    }
    return (
        <div className="contactForm">
        <h2>Contact Us</h2>
        <form onSubmit={handleSubmit}>
        <fieldset>
            {emailInput(email, setEmail, "Your Email: ")}
            <div className='formDiv'>
                <label htmlFor="message">Message*</label>
                <textarea className='my-2'
                    id="message"
                    rows="5"
                    cols="50"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    
                />
            </div>
            <div className='formDiv'>
                <label htmlFor="score">(Optional) What is your overall site experience?  {score} ⭐ </label>
                <input
                type="range" 
                id="score" 
                name="score"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                 />
            </div>
            <button className='btn btnstd' type="submit">Submit</button>
        </fieldset>
        </form>
        </div>
    );
}

export default Contact;
