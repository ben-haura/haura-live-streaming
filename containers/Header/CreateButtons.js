import React from "react"

import Items from "./CreateButtonsItem"

class CreateButtons extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            style:props.style,
            type:props.type
        }
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if(nextProps.style != prevState.style || nextProps.type != prevState.type){
            return {style:nextProps.style,type:nextProps.type}
        }else{
            return null
        }
    }
    
    render(){
        if(!this.props.pageData.levelPermissions){
            return null
        }
        return(
            <React.Fragment>
                
                <li className={!this.props.mobileMenu ? `nav-item dropdown${this.state.style == "block" ? " active" : ""}` : `dropdown MobDropdownNav${this.state.style == "block" ? " active" : ""}`}>
                    <a className={!this.props.mobileMenu ? "nav-link notclosecreate parent bg-cnt" : "nav-link notclosecreate parent"} href="#" onClick={(e) => this.props.openToggle('createbuttons',e)}>
                        {
                            !this.props.mobileMenu ? 
                            <span className="material-icons notclosecreate parent">add</span>
                        :
                            <svg viewBox="0 0 24 24" fill="#ffffff" className="notclosecreate parent"><path className="notclosecreate parent" d="M0 0h24v24H0V0z" fill="none"></path><path className="notclosecreate parent" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
                        }
                    </a>
                    {
                    !this.props.mobileMenu  ?
                    <ul className="createButtons dropdown-menu dropdown-menu-right iconMenuList" ref={this.props.setCreateButtonsWrapperRef}  style={{display:this.state.style}}>
                        <span className="dropdown-menu-arrow"></span>
                        <Items {...this.props} />
                    </ul>
                    : null
                }
                </li>                
            </React.Fragment>
        )
    }
}
export default CreateButtons