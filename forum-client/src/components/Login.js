import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const loginUser = () => {
		fetch("http://localhost:4000/api/login", {
			method: "POST",
			body: JSON.stringify({
				email,
				password,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.error_message) {
					alert(data.error_message);
				} else {
					alert(data.message);
					navigate("/"); // Change this line to redirect to home
					localStorage.setItem("_id", data.id);
				}
			})
			.catch((err) => console.error(err));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		loginUser();
		setEmail("");
		setPassword("");
	};

	return (
		<main className='login'>
			<h1 className='loginTitle'>Zaloguj się</h1>
			<form className='loginForm' onSubmit={handleSubmit} autocomplete="off">
				<label htmlFor='email'>Adres e-mail</label>
				<input
					type='text'
					name='email'
					id='email'
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<label htmlFor='password'>Hasło</label>
				<input
					type='password'
					name='password'
					id='password'
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button className='loginBtn'>ZALOGUJ SIĘ</button>
				<p className="centeredParagraph">
					Nie masz konta? <Link to='/register'>Zarejestruj się</Link>
				</p>
			</form>
		</main>
	);
};

export default Login;