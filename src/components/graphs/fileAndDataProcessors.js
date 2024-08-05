import { timeParse } from 'd3-time-format';
import { timeFormat } from 'd3-time-format';
import moment from 'moment';


// parsing data
export function parseJsonFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = JSON.parse(event.target.result);
            resolve(data);
        };
        reader.onerror = (event) => {
            reject(event);
        };
        reader.readAsText(file);
    });
}

export function parseFiles(selectFiles, key) {
    // selectFiles[key] is an array of objects with name and data properties
    // they relate to a certain type of data, for example sleep data
    // or endurance score data. 
    return Promise.all(
        selectFiles[key].map((file) => {
            return parseJsonFile(file.data);
        })
        // then flatten the array of arrays
    ).then((data) => [].concat(...data));
}

// cleaning data
function cleanData(data, keys) {
    return data.map(item => {
      const cleanedItem = { ...item };
      keys.forEach(key => {
        if (isNaN(cleanedItem[key])) {
          cleanedItem[key] = 0;
        }
      });
      return cleanedItem;
    });
  };

function secondsToHours(data, keys) {
    return data.map(item => {
      const hours = { ...item };
      keys.forEach(key => {
        hours[key] = hours[key] / 3600;
      });
      return hours;
    });
  }

// accessor functions
export function getDate(d) {
    return new Date(d.calendarDate);
  }

export function getAvg(data, key) {
    return data.reduce((acc, d) => acc + d[key], 0) / data.length;
    }


export function processSleepData(sleepData) {
    // filter element array objects with key sleepStartTimestampGMT null
    sleepData = sleepData.filter(
        (element) => element.sleepStartTimestampGMT != null);
    // keep only elements with proper sleepWindowConfirmationType 
    sleepData = sleepData.filter(
        (element) => ['ENHANCED_CONFIRMED_FINAL', 'MANUALLY_CONFIRMED', 'ENHANCED_CONFIRMED'].includes(element.sleepWindowConfirmationType));
    // parse calendarDate to date object and sort
    sleepData = sleepData.map(
        (element) => {
            element.calendarDate = timeParse('%Y-%m-%d')(element.calendarDate);
            return element;
        }).sort(
        (a, b) => a.calendarDate - b.calendarDate);
    sleepData = sleepData.map(
        (element) => {
            element.totalSleepSeconds = 
              (element.deepSleepSeconds ?? 0)
            + (element.lightSleepSeconds ?? 0) 
            + (element.remSleepSeconds ?? 0)
            + (element.awakeSleepSeconds ?? 0)
            + (element.unmeasurableSeconds ?? 0);
            return element;
        });
    // clean data
    const keys = [
        'awakeSleepSeconds', 
        'remSleepSeconds', 
        'lightSleepSeconds', 
        'deepSleepSeconds', 
        'totalSleepSeconds'
    ];
    sleepData = cleanData(sleepData, keys);
    // convert seconds to hours
    sleepData = secondsToHours(sleepData, keys);
    // rename keys from seconds to hours
    sleepData = sleepData.map(
        (element) => {
            element.awakeSleepHours = element.awakeSleepSeconds;
            element.remSleepHours = element.remSleepSeconds;
            element.lightSleepHours = element.lightSleepSeconds;
            element.deepSleepHours = element.deepSleepSeconds;
            element.totalSleepHours = element.totalSleepSeconds;
            return element;
        });
    return sleepData;
    }

export function processEnduranceData(enduranceData) {
    // sort by calendarDate, which is unix timestamp
    enduranceData = enduranceData.sort(
        (a, b) => a.calendarDate - b.calendarDate);
    return enduranceData;
    }

export function aggregateData(data, frequency, keys, aggFn) {
    // Helper function to parse date and adjust based on frequency
    function getAdjustedDate(date, frequency) {
        const parseDate = timeParse('%Y-%m-%d');
        const formatDate = timeFormat('%Y-%m-%d');
        const parsedDate = moment(date);
        let adjustedDate;

        switch (frequency) {
            case 'day':
                adjustedDate = parsedDate;
                break;
            case 'week':
                adjustedDate = parsedDate.startOf('isoWeek');
                break;
            case 'month':
                adjustedDate = parsedDate.startOf('month');
                break;
            case 'year':
                adjustedDate = parsedDate.startOf('year');
                break;
            default:
                adjustedDate = parsedDate;
                break;
        }

        // Format the adjusted date to a string and then parse it back to a D3 date object
        const formattedDate = formatDate(adjustedDate.toDate());
        return parseDate(formattedDate);
    }

    // Group data based on adjusted date
    const groupedData = data.reduce((acc, obj) => {
        const adjustedDate = getAdjustedDate(obj.calendarDate, frequency);
        const adjustedDateStr = adjustedDate.toISOString(); // Convert date object to ISO string for unique key

        if (!acc[adjustedDateStr]) {
            acc[adjustedDateStr] = [];
        }
        acc[adjustedDateStr].push(obj);
        return acc;
    }, {});

    // Aggregate data for each group
    const aggregatedData = Object.keys(groupedData).map((key) => {
        const group = groupedData[key];
        const aggregatedObj = {
            calendarDate: new Date(key), // Convert ISO string back to Date object
        };
        keys.forEach((k) => {
            aggregatedObj[k] = aggFn(group, k);
        });
        return aggregatedObj;
    });

    return aggregatedData;
}
