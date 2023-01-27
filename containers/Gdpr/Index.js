import React from "react"
import Translate from "../../components/Translate/Index";
import Link from "../../components/Link/index"

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            consent:false
        }
        this.closeConsentPopup = this.closeConsentPopup.bind(this)
    }
    closeConsentPopup(e){
        e.preventDefault();
        localStorage.setItem("cookie-consent",true)
        this.setState({consent:false})
    }
    
    componentDidMount(){
        if(!localStorage.getItem("cookie-consent")){
            this.setState({consent:true})
        }
    }
    render() {
        if(!this.state.consent){
            return null;
        }
        return (
            <div className="cookie-consent">
                <span>
                    {Translate(this.props,'This website uses cookies to ensure you get the best experience on our website.')}
                    <Link href="/privacy">
                        <a className="cookie-consent-link" target="_blank">{Translate(this.props,'Learn More')}</a>
                    </Link>
                </span>
                <div className="cookie-consent-compliance">
                    <a className="cookie-consent-btn cookie-consent-dismiss" href="#" onClick={this.closeConsentPopup}>{Translate(this.props,'Got It!')}</a>
                </div>
            </div>
        )
    }
}

export default Index;