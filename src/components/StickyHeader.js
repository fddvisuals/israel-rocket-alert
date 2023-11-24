import React from "react";
import PropTypes from "prop-types";
import FadeInOut from "./FadeInOut";
import FormattedAlertTime from "./FormattedAlertTime";
import { TwitterOutlined } from "@ant-design/icons";
import logo from "../logo.png";
import Util from "../util";

class StickyHeader extends React.Component {
  state = {
    shouldRefresh: false,
  };

  componentDidUpdate(prevProps) {
    if (this.props.realTimeAlert !== prevProps.realTimeAlert) {
      this.refreshAlert(this.props.realTimeAlert);
    }
  }

  refreshAlert = () => {
    this.setState({
      shouldRefresh: true,
    });
    setTimeout(() => {
      this.setState({ shouldRefresh: false });
    }, Util.REAL_TIME_ALERT_DISPLAY_DURATION);
  };

  setStickyHeaderStyle = () => {
    let cssClass = "sticky-header";
    if (this.props.showStickyHeader) {
      cssClass += " active";
    }
    if (this.props.isAlertMode) {
      cssClass += " alert-mode";
    }
    return cssClass;
  };

  render() {
    const { isAlertMode, realTimeAlert } = this.props;
    return (
      <header className={this.setStickyHeaderStyle()}>
        <div className="left-container">
          <img className="logo" src={logo} alt="" />
        </div>
        <div className="alerts">
          {isAlertMode && realTimeAlert && (
            <FadeInOut show={this.state.shouldRefresh}>
              <FormattedAlertTime timeStamp={realTimeAlert.timeStamp} />{" "}
              {realTimeAlert.englishName || realTimeAlert.name}
            </FadeInOut>
          )}
        </div>
        {this.props.twitterShareText && (
          <div className="right-container">
            <a
              href={`https://twitter.com/share?text=${this.props.twitterShareText}&url=RocketAlert.live&hashtags=RocketAlert,IsraelUnderAttack`}
              target="_blank"
              rel="noreferrer"
            >
              <TwitterOutlined style={{ fontSize: "24px", color: "white" }} />
            </a>
          </div>
        )}
      </header>
    );
  }
}

StickyHeader.propTypes = {
  showStickyHeader: PropTypes.bool,
  isAlertMode: PropTypes.bool,
  realTimeAlert: PropTypes.object,
  // Text to share on twitter. Generated in Header
  twitterShareText: PropTypes.string,
};

StickyHeader.defaultProps = {
  showStickyHeader: false,
  isAlertMode: false,
  realTimeAlert: {},
  twitterShareText: "",
};

export default StickyHeader;
