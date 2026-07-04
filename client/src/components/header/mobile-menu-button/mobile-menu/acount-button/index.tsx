import { JSX } from 'react';
import SigninButton from '../../../auth-button/signin-button/index';
import SignupButton from '../../../auth-button/signup-button/index';

const AcountButton = (): JSX.Element => {
  return (
    <div className="flex flex-col items-center gap-4 text-lg">
      <SigninButton />
      <SignupButton />
    </div>
  )
};

export default AcountButton;