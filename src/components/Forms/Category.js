import { getUnixTime } from "date-fns";
import React, { Component } from "react";
import { CirclePicker } from "react-color";
import CATEGORY_NAMES from "../../constants/categories";
import { withFirebase } from "../Firebase";
import { withAuthUser } from "../Session";
import { renderDatalistFromArray } from "../utils";
import { compose } from "recompose";
import Loading from "../Loading";

class Category extends Component {
  state = {
    loading: false,
    category: {
      name: "",
      color: "#000000"
    },
    ...this.props.location.state
  };

  componentDidMount() {
    const {
      match: {
        params: { id }
      },
      firebase
    } = this.props;
    const { category } = this.state;

    if (id && !category.name) {
      this.setState({ loading: true });

      // read
      firebase
        .category(id)
        .get()
        .then(doc => {
          if (doc.exists) {
            const { name, color } = doc.data();

            this.setState({
              ...this.state,
              category: {
                ...this.state.category,
                name,
                color
              }
            });
          }

          this.setState({ loading: false });
        })
        .catch(error => console.error(error));
    }
  }

  onInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      category: {
        ...this.state.category,
        [name]: value
      }
    });
  };

  onSubmit = event => {
    event.preventDefault();

    const {
      category: { name, color }
    } = this.state;
    const {
      match: {
        params: { id }
      },
      history,
      firebase,
      authUser
    } = this.props;

    if (!id) {
      // create
      firebase.categories().add({
        name,
        createdAt: getUnixTime(new Date()),
        color,
        userId: authUser.uid
      });
    } else {
      // update
      firebase.category(id).set(
        {
          name,
          color
        },
        { merge: true }
      );
    }

    history.push("/categories");
  };

  onDelete = (event, id) => {
    event.preventDefault();

    const { firebase, history } = this.props;

    if (window.confirm("Are you sure you want to delete this category?")) {
      // delete
      firebase.category(id).delete();
    }

    history.push("/categories");
  };

  render() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    const { loading, category } = this.state;

    if (loading) {
      return <Loading isCenter={true} />;
    }

    return (
      <main>
        <header className="mb3">
          <h1>{!id ? "New" : "Edit"} category</h1>
        </header>
        <form className="form" onSubmit={this.onSubmit}>
          <div className="form-input">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              list="categories"
              placeholder="Groceries"
              value={category.name}
              onChange={this.onInputChange}
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="color">Color</label>
            <CirclePicker
              name="color"
              color={category.color}
              onChangeComplete={color =>
                this.setState({
                  category: { ...this.state.category, color: color.hex }
                })
              }
            />
          </div>
          <div className="form-input">
            <input
              type="submit"
              className="button button--primary"
              value="Save"
            />
          </div>
          {id && (
            <p className="danger">
              <a href="/" onClick={e => this.onDelete(e, id)}>
                Delete
              </a>
            </p>
          )}
        </form>
        {renderDatalistFromArray(CATEGORY_NAMES, "categories")}
      </main>
    );
  }
}

export default compose(
  withAuthUser,
  withFirebase
)(Category);
