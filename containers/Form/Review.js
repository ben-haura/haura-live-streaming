import React, { Component } from "react"
import Form from '../../components/DynamicForm/Index'
import Validator from '../../validators';
import axios from "../../axios-orders"

class Review extends Component {
    constructor(props) {
        super(props)
        this.state = {
            title: "",
            editItem: props.editItem,
            success: false,
            error: null,
            submitting: false,
            movie_id:props.movie_id
        }
        this.myRef = React.createRef();
    }
    
    onSubmit = async model => {
        if (this.state.submitting) {
            return
        }
        this.setState({ submitting: true, error: null });
        let formData = new FormData();
        for (var key in model) {
            if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movie/review/create';
        if (this.state.editItem) {
            formData.append("review_id", this.state.editItem.review_id)
        } 
        formData.append("movie_id", this.state.movie_id)
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    window.scrollTo(0, this.myRef.current.offsetTop);
                    this.setState({ error: response.data.error, submitting: false });
                } else {
                   this.props.closePopup();
                }
            }).catch(err => {
                this.setState({ submitting: false, error: err });
            });
    };

   
    render() {
        
        let validator = []

        validator.push({
            key: "rating",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Rating is required field"
                }
            ]
        },
        {
            key: "description",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Description is required field"
                }
            ]
        })
        
        let formFields = []
        
        formFields.push(
            { key: "rating", type:"rating" ,label: "Rating", value: this.state.editItem ? parseInt(this.state.editItem.rating) : 0,isRequired:true },
            { key: "description", label: "Description", type: "textarea", value: this.state.editItem ? this.state.editItem.description : "",isRequired:true },
        )            
        
        let defaultValues = {}
        if (!this.firstLoaded) {
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
            })
            this.firstLoaded = true
        }
        return (
            <React.Fragment>
                {
                    <div ref={this.myRef}>
                        <Form
                            className="form"
                            title={this.state.title}
                            defaultValues={defaultValues}
                            validators={validator}
                            {...this.props}
                            generalError={this.state.error}
                            submitText={!this.state.submitting ? "Submit" : "Submit..."}
                            model={formFields}
                            onSubmit={model => {
                                this.onSubmit(model);
                            }}
                        />
                    </div>
                }
            </React.Fragment>
        )
    }
}




export default Review