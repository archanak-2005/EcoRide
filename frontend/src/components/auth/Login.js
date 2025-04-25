import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import './Login.css';
import { Link } from "react-router-dom";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function loginUser(credentials) {
        return fetch(process.env.REACT_APP_END_POINT + '/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        })
            .then((response) => {
                console.log(response);
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response.statusText);
            })
            .then((responseJson) => {
                return responseJson;
            })
            .catch((error) => {
                alert(error);
            });
    }


    const handleSubmit = async e => {    
        e.preventDefault();
        const data = {
            email,
            password
        }
            const sessionUserDetails = await loginUser(data); 
            window.location.reload();
        }
    
   
     
    function validateForm() {
        return email.length > 0 && password.length > 0;
    }
    return (     
        <div className="login-container">
            <div className="login-content">
                <Form onSubmit={handleSubmit} >   
                    <h3 className="heading-text">Login</h3>
                    <Form.Group size="lg" controlId="email" className="form-group">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            autoFocus
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group size="lg" controlId="password" className="form-group">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Button  size="lg" type="submit" disabled={!validateForm()} className="login-button">
                        Login
                    </Button>
                </Form>
                <Link to='/signup' className="signup-link">SignUp</Link>
            </div>
        </div>
    );

}

export default Login;