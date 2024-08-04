import { timeParse } from 'd3-time-format';



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

    // add totalSleepSeconds
    // totalSleepSeconds = 
    //     deepSleepSeconds + lightSleepSeconds + remSleepSeconds + awakeSleepSeconds
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