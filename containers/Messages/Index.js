import React from "react"
import Timeago from "../Common/Timeago"
import axios from "../../axios-orders"
import Loader from "../LoadMore/Index"
import dynamic from 'next/dynamic'
import Router from 'next/router';
import Chat from "./Chat"


class Messages extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            showEmoji:false,
            textValue:"",
            messages:props.pageData.messages,
            pagging:props.pageData.pagging,
            page:2,
            id:props.pageData.id,
            openMessage:props.pageData.openMessage,
            chatMessages:props.pageData.chatMessages
        }
        
        this.scrollDiv = React.createRef();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if (prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else{
            return null
        }
    }

    componentDidMount() {
        this.props.socket.on('chatDelete', data => {
            let id = data.message_id
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                const messages = [...this.state.messages]
                messages.splice(itemIndex, 1);
                let messageID = this.state.id
                if(this.state.id == id){
                    if(messages.length > 0){
                        messageID = messages[0].message_id
                    }
                }
                this.setState({localUpdate:true, messages: messages,id:messageID })
            }
        })
        this.props.socket.on('chatRead', data => {
            let id = data.id
            let message_id = data.message_id
            const itemIndex = this.getItemIndex(message_id)
            if (itemIndex > -1) {
                const messages = [...this.state.messages]
                if(parseInt(messages[itemIndex].last_user_id) != parseInt(id)){
                    messages[itemIndex].is_read = 1;
                    messages[itemIndex].seen = 1;
                    this.setState({localUpdate:true, messages: messages })
                }
            }
        })
        this.props.socket.on('chatMessageCreate', data => {
            let id = data.chat.message_id
            const itemIndex = this.getItemIndex(id)
            if (itemIndex > -1) {
                
            }else{
                const messages = [data.chat,...this.state.messages]
                this.setState({localUpdate:true, messages: messages })
            }
        })
    }

    getItemIndex(item_id) {
        const messages = [...this.state.messages];
        const itemIndex = messages.findIndex(p => p["message_id"] == item_id);
        return itemIndex;
    }
    
    loadMoreData = () => {
        if(this.state.loading){
            return;
        }
        this.setState({localUpdate:true, loading: true })
        let formData = new FormData();
        formData.append('page', this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = `/messages`;

        if(this.state.searchTextValue){
            formData.append("search",this.state.searchTextValue);
        }

        axios.post(url, formData, config)
            .then(response => {
                if (response.data.messages) {
                    let pagging = response.data.pagging
                    this.setState({localUpdate:true, page: this.state.page + 1, pagging: pagging, messages: [...this.state.messages, ...response.data.messages], loading: false })
                } else {
                    this.setState({localUpdate:true, loading: false })
                }
            }).catch(() => {
                this.setState({localUpdate:true, loading: false })
            });
    }
    
    onMainScroll = () => {
        if (this.scrollDiv.current) {
            const { scrollTop, scrollHeight, clientHeight } = this.scrollDiv.current;
            if (scrollTop + clientHeight > scrollHeight - 150) {
              if(this.state.pagging){
                  this.loadMoreData();
              }
            }
        }
    }
    pushTab = (id) => {
        if(this.state.id == id){
            return
        }
        let itemIndex = this.getItemIndex(id);
        this.setState({id:id,localUpdate:true,openMessage:this.state.messages[itemIndex]})
        Router.push(`/messanger?id=${id}`, `/messages/${id}`,{ shallow: true })
    }
    changeTextValue = (e) => {
        this.setState({searchTextValue:e.target.value}, () => {
            if(this.timmer){
                window.clearTimeout(this.timmer)
            }
            this.timmer = setTimeout(
                () =>  {
                    this.setState({page:1,messages:[]},() => {
                        this.loadMoreData()
                    })
                }, 
                500
              );
        })
        
     }
     newChat = (newMessages,id,chatId) => {
        let messages = [...this.state.messages]
        let itemIndex = this.getItemIndex(id)
        if(itemIndex > -1){
            if(newMessages == "delete"){
                let index = this.getItemChatIndex(chatId)
                if(index > -1){
                    let chats = messages[itemIndex].chats
                    chats.splice(index, 1);
                    messages[itemIndex] = {...messages[itemIndex],...chatId}
                    messages[itemIndex]["chats"] = chats
                    this.setState({localUpdate:true,messages:messages})
                }
            }else if(newMessages == "create"){
                let chats = messages[itemIndex].chats ? messages[itemIndex].chats : []
                messages[itemIndex] = {...messages[itemIndex],...chatId}
                chats.push(chatId)
                messages[itemIndex]["chats"] = chats
                this.setState({localUpdate:true,messages:messages})
            }else{
                let lastMessage = newMessages[newMessages.length - 1]
                messages[itemIndex] = {...messages[itemIndex],...lastMessage}
                messages[itemIndex]["chats"] = newMessages
                this.setState({localUpdate:true,messages:messages})
            }
        }
     }
    getItemChatIndex(item_id) {
        if(this.state.messages[item_id] && this.state.messages[item_id].chats){
            const messages = [...this.state.messages[item_id].chats];
            const itemIndex = messages.findIndex(p => p["messages_text_id"] == item_id);
            return itemIndex;
        }else{
            return -1
        }
    }
    render() {

        let styleMessages = {}
        let displayChats = {}
        if(this.props.appViewWidth < 992){
            displayChats = {display:"none"}
            if(this.state.id){
                displayChats = {display:"block"}
                styleMessages = {display:"none"}
            }
        }
        
        return (
            <div className="chat-wrapper d-lg-flex">                            
                <div className="chat-leftsidebar me-lg-1 ms-lg-0" style={{...styleMessages}}>
                    <div className="tab-content">
                        <div className="tab-pane fade active show" id="pills-chat" role="tabpanel"
                            aria-labelledby="pills-chat-tab">
                            <div>
                                <div className="px-4 pt-4">
                                    <h4 className="mb-4">{this.props.t("Chats")}</h4>
                                    <div className="search-box chat-search-box">
                                        <div className="input-group mb-3 rounded-3">
                                            <span
                                                className="input-group-text bg-secondary border-secondary text-light pe-1 ps-3"
                                                id="basic-addon1">
                                                <i className="fas fa-search search-icon font-size-18"></i>
                                            </span>
                                            <input type="text"
                                                className="form-control bg-secondary text-light border-secondary"
                                                aria-describedby="basic-addon1" value={this.state.searchTextValue ? this.state.searchTextValue : ""} onChange={this.changeTextValue}  />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-2">
                                    <h5 className="mb-3 px-3 font-size-16">{this.props.t("Recent")}</h5>
                                    <div className="chat-message-list sidebar-scroll" ref={this.scrollDiv} onScroll={this.onMainScroll}>
                                        <ul className="list-unstyled chat-list chat-user-list">
                                            {
                                                this.state.messages.length > 0 ?
                                                    this.state.messages.map(message => {
                                                        let type = "m"
                                                        if(message.resource_id != this.props.pageData.loggedInUserDetails.user_id){
                                                            type = "r"
                                                        }
                                                        return (
                                                            <li className={`${parseInt(message.is_read) == 0 && message.last_user_id != this.props.pageData.loggedInUserDetails.user_id ? "unread" : ""}${this.state.id == message.message_id ? " active" : ""}`} key={message.message_id}> 
                                                                <a href={`/messages/${message.message_id}`} onClick={(e) => {
                                                                    e.preventDefault();
                                                                    this.pushTab(message.message_id)
                                                                }}> 
                                                                    <div className="d-flex">
                                                                        <div className="chat-user-img online align-self-center me-3 ms-0">
                                                                            <img src={this.props.pageData.imageSuffix+message[type+"avtar"]}
                                                                                className="rounded-circle avatar-xs" alt={message[type+"displayname"]} />
                                                                                
                                                                        </div>
                                                                        <div className="flex-1 overflow-hidden">
                                                                            <h5 className="text-truncate font-size-15 mb-1">
                                                                            <span className="ChatUserName d-inline-flex align-items-center">
                                                                                {
                                                                                    message[type+"displayname"]
                                                                                }
                                                                                {
                                                                                    parseInt(message[type+"verified"]) == 1 ?
                                                                                        <span className="verifiedUser" title={this.props.t("verified")}><span className="material-icons" data-icon="check"></span></span>
                                                                                    : null
                                                                                }
                                                                                </span>
                                                                            </h5>
                                                                            <p className="chat-user-message text-truncate mb-0">
                                                                                {
                                                                                    message.last_user_id == this.props.pageData.loggedInUserDetails.user_id && message.message.trim() != "" ? 
                                                                                        this.props.t("You: ")
                                                                                    :null
                                                                                }
                                                                                {
                                                                                    message.message
                                                                                }
                                                                            </p>
                                                                            
                                                                        </div>
                                                                        <div className="font-size-11">
                                                                            <Timeago {...this.props}>{message.last_message_date}</Timeago>
                                                                            {
                                                                                message.last_user_id == this.props.pageData.loggedInUserDetails.user_id && parseInt(message.seen) == 1 ? 
                                                                                <div className="seen-img">
                                                                                    <img src={this.props.pageData.imageSuffix+message[type+"avtar"]} />
                                                                                </div>
                                                                                : null
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                :
                                                !this.state.loading ? 
                                                    <div className="no-content">
                                                        {this.props.t("No users found.")}
                                                    </div>
                                                : null
                                            }
                                            {
                                                this.state.loading ? 
                                                    <Loader loading={true} />
                                                : null
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="user-chat w-100 overflow-hidden" style={{...displayChats}}>
                    <div className="d-lg-flex">
                        {
                            this.props.appViewWidth < 992 ? 
                            <a href="#" className="back-messages" onClick={(e) => {
                                e.preventDefault();
                                this.setState({id:null,localUpdate:true});
                            }}>
                                <i className="fa fa-arrow-left" aria-hidden="true"></i>{
                                    this.props.t("Back to messages")
                                }
                            </a>
                            : null
                        }
                        {
                            this.state.id ? 
                        <Chat {...this.props} newChat={this.newChat} id={this.state.id} message={this.state.openMessage} chats={this.state.chatMessages ? this.state.chatMessages : []} />
                        : <div className="no-content">
                            {this.props.t("No messages were found.")}
                          </div>
                        }
                    </div>
                </div>
            </div>
        )
    }



}

export default Messages