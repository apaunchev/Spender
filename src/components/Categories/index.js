import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../Blankslate";
import { withAuthorization } from "../Session";
import { withAuthUser } from "../Session/context";
import Loading from "../Loading";

class Categories extends Component {
  state = {
    loading: false,
    categories: []
  };

  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories() {
    const { firebase, authUser } = this.props;

    this.setState({ loading: true });

    this.unsubscribeCategories = firebase
      .categories()
      .where("userId", "==", authUser.uid)
      .orderBy("name")
      .onSnapshot(snapshot => {
        if (snapshot.size) {
          let categories = [];
          snapshot.forEach(doc =>
            categories.push({ ...doc.data(), id: doc.id })
          );
          this.setState({ categories });
        } else {
          this.setState({ categories: [] });
        }

        this.setState({ loading: false });
      });
  }

  componentWillUnmount() {
    this.unsubscribeCategories();
  }

  render() {
    const { loading, categories } = this.state;

    if (loading) {
      return <Loading isCenter={true} />;
    }

    return (
      <main>
        <header className="mb3">
          <h1 className="mb0">Categories</h1>
          <nav className="nav mb3">
            <Link to={{ pathname: "/new/category" }}>New category</Link>
          </nav>
        </header>
        {categories.length ? (
          <ol className="category-list">
            {categories.map(c => (
              <li className="category" key={c.id}>
                <Link
                  to={{
                    pathname: `/category/${c.id}`,
                    state: { category: c }
                  }}
                >
                  <div className="category-title flex">
                    <span
                      className="color-pill"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <Blankslate
            title="Nothing to show"
            description="Looks like you have not added any categories."
          />
        )}
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthUser,
  withAuthorization(condition)
)(Categories);
