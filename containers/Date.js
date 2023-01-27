import moment from 'moment-timezone';
const Timeago = (_props,creation_date,initialLanguage,format,defaultTimezone) => {
    var language = initialLanguage
    if(typeof window != "undefined"){
        language = $("html").attr("lang");
    }
    let dateS = moment(creation_date).locale(language)
    return dateS.tz(defaultTimezone).format(format ? format : 'dddd, MMMM Do YYYY')
}

export default Timeago