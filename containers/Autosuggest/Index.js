// server.autosuggest.js
import React from 'react';
import Autosuggest from 'react-autosuggest';

class ServerAutoSuggest extends React.Component {
    constructor(props) {
        super(props);

        //Define state for value and suggestion collection
        this.state = {
            id:props.id ? props.id : "",
            value: props.value ? props.value : "",
            suggestions: props.suggestionValue ? props.suggestionValue : []
        };
        this.department = []
    }

    // Filter logic
    getSuggestions = async (value) => {
        const inputValue = value.trim().toLowerCase();
        let response = await fetch(this.props.url+"?s="+inputValue);
        let data = await response.json()
        return data;
    };

    // Trigger suggestions
    getSuggestionValue = suggestion => {
        this.setState({
            id: suggestion.title
        });
        this.props.setAutosuggestId(this.props.keyValue == "job" ? suggestion : suggestion.cast_crew_member_id,this.props.keyValue);
        return suggestion.title;
    }
    getValuesDepartment = (value) => {
        let values = []
        this.department.forEach(job => {
            if((job.title.toLowerCase()).indexOf(value.toLowerCase()) > -1){
                values.push(job)
            }
        })
        return values;
    }
    getDepartmentData = async (value) => {
        if(this.department.length > 0){
            return this.getValuesDepartment(value);
        }
        this.props.departmentJob.map(item => {
            item.jobs.forEach(job => {
                let itemObj = {}
                itemObj.department = item.department
                itemObj.title = job
                this.department.push(itemObj);
            });
        })

        return this.getValuesDepartment(value);
    }
    // Render Each Option
    renderSuggestion = suggestion => (
        !this.props.departmentJob ?
        <span className="sugg-option">
            <span className="icon-wrap"><img src={(this.props.imageSuffix && suggestion.image.indexOf("https://") < 0 && suggestion.image.indexOf("http://") < 0 ? this.props.imageSuffix : "")+suggestion.image} /></span>
            <span className="name">
                {suggestion.title}
            </span>
        </span>
        :
        <span className="sugg-option-department">
            <span className="name">
            {this.props.t("Job: ")}{suggestion.title}
            </span>
            <span className="department">
                {this.props.t("Department: ")}{suggestion.department}
            </span>
        </span>
    );

    // OnChange event handler
    onChange = (event, { newValue }) => {
        this.setState({
            value: newValue
        });
    };

    // Suggestion rerender when user types
    onSuggestionsFetchRequested = ({ value }) => {
        !this.props.departmentJob ?
            this.getSuggestions(value)
                .then(data => {
                    if (data.error) {
                        this.setState({
                            suggestions: []
                        });
                    } else {
                        this.setState({
                            suggestions: data.result
                        });
                    }
                })
        :
        this.getDepartmentData(value)
            .then(data => {
                this.setState({
                    suggestions: data
                });
            })
    };

    // Triggered on clear
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    render() {
        const { value, suggestions } = this.state;

        // Option props
        const inputProps = {
            placeholder: this.props.t(this.props.placeholder),
            value,
            onChange: this.onChange
        };

        // Adding AutoSuggest component
        return (
            <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={inputProps}
            />
        );
    }
}

export default ServerAutoSuggest;