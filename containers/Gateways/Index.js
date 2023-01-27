import React from "react"
import Translate from "../../components/Translate/Index";
import dynamic from 'next/dynamic'
import SendMessageToApps from "../../components/SendMessageToApps/Index"

const Stripe = dynamic(() => import("./Stripe"), {
    ssr: false
  });
const Bank = dynamic(() => import("./Bank"), {
    ssr: false
  });
import axios from "../../axios-orders";

class Index extends React.Component{
    constructor(props) {
        super(props)        
        this.state = {
            paypal:props.pageData.appSettings['paypalEnabled'] == 1,
            stripe:props.pageData.appSettings['stripeEnabled'] == 1,
            cashfree:props.pageData.appSettings['cashfreeEnabled'] == 1,
            bank:props.pageData.appSettings['bankTransferEnabled'] == 1
        }
    }

    paypal = () => {
       window.location.href = this.props.payPalURL ? this.props.payPalURL :  (this.props.gatewaysUrl+ (this.props.gatewaysUrl.indexOf("?") > -1  ?  "&type=paypal" : "?type=paypal"))
       this.props.closePopup();
    }
    stripe = () => {
        this.setState({paymentType:"stripe"})
    }
    cashfree = () => {
        window.location.href = this.props.gatewaysUrl+ (this.props.gatewaysUrl.indexOf("?") > -1  ?  "&type=paypal" : "?type=cashfree")
    }
    bank = () => {
        this.setState({paymentType:"bank"})
    }
    getStripeKey = () => {
        let formData = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = "/member/stripekey";
        
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    
                } else {
                    this.setState({stripekey:response.data.stripekey});
                }
            }).catch(err => {
                
            });
    }
    componentDidMount(){
        let countEnableGateways = 0
        let enableGateway = ""
        if(this.state.paypal){
            countEnableGateways++;
            enableGateway = "paypal"
        }
        if(this.state.stripe){
            countEnableGateways++;
            enableGateway = "stripe"
            this.getStripeKey();
        }
        if(this.state.bank){
            countEnableGateways++;
            enableGateway = "bank"
        }
        if(this.props.pageData.fromAPP && this.props.pageData.fromAppDevice == "ios"){
            let url = this.props.payPalURL ? this.props.payPalURL :  (this.props.gatewaysUrl+ (this.props.gatewaysUrl.indexOf("?") > -1  ?  "&type=paypal" : "?type=paypal"))
            let props = {...this.props}
            props.purchaseData = {
                url:url
            }
            SendMessageToApps({props:props,type:"userPurchases"});
            // this.props.closePopup();
        }
    }
    render(){
        if(this.props.pageData.fromAPP && this.props.pageData.fromAppDevice == "ios"){
            // return null;
        }
        let stripe = null
        if(this.state.paymentType == "stripe"){
           stripe =  <Stripe {...this.props} stripekey={this.state.stripekey} tokenURL={this.props.tokenURL} closePopup={() => this.setState({paymentType:null})} gatewaysUrl={this.props.gatewaysUrl} />
        }else if(this.state.paymentType == "bank"){
            stripe =  <Bank {...this.props} tokenURL={this.props.tokenURL} closePopup={() => this.setState({paymentType:null})} gatewaysUrl={this.props.gatewaysUrl} />
         }

        return (
            <React.Fragment>
                <div className="popup_wrapper_cnt">
                    <div className="popup_cnt">
                        <div className="comments">
                            <div className="payment-cnt">
                                <div className="popup_wrapper_cnt_header">
                                    <h2>{Translate(this.props, "Choose a payment method")}</h2>
                                    <a onClick={this.props.closePopup} className="_close"><i></i></a>
                                </div>
                                {
                                    !this.state.paypal && !this.state.stripe && !this.state.bank ? 
                                    <p className="no-gateway-enabled">{this.props.t("No Payment Gateway enabled. Please contact admin.")}</p>
                                :
                                    <div className=" gateway-options">
                                        {
                                            this.state.paypal ? 
                                                <button onClick={this.paypal}><img src="/static/images/paypal.png" />{Translate(this.props,'Paypal')}</button>
                                            : null
                                        }
                                        {
                                            this.state.stripe ? 
                                                <button onClick={this.stripe}><img src="/static/images/stripe.webp" />{Translate(this.props,'Credit Card')}</button>
                                            : null
                                        }
                                        {/* {
                                            this.state.cashfree ? 
                                                <button onClick={this.cashfree}><img src="/static/images/cashfree.png" />{Translate(this.props,'Cashfree')}</button>
                                            : null
                                        } */}
                                        {
                                            this.state.bank ? 
                                                <button onClick={this.bank}><img src="/static/images/bank.png" />{Translate(this.props,'Bank Transfer')}</button>
                                            : null
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {stripe}
            </React.Fragment>
        )

    }
}



export default Index