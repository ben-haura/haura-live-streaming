import React from "react"
import Category from "./Category"
import dynamic from 'next/dynamic'

const Blog = dynamic(() => import("../Blog/CarouselBlogs"), {
    ssr: false
});
const Video = dynamic(() => import("../HomePage/TopVideos"), {
    ssr: false
});
const Channel = dynamic(() => import("../Channel/CarouselChannel"), {
    ssr: false
});

import Translate from "../../components/Translate/Index"


class Browse extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type: props.pageData.type,
            items: props.pageData.items,
            categories: props.pageData.category
        }
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if(typeof window == "undefined" || nextProps.i18n.language != $("html").attr("lang")){
            return null;
        }
        if(prevState.localUpdate){
            return {...prevState,localUpdate:false}
        } else if (nextProps.pageData.type && nextProps.pageData.type != prevState.type) {
            return { type: nextProps.pageData.type,items:nextProps.pageData.items,categories:nextProps.pageData.category }
        } else{
            return null
        }
    }
    
    getItemIndex(item_id) {
        const items = [...this.state.items];

        const itemIndex = items.findIndex(p => p[this.state.type + "_id"] == item_id);
        return itemIndex;
    }


    render() {
        let contents = null
        if (this.state.items && this.state.items.length) {
            if (this.state.type == "video") { 
                contents = <React.Fragment>
                            <div className="container"><div className="gridContainer gridVideo"><div className="gridColumn"><hr className="horline" /></div></div></div>
                            <Video  {...this.props} title={Translate(this.props,"Popular Videos")} videos={this.state.items} />
                          </React.Fragment>
            } else if (this.state.type == "channel") {
                contents = <React.Fragment>
                                <div className="container"><div className="gridContainer gridChannel"><div className="gridColumn"><hr className="horline" /></div></div></div>
                                <Channel {...this.props} title={Translate(this.props,"Popular Channels")} channels={this.state.items} />
                            </React.Fragment>
            } else if (this.state.type == "blog") {
                contents = <React.Fragment>
                                <div className="container"><div className="gridContainer gridBlog"><div className="gridColumn"><hr className="horline" /></div></div></div>
                                <Blog {...this.props}  title={Translate(this.props,"Popular Blogs")} blogs={this.state.items} />
                            </React.Fragment>
            }
        }
        return (
            <React.Fragment>
                    <div className="category-grid-wrap top30p">
                        <div className="container">
                            <div className="gridContainer gridCategory">
                                {
                                    this.state.categories.map(cat => {
                                        return (
                                                <Category  key={cat.category_id} key={cat.category_id} {...this.props} type={this.state.type} category={cat} />
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <React.Fragment>
                            {contents}
                        </React.Fragment>
                    </div>
            </React.Fragment>
        )
    }
}


export default Browse