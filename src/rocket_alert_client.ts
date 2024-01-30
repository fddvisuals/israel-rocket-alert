import wretch from "wretch";
import isValid from "date-fns/isValid";
import { isoFormat } from "./date_helper";
import Util from "./util";

const SERVER_URL = "https://agg.rocketalert.live/api/v1/alerts";
const api = wretch(SERVER_URL);
const MAX_RECENT_ALERTS = 5000;

const AlertClient = {
  
  /*
   *  Gets the MAX_RECENT_ALERTS most recent alerts in the past 24 hours.
   *  Most recent alert first.
   *
   *  @param {string} from  from date, inclusive.
   *  @param {string} to    to date, inclusive.
   *  @return {object}
   */
  getMostRecentAlerts: (from: string, to: string): any => {
    if (!from || !isValid(new Date(from))) {
      return Promise.reject(new Error("Invalid Date: from"));
    }
    if (!to || !isValid(new Date(to))) {
      return Promise.reject(new Error("Invalid Date: to"));
    }
    return api
      .url("/details")
      .query({ from: isoFormat(from), to: isoFormat(to) })
      .get()
      .json()
      .then((res) => {
        if (!res.success || res.payload?.length === 0) {
          return null;
        }
        const alerts =
          res?.payload?.length > 1
            ? res.payload[0].alerts.concat(res.payload[1].alerts)
            : res.payload[0].alerts;
        return alerts.slice(-MAX_RECENT_ALERTS).reverse();
      })
      .catch((e) => {
        console.log("e", e);
      });
  },
  getRocketCountPerRegion: (from: string, to: string): any => {
  return AlertClient.getMostRecentAlerts(from, to).then((alerts: any[]) => {
    // Ensure we have alerts to process
    if (!alerts) return Promise.resolve([]);

    const rocketCounts: {[key: string]: number} = {};
    
    // Count the occurrence of each region
    alerts.forEach(alert => {
      if (!alert.areaNameEn) return;
    
      // Increment the count for this region, or initialize it to 1.
      if (rocketCounts[alert.areaNameEn]) {
        rocketCounts[alert.areaNameEn]++;
      } else {
        rocketCounts[alert.areaNameEn] = 1;
      }
    });
    
    // Convert the object into an array of tuples, sorted by count descending
    const topRocketRegions = Object.entries(rocketCounts)
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    console.log(topRocketRegions);
    return topRocketRegions;
  });
},

  /*
   *  Gets total alert count by day for the given date range
   *
   *  @param {string} from  from date, inclusive.
   *  @param {string} to    to date, inclusive.
   *  @return {object}
   */
  getTotalAlertsByDay: (from: string, to: string): any => {
    if (!from || !isValid(new Date(from))) {
      return Promise.reject(new Error("Invalid Date: from"));
    }
    if (!to || !isValid(new Date(to))) {
      return Promise.reject(new Error("Invalid Date: to"));
    }
    return api
      .url("/daily")
      .query({ from: isoFormat(from), to: isoFormat(to) })
      .get()
      .json();
  },

  /*
   *  Gets total alert count for the given date range
   *
   *  @param {string} from  from date, inclusive.
   *  @param {string} to    to date, inclusive.
   *  @return {object}
   */
  getTotalAlerts: (from: string, to: string): any => {
    if (!from || !isValid(new Date(from))) {
      return Promise.reject(new Error("Invalid Date: from"));
    }
    if (!to || !isValid(new Date(to))) {
      return Promise.reject(new Error("Invalid Date: to"));
    }
    return api
      .url("/total")
      .query({ from: isoFormat(from), to: isoFormat(to) })
      .get()
      .json();
  },

  /*
   *  Gets the date and location of the most recent alert
   *
   *  @return {object}
   */
  getMostRecentAlert: (): any => api.url("/latest").get().json(),
  /* download the json */

  /*
   *  Opens a persistent connection for interfacing with the server-sent events
   *
   *  @param {string} url   url of the event source
   *  @return {EventSource} the EventSource instance
   */
  getRealTimeAlertEventSource: (
    url = Util.isAlertModeQueryString()
      ? `${SERVER_URL}/real-time-test`
      : `${SERVER_URL}/real-time`
  ) => new EventSource(url),
};


export default AlertClient;
