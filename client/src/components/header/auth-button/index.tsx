import { JSX } from 'react';
import SigninButton from './signin-button';
import SignupButton from './signup-button';

const AuthButton = (): JSX.Element => {
  return (
    <div className="flex items-center gap-3">
      <SigninButton />
      <SignupButton />
    </div>
  )
}

export default AuthButton;