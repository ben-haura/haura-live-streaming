
import { useGoogleLogin,useGoogleOneTapLogin } from '@react-oauth/google';
import config from "../../config"

export default function SignInFlows(props) {

    useGoogleOneTapLogin({
        onSuccess: props.googleResponse,
        onError:props.onFailure
    });

    const login = useGoogleLogin({
            useOneTap:true,
            clientId:props.pageData.appSettings["gid"],
            redirectUri:`${config.app_server}/auth/google`,
            onSuccess:props.googleResponse,
            onFailure:props.onFailure
        })
    return (
        <a id="google_login" onClick={(e) => {
            e.preventDefault();
            login()
        }} disabled={false} className="circle google" href="#">
            <i className="fab fa-google"></i>
        </a>
    )

}