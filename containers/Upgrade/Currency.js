
import React from "react"
// import { IntlProvider, FormattedNumber } from 'react-intl';

// class Currency extends React.Component{
//     constructor(props){
//         super(props)
//         this.state = {
//             package:props.package && props.package.price ? props.package.price : props.price,
//             language:props.i18n.language
//         }
//     }
//     static getDerivedStateFromProps(nextProps, prevState) {
//         return {
//             language:nextProps.i18n.language
//         }
//     }
const Currency = (props) => {
        let price = props.package && props.package.price ? props.package.price : props.price
        if(!parseFloat(price)){
            price = 0
        }
        let currency = props.pageData.appSettings.payment_default_currency;

        return new Intl.NumberFormat(props.i18n.language, {
            style: 'currency',
            currency: currency
          }).format(price);

        // return <IntlProvider locale={props..language}>
        //     <FormattedNumber
        //         value={price}
        //         style="currency"
        //         currency={currency} />
        // </IntlProvider>;
    }
// }


export default Currency;