import { GoogleLogin } from "@react-oauth/google";

const googleIconUrl = "/assets/icons/google-icon.svg";

type SignInButtonProps = {
  onSuccess: (credentialResponse: { credential?: string }) => void;
  onError: () => void;
};

export function SignInButton({ onSuccess, onError }: SignInButtonProps) {
  return (
    <div className="google-login-wrapper relative h-[72px] w-[316px] rounded-[16px]">
      {/* Backdrop blur layer */}
      <div className="absolute inset-0 z-0 rounded-[16px] bg-gradient-to-br from-[#080314] via-[#190a32] to-[#2b0f58] backdrop-blur-[25px]" />
      {/* GoogleLogin button */}
      <div className="relative z-10 h-full w-full">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          useOneTap={false}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
      {/* Custom visual overlay - positioned absolutely to cover the button */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center gap-3 rounded-[16px] bg-[rgba(6,3,15,0.41)]">
        <img src={googleIconUrl} alt="Google" className="h-8 w-8" />
        <span className="font-poppins text-xl font-medium tracking-[-0.4px] text-[#f1eeea]">
          Sign in with Google
        </span>
      </div>
      {/* Clickable overlay to trigger Google button */}
      <div
        className="absolute inset-0 z-30 cursor-pointer rounded-[16px]"
        onClick={(e) => {
          const googleButton = e.currentTarget.parentElement?.querySelector(
            'div[role="button"]',
          ) as HTMLElement;
          if (googleButton) {
            googleButton.click();
          }
        }}
        aria-label="Sign in with Google"
      />
    </div>
  );
}
