import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import pluralize from 'pluralize';

import withTitle from '../hoc/withTitle';
import BackgroundImage from '../components/BackgroundImage';
import Jumbotron from '../components/Jumbotron';
import Banner from '../components/Banner';
import BannerBibleVerse from '../components/BannerBibleVerse';
import EventBox from '../components/EventBox';
import { fetchModelData } from '../modules/modelData';

import styles from './Home.css';
import templateStyles from '../templates/MainTemplate.css';

class Home extends Component {
  componentDidMount() {
    this.props.fetchData();
  }

  render() {
    const titleSection = 
      <Jumbotron style={{ height: '100vh' }}>
          <BackgroundImage
            src="/static/images/home/philly.jpg"
            backgroundSize="cover"
            backgroundPosition="top left"
            backgroundAttachment="local"
          />
          <div
            className={styles.title}
            style={{ color: 'white', top: '40%' }}
          >
            <h1 className={templateStyles.header}>
              Grace Covenant Church
            </h1>
            <div className={styles.subtitle}>
              <h3>
                Raising up Kingdom workers who are <br />
                influenced by Christ to change the world.
              </h3>
            </div>
          </div>
        </Jumbotron>

    const infoSection = 
      <div className={styles.infoSection}>
        <div className={styles.infoSectionHeader}>
          Service Location and Times
        </div>
        <div className={styles.infoSectionTimes}>
            Sunday Service: 11:15 AM <br />
            Friday Night Live: 7:30 PM
        </div>
        <div className={styles.infoSectionLocation}>
          Meyerson Hall B-1, 210 South 34th Street <br />
          Philadelphia, PA 19104
        </div>
        <a className={styles.infoSectionLink} href="/welcome">Learn More > </a>
      </div>

    const familyGroupSection = 
      <Banner src="/static/images/home/familygroup.jpg" topMargin={30}>
        <h1 className={templateStyles.header}>
          Family Group
        </h1>
        <div className={styles.subtitle}>
          <h3>
            You haven't checked out GCC if you haven't checked out our family groups.
          </h3>
          <a href="/familygroup">
            <button className={styles.infoButton}>Sign Up Here</button>
          </a>
        </div>
      </Banner>

    const eventSection = 
      <Banner src="/static/images/home/events.jpg" topMargin={20}>
        <h1 className={templateStyles.header}>
          Events
        </h1>
        <div className={styles.subtitle}>
          {this.props.data.map(eventObj => (
            <EventBox
              eventName={eventObj.title}
              eventDate={new Date(eventObj.startDate).toLocaleDateString()}
              key={eventObj._id}
            />
          ))}
        </div>
        <div className="subtitle">
          <a href="/events">
            <button className={styles.infoButton}>More Info</button>
          </a>
        </div>
      </Banner>

    return (
      <div id="home">
        <Helmet>
          <link rel="stylesheet" type="text/css" href="/public/assets/pages/Home.bundle.css" />
        </Helmet>
        {titleSection}
        {infoSection}
        {familyGroupSection}
        {eventSection}
        <BannerBibleVerse />
      </div>
    );
  }
}

Home.propTypes = {
  fetchData: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    startDate: PropTypes.string,
  })).isRequired,
};

const mapStateToProps = (state) => {
  const modelData = state.modelData[pluralize('Event')];
  return {
    data: modelData ? modelData.ids.map(id => modelData.__DB__[id]) : [],
  };
}

const mapDispatchToProps = (dispatch) => (
  {
    fetchData() {
      return dispatch(fetchModelData('Event'));
    },
  }
)

const HomePage = compose(connect(mapStateToProps, mapDispatchToProps), withTitle(), withRouter)(Home);

export default HomePage;
