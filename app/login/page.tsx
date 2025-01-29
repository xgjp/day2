// app/login/page.tsx
import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <div className="flex gap-2">
        <button formAction={login}>Log in</button>
        <button formAction={signup}>Sign up</button>
      </div>
    </form>
  )
}