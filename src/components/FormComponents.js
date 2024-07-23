

export function emailInput (email, setEmail, title="Email: ") {
    return (
        <div>
            <label htmlFor="email">{title}</label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />  
        </div>
    )}


export function passwordInput (password, setPassword) {
    return (<div>
                    <label htmlFor='password'>Password: </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>)}


export function repeatPasswordInput (repeatPassword, setRepeatPassword) {
    return (<div>
                    <label htmlFor='repeatPassword'>Repeat Password: </label>
                    <input
                        type="password"
                        id="repeatPassword"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        required
                    />
                </div>)}


export function codeInput (code, setCode, title="Invitation Code: ") {
    return (<div>
                    <label htmlFor='code'>{title}</label>
                    <input
                        type="text"
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                </div>)}

