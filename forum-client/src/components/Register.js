import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [birthdate, setBirthdate] = useState("");

	const navigate = useNavigate();

	const signUp = () => {
		const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
	
		if (!passwordPolicy.test(password)) {
			alert("Hasło musi mieć co najmniej 8 znaków, zawierać co najmniej jedną wielką literę, jedną małą literę i jedną cyfrę.");
			return;
		}
	
		fetch("http://localhost:4000/api/register", {
			method: "POST",
			body: JSON.stringify({
				email,
				password,
				username,
				firstname,
				lastname,
				birthdate,
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
					alert("Account created successfully!");
					navigate("/");
				}
			})
			.catch((err) => console.error(err));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		signUp();
		setEmail("");
		setUsername("");
		setPassword("");
		setFirstname("");
		setLastname("");
		setBirthdate("");
	};
	return (
		<main className='register'>
        <h1 className='registerTitle'>Stwórz konto!</h1>
        <div className='passwordPolicy'>
            <h2>Polityka haseł</h2>
            <p>Twoje hasło musi spełniać poniższe wymagania:</p>
            <ul>
				<li>Co najmniej 8 znaków długości</li>
				<li>Zawiera co najmniej jedną dużą literę</li>
				<li>Zawiera co najmniej jedną małą literę</li>
				<li>Zawiera co najmniej jedną cyfrę</li>
            </ul>
        </div>
        <form className='registerForm' onSubmit={handleSubmit} autocomplete="off">
				<label htmlFor='firstname'>Imię</label>
				<input
					type='text'
					name='firstname'
					id='firstname'
					required
					value={firstname}
					onChange={(e) => setFirstname(e.target.value)}
				/>
				<label htmlFor='lastname'>Nazwisko</label>
				<input
					type='text'
					name='lastname'
					id='lastname'
					required
					value={lastname}
					onChange={(e) => setLastname(e.target.value)}
				/>
				<label htmlFor='birthdate'>Data urodzenia</label>
				<input
					type='date'
					name='birthdate'
					id='birthdate'
					required
					value={birthdate}
					onChange={(e) => setBirthdate(e.target.value)}
				/>
				<label htmlFor='username'>Nazwa użytkownika</label>
				<input
					type='text'
					name='username'
					id='username'
					required
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
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
				<button className='registerBtn'>ZAREJESTRUJ SIĘ</button>
				<p className="centeredParagraph">
					Posiadasz już konto? <Link to='/'>Zaloguj się</Link>
				</p>
			</form>
		</main>
	);
};

export default Register;