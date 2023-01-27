import React, { Component } from "react"
import Form from '../../../components/DynamicForm/Index'
import Validator from '../../../validators';
import axios from "../../../axios-orders"

class AddImage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            season_id:props.season_id,
            image:props.image
        }
        this.empty = true
    }
    
    onSubmit = model => {
        if (this.state.submitting) {
            return
        }

        let formData = new FormData();
        for (var key in model) {
            if(model[key] != null && typeof model[key] != "undefined")
                formData.append(key, model[key]);
        }
        
        //image        
        formData.append("season_id",this.state.season_id);
        
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        let url = '/movies/seasons/upload-image';
        
        this.setState({localUpdate:true, submitting: true, error: null });
        axios.post(url, formData, config)
            .then(response => {
                if (response.data.error) {
                    this.setState({localUpdate:true, error: response.data.error, submitting: false });
                } else {
                    this.props.closeAddImageCreate({...response.data.item},response.data.message)
                }
            }).catch(err => {
                this.setState({localUpdate:true, submitting: false, error: err });
            });

    }
    render(){


        let validator = [{
            key: "image",
            validations: [
                {
                    "validator": Validator.required,
                    "message": "Upload Image is required field."
                }
            ]
        }]
        
        let imageUrl = null
        if(this.state.image && this.state.image){
            if(this.state.image.indexOf("http://") == 0 || this.state.image.indexOf("https://") == 0){
                imageUrl = this.state.image
            }else{
                imageUrl = this.props.pageData.imageSuffix+this.state.image
            }
        }

        let formFields = [            
            { key: "image", label: "Upload Image", type: "file", value: this.state.image ? this.state.image : "" }
        ]


        
        
        let defaultValues = {}
        if(this.empty){
            formFields.forEach((elem) => {
                if (elem.value)
                    defaultValues[elem.key] = elem.value
            })
        }
        var empty = false
        if(this.empty){
            empty = true
            this.empty = false
        }
        return (
            <Form
                className="form"
                defaultValues={defaultValues}
                {...this.props}
                empty={empty}
                generalError={this.state.error}
                validators={validator}
                submitText={!this.state.submitting ? "Submit" : "Submitting..."}
                model={formFields}
                onSubmit={model => {
                    this.onSubmit(model);
                }}
            />
        )

        
    }

}


export default AddImage