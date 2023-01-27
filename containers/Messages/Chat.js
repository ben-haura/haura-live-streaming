import React from "react"
import Timeago from "../Common/Timeago"
import axios from "../../axios-orders"
import Loader from "../LoadMore/Index"
import Link from "../../components/Link/index";
import dynamic from 'next/dynamic'
import swal from "sweetalert"
const Picker = dynamic(() => import("emoji-picker-react"), {
    ssr: false
});

class Chat extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            showEmoji:false,
            textValue:"",
            chats:[],
            pagging:false,
            page:1,
            id:props.pageData.id,
            loading:true,
            message:props.message,
            selectedFile:null,
            submitting:false,
            minimize:props.minimize,
            chatIndex:props.chatIndex
        }
        this.textareaInput = React.createRef();
        this.inputFile = React.createRef();
        this.scrollDiv = React.createRef();
        this.emojiContainer = React.createRef();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || (nextProps.i18n && nextProps.i18n.language != $("html").attr("lang"))){
            return null;
        }
        if (prevState.localUpdate){
            return {...prevState,localUpdate:false}
        }else if (nextProps.id != prevState.id){
            return {
                showEmoji:false,
                textValue:"",
                chats:[],
                pagging:false,
                page:1,
                id:nextProps.id,
                loading:true,
                message:nextProps.message,
                selectedFile:null,
                submitting:false,
                minimize:nextProps.minimize,
                chatIndex:nextProps.chatIndex
            }
        }
        else if(nextProps.minimize != prevState.minimize){
            return {
                ...prevState,
                minimize:nextProps.minimize
            }
        }
        else if(nextProps.chatIndex != prevState.chatIndex){
            return {
                ...prevState,
                chatIndex:nextProps.chatIndex
            }
        }
        else{
            return null
        }
    }
    componentDidUpdate(prevProps,prevState){
        if(this.props.id != prevProps.id ){
            this.loadNewChat();
        }
    }
    componentWillUnmount() { 
        document.removeEventListener("click", this.handleClickOutside, false); 
    }
    handleClickOutside = (e) => {
        if(!this.emojiContainer.contains(e.target)) {
            // the click happened in the component
            // code to handle the submit button
            // submit();
            this.setState({localUpdate:true,showEmoji:false})
        } 
    }
    componentDidMount() {
        document.addEventListener("click", this.handleClickOutside, false);
        this.loadNewChat();
        this.props.socket.on('chatMessageDelete', data => {
            let id = data.id
            if(parseInt(data.message_id) == parseInt(this.state.id)){
                const itemIndex = this.getItemIndex(id)
                if (itemIndex > -1) {
                    const chats = [...this.state.chats]
                    chats.splice(itemIndex, 1);
                    if(this.props.newChat){
                        this.props.newChat(chats,this.state.id)
                    }
                    this.setState({localUpdate:true, chats: chats })
                }
            }else{
                if(this.props.newChat){
                    this.props.newChat("delete",this.state.id,id);
                }
            }
        })
        this.props.socket.on('chatMessageCreate', data => {
            let chat = data.chat
            
            if(parseInt(chat.message_id) == parseInt(this.state.id)){
                this.props.socket.emit('readChat', {id:this.props.pageData.loggedInUserDetails.user_id,message_id:this.state.id})
                if(parseInt(chat.chat_user_id) != parseInt(this.props.pageData.loggedInUserDetails.user_id)){
                    chat.is_read = 1;
                    chat.seen = 1;
                }
                let chats = [...this.state.chats]
                chats.push(chat)
                this.setState({localUpdate:true, chats: chats },() => {
                    let _ = this
                    setTimeout(() => {
                        if(_.scrollDiv.current)
                        _.scrollDiv.current.scrollTop = _.scrollDiv.current.scrollHeight;
                    },500) 
                })
                if(this.props.newChat){
                    this.props.newChat(chats,chat.message_id)
                }
            }else{
                if(this.props.newChat){
                    this.props.newChat("create",chat.message_id,chat)
                }
            }
        })
    }

    getItemIndex(item_id) {
        const chats = [...this.state.chats];
        const itemIndex = chats.findIndex(p => p["messages_text_id"] == item_id);
        return itemIndex;
    }
    loadNewChat = () => {
        this.loadMoreData("new")
    }
    onEmojiClick = (e,data) => {
        const { selectionStart, selectionEnd } = this.textareaInput.current
        let value = this.state.textValue ? this.state.textValue : ""
        // replace selected text with clicked emoji
        const newVal = value.slice(0, selectionStart) + data.emoji + value.slice(selectionEnd)
        this.setState({localUpdate:true,textValue:newVal},() => {
            this.textareaInput.current.focus();
            this.textareaInput.current.selectionEnd = this.textareaInput.current.selectionStart =  selectionEnd + 2
        })
    }
    
    loadMoreData = (type) => {
        if(this.state.loading && !type){
            return;
        }
        if(type == "new"){
            this.props.socket.emit('readChat', {id:this.props.pageData.loggedInUserDetails.user_id,message_id:this.state.id})
        }
        if(!type)
            this.setState({localUpdate:true, loading: true })
        let formData = new FormData();
        formData.append('page', this.state.page)
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        if(this.state.chats.length > 0){
            formData.append("min_id",this.state.chats[0].messages_text_id)
        }
        let url = `/messages/${this.state.id}`;

        axios.post(url, formData, config)
            .then(response => {
                if (response.data.chats) {
                    let firstLoad = [...this.state.chats]
                    let pagging = response.data.pagging
                    let chats = [ ...response.data.chats,...this.state.chats]
                    if(this.props.newChat){
                        this.props.newChat(chats,this.state.id)
                    }
                    this.setState({localUpdate:true, page: this.state.page + 1, pagging: pagging, chats: chats, loading: false },() => {
                        let _ = this
                        if(firstLoad.length == 0)
                            setTimeout(() => {
                                if(_.scrollDiv.current)
                                _.scrollDiv.current.scrollTop = _.scrollDiv.current.scrollHeight;
                            },500)                    
                    })
                } else {
                    this.setState({localUpdate:true, loading: false })
                }
            }).catch(() => {
                this.setState({localUpdate:true, loading: false })
            });
    }
    onMainScroll = () => {
        if (this.scrollDiv.current) {
            const { scrollTop} = this.scrollDiv.current;
            if (scrollTop < 100) {
              if(this.state.pagging){
                  this.loadMoreData();
              }
            }
        }
    }
    openImage = (url,e) => {
        e.preventDefault()
        if(typeof lightboxJquery == "undefined"){
            return
        }
        let isS3 = true
        if (url) {
            const splitVal = url.split('/')
            if (splitVal[0] == "http:" || splitVal[0] == "https:") {
                isS3 = false
            }
        }
        let items = []
        items.push({
            src:  (isS3 ? this.props.pageData.imageSuffix : "") + url,
            title: "",
            description: "",
            type: 'image'
        });
        lightboxJquery.magnificPopup.open({
            items:items,
            gallery: {
              enabled: true 
            }
          },0);
    }
    deleteMessage = (id) => {
        let formData = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        formData.append("id",id)
        
        let url = `/message/delete`;

        axios.post(url, formData, config)
            .then(response => {
                if(response){

                }
            })
        
    }
    selectedFile = (e) => {
        var url =  e.target.value;
        var file = e.target.files[0]
        var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
        this.inputFile.current.value = ""
        let type = ""
        if (file && (ext == "png" || ext == "jpeg" || ext == "jpg" || ext == 'PNG' || ext == 'JPEG' || ext == 'JPG')) {
            type = "image"
        }else if(file && ext == "mp4"){
            type = "video"
        }else{
            return;
        }
        this.setState({localUpdate:true,selectedFile:file,selectedFileType:type})
    }
    enterHit = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault()
            this.submitForm()
            return false
        }else{
            return true
        }
    }
    submitForm = () => {
        if(this.state.selectedFile || this.state.textValue){
            this.setState({localUpdate:true,submitting:true})
            let formData = new FormData();
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };
            formData.append("message",this.state.textValue)
            formData.append("message_id",this.state.id)
            if(this.state.selectedFile){
                formData.append("upload", this.state.selectedFile);
            }
            let url = `/message/create`;
            axios.post(url, formData, config)
                .then(response => {
                    if(response){
                        this.setState({localUpdate:true,textValue:"",showEmoji:false,selectedFile:null})
                    }
                })
        }
    }
    clearChat = () => {
        let message = this.props.t("Are you sure that you want to delete the conversation?")
        swal({
            title: this.props.t("Are you sure?"),
            text: message,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    const formData = new FormData()
                    let url = "/messages/delete"
                    formData.append('message_id', this.state.id)
                    axios.post(url, formData)
                        .then(response => {
                        }).catch(err => {
                            swal("Error", this.props.t("Something went wrong, please try again later"), "error");
                        });
                    //delete
                } else {

                }
            });
    }
    render() {
        let type = "m"
        if(this.state.message && this.state.message.resource_id != this.props.pageData.loggedInUserDetails.user_id){
            type = "r"
        }

        let style = {}
        if(this.props.fromSmallChat && this.state.chatIndex > 0){
            style = {right: (parseInt(this.state.chatIndex) * 360)+"px"}
        }

        var createObjectURL = (URL || webkitURL || {}).createObjectURL || function () { };
        return (
            <div style={{...style}} className={`${this.props.fromSmallChat ? "w-100 overflow-hidden chatBoxWrap" : "w-100 overflow-hidden position-relative"}${this.state.minimize == 1 ? " minimize" : ""}`}>
                <div className="p-3 p-lg-4 border-bottom user-chat-topbar">
                    <div className="row align-items-center">
                        <div className="col-sm-12 col-12">
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="me-3 ms-0 ml5">
                                    <Link href="/member" customParam={`id=${this.state.message[`${type}username`]}`} as={`/${this.state.message[`${type}username`]}`}>
                                        <a>
                                            <img src={this.props.pageData.imageSuffix+this.state.message[`${type}avtar`]} className="rounded-circle avatar-xs" alt={this.state.message[`${type}displayname`]} />
                                        </a>
                                    </Link>
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h5 className="font-size-16 mb-0 text-truncate">
                                        <span className="ChatUserName d-inline-flex align-items-center">
                                        <Link href="/member" customParam={`id=${this.state.message[`${type}username`]}`} as={`/${this.state.message[`${type}username`]}`}>
                                            <a className="text-reset user-profile-show">
                                                {this.state.message[`${type}displayname`]}
                                                {
                                                    parseInt(this.state.message[`${type}verified`]) == 1 ? 
                                                        <span className="verifiedUser" title={this.props.t("verified")}><span className="material-icons" data-icon="check"></span></span>
                                                    : null
                                                }
                                            </a>
                                        </Link>
                                        
                                        </span>
                                    </h5>
                                </div>
                                <div className="pull-right chatTopIconActn">
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        this.clearChat();
                                    }}>
                                        <i className="fas fa-trash"></i>
                                    </a>
                                    {
                                        this.props.fromSmallChat ? 
                                        <React.Fragment>                                            
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.props.minimizeChat(this.state.id);
                                            }}>
                                                {
                                                    this.state.minimize ? 
                                                        <i className="fas fa-expand"></i>
                                                    :
                                                        <i className="fas fa-compress"></i>
                                                }
                                            </a>
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.props.closeChat(this.state.id);
                                            }}>
                                                <i className="fas fa-times"></i>
                                                
                                            </a>
                                        </React.Fragment>
                                        : null
                                    }
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="chat-conversation p-3 p-lg-4 sidebar-scroll" ref={this.scrollDiv} onScroll={this.onMainScroll}>
                    <div>
                        <ul className="list-unstyled mb-0">

                            {
                                this.state.loading ? 
                                    <Loader loading={true} />
                                : null
                            }
                            {
                                this.state.chats.length > 0 ? 
                                    this.state.chats.map(chat => {
                                        return (
                                            <li key={chat.messages_text_id} className={`${parseInt(chat.chat_user_id) == this.props.pageData.loggedInUserDetails.user_id ? "right" : ""}`}>
                                                <div className="conversation-list">
                                                    <div className="chat-avatar">
                                                        <img src={this.props.pageData.imageSuffix+chat.avtar}
                                                            alt={chat.displayname} />
                                                    </div>
                                                    <div className="user-chat-content">
                                                        <div className="ctext-wrap">
                                                            <div className="ctext-wrap-content">
                                                            
                                                            {
                                                                chat.image || chat.video ? 
                                                                    <ul className="list-inline message-img  mb-0">
                                                                        {
                                                                            chat.image ? 
                                                                                <li
                                                                                    className="list-inline-item message-img-list me-2 ms-0">
                                                                                    <div>
                                                                                        <a className="popup-img d-inline-block m-1"
                                                                                            href="#" onClick={(e) => {this.openImage(this.props.pageData.imageSuffix+chat.image,e)}}>
                                                                                            <img src={this.props.pageData.imageSuffix+chat.image}
                                                                                                className="rounded border" />
                                                                                        </a>
                                                                                    </div>
                                                                                
                                                                                </li>
                                                                        : null
                                                                        }
                                                                        {
                                                                            chat.video ?
                                                                                <li
                                                                                    className="list-inline-item message-img-list">
                                                                                    <div>
                                                                                        <a className="popup-img d-inline-block m-1"
                                                                                            href="#" onClick={(e) => e.preventDefault()}>
                                                                                                <video width="400" controls className="rounded border">
                                                                                                    <source src={chat.video} type="video/mp4" />
                                                                                                    {this.props.t("Your browser does not support HTML video.")}
                                                                                                </video>
                                                                                            
                                                                                        </a>
                                                                                    </div>
                                                                                
                                                                                </li>
                                                                        :   null
                                                                        }
                                                                    </ul>
                                                                    : null
                                                                }
                                                                <p className="mb-0">
                                                                    {chat.message}
                                                                </p>
                                                                <p className="chat-time mb-0">
                                                                    <span className="align-middle">
                                                                        <Timeago {...this.props}>{chat.creation_date}</Timeago>
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            {
                                                                chat.chat_user_id == this.props.pageData.loggedInUserDetails.user_id ? 
                                                                    <div className="dropdown align-self-start dropup">
                                                                        <a className="dropdown-toggle" href="#"
                                                                            role="button" data-bs-toggle="dropdown"
                                                                            aria-haspopup="true" aria-expanded="false">
                                                                            <i className="fas fa-ellipsis-v"></i>
                                                                        </a>
                                                                        <div className="dropdown-menu">
                                                                            <a className="dropdown-item" href="#" onClick={(e) => {
                                                                                e.preventDefault();
                                                                                this.deleteMessage(chat.messages_text_id);
                                                                            }}>{this.props.t("Remove Message")} <i
                                                                                    className="ri-delete-bin-line float-end text-muted"></i></a>
                                                                        </div>
                                                                    </div>
                                                            : null
                                                            }
                                                        </div>
                                                        <div className="conversation-name ChatUserName">
                                                            {chat.displayname}
                                                            {
                                                                parseInt(chat[`verified`]) == 1 ? 
                                                                    <span className="verifiedUser" title={this.props.t("verified")}><span className="material-icons" data-icon="check"></span></span>
                                                                : null
                                                            }    
                                                        </div>
                                                    </div>

                                                </div>
                                            </li>
                                        )
                                    })
                                :
                                !this.state.loading ?
                                <div className="no-content">
                                    {this.props.t("No messages were found, say Hello!")}
                                </div>
                                : null
                            }
                        </ul>
                    </div>
                </div>
                <div className="chat-input-section p-3 p-lg-4 border-top mb-0">
                    <div className="row g-0">
                        <div className="col">
                            <input type="text"
                                ref={this.textareaInput}
                                className="form-control chat-input-field form-control-lg bg-light border-light"
                                value={this.state.textValue ? this.state.textValue : ""}
                                onKeyDown={(e) => this.enterHit(e) }
                                onChange={(e) => {
                                    this.setState({localUpdate:true,textValue:e.target.value})
                                }}
                                placeholder={this.props.t("Enter Message...")} />
                        </div>
                        <div className="col-auto">
                        {
                            this.state.selectedFile && this.state.selectedFileType == "image" ? 
                        <div className="preview chatPreviewImg">
                            <div className="previewUploadImg">
                                <div>
                                    <img src={this.state.selectedFile ? (typeof this.state.selectedFile == "string" ? this.state.selectedFile : createObjectURL(this.state.selectedFile)) : null} alt={this.props.t("Image Preview")} />
                                    <span className="close closePreviewImage" onClick={(e) => {
                                        this.setState({localUpdate:true,selectedFile:null})
                                    }}>x</span>
                                </div>
                            </div>
                        </div>
                        : this.state.selectedFile && this.state.selectedFileType == "video" ? 
                            <div className="preview">
                                <div className="previewUploadImg">
                                    <div>
                                    <video width="400" controls className="rounded border">
                                        <source src={createObjectURL(this.state.selectedFile)} type="video/mp4" />
                                        {this.props.t("Your browser does not support HTML video.")}
                                    </video>
                                        <span className="close closePreviewImage" onClick={(e) => {
                                            this.setState({localUpdate:true,selectedFile:null})
                                        }}>x</span>
                                    </div>
                                </div>
                            </div>
                        :null
                        }
                            <div className="chat-input-links ms-md-2 me-md-0">
                                <ul className="list-inline mb-0">
                                    <li className="list-inline-item emojiBtn" ref={node => this.emojiContainer = node}>
                                        {
                                            this.state.showEmoji ? 
                                            <Picker
                                                
                                                onEmojiClick={this.onEmojiClick}
                                                disableAutoFocus={true}
                                                skinTone={"1f3ff"}
                                                native
                                                groupNames={{
                                                    smileys_people: this.props.t("people"),
                                                    animals_nature: this.props.t('animals & nature'),
                                                    food_drink: this.props.t('food & drink'),
                                                    travel_places: this.props.t('travel & places'),
                                                    activities: this.props.t('activities'),
                                                    objects: this.props.t('objects'),
                                                    symbols: this.props.t('symbols'),
                                                    flags: this.props.t('flags'),
                                                    recently_used: this.props.t('Recently Used'),
                                                    }}
                                            />
                                            : null
                                        }
                                        <button type="button"
                                            title={this.props.t("Emojis")}
                                            className="btn btn-link text-decoration-none font-size-16 btn-lg" onClick={(e) => {
                                                this.setState({localUpdate:true,showEmoji:!this.state.showEmoji})
                                            }}>
                                            <i className="fas fa-surprise"></i>
                                        </button>
                                    </li>
                                    <li className="list-inline-item attachBtn" data-bs-toggle="tooltip"
                                        data-bs-placement="top" title={this.props.t("Attached image")} >
                                        <button type="button"
                                            onClick={(e) => {
                                                this.inputFile.current.click();
                                            }}
                                            className="btn btn-link text-decoration-none font-size-16 btn-lg ">
                                            <i className="fas fa-paperclip"></i>
                                            <input type="file" style={{display:"none"}} onChange={this.selectedFile} name="file" accept="image/*,video/mp4" ref={this.inputFile} />
                                        </button>
                                    </li>
                                    <li className="list-inline-item sendBtn">
                                        <button type="button"
                                            onClick={(e) => {
                                                this.submitForm();
                                            }}
                                            title={this.props.t("Send message")}
                                            className="btn font-size-16 btn-lg chat-send">
                                            <i className="fas fa-paper-plane"></i>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        )
    }

}


export default Chat