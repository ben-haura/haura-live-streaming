import React from "react"

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            announcements:props.announcements,
            consent:false
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(nextProps.announcements != prevState.announcements){
            return {
                announcements:nextProps.announcements
            }
        }else{
            return null;
        }
    }
    render() {
        if(!this.state.announcements){
            return null;
        }
        return (
            <div className="site-announcements">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="announcement-content" dangerouslySetInnerHTML={{ __html: this.state.announcements.description }}></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Index;