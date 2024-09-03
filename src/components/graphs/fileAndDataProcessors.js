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

export function getMin(data, key) {
    return data.reduce((acc, d) => Math.min(acc, d[key]), Infinity);
    }

export function getMedian(data, key) {
    const sortedData = data.map(d => d[key]).sort((a, b) => a - b);
    const mid = Math.floor(sortedData.length / 2);
    return (
        sortedData.length % 2 !== 0 
        ? sortedData[mid] 
        : (sortedData[mid - 1] + sortedData[mid]) / 2
    );}

export function getSum(data, key) {
    return data.reduce((acc, d) => acc + d[key], 0);
    }

export function sortData(data, key) {
    return data.sort((a, b) => a[key] - b[key]);
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
    
    return sortData(enduranceData, 'calendarDate');
    }

export function processTrainingLoadData(trainingLoadData) {
    // group by calendarDate with max function
    if (!Array.isArray(trainingLoadData)) {
        throw new TypeError("trainingLoadData should be an array");
    }

    // group by calendarDate with max function
    let groupedData = trainingLoadData.reduce((acc, obj) => {
        const key = obj.calendarDate;
        if (!acc[key] || acc[key].dailyTrainingLoadAcute < obj.dailyTrainingLoadAcute) {
            acc[key] = obj;
        }

        return acc;
    }, {});
    groupedData = Object.values(groupedData);
    // add maxAcuteLoad
    groupedData = groupedData.map(
        (element) => {
            element.maxAcuteLoad = Math.max(
                element.dailyTrainingLoadAcute, 
                element.dailyTrainingLoadChronic*1.5);
            return element;
        });
    // calenderDate is timestamp, add datestr for display
    groupedData = groupedData.map(
        (element) => {
            element.dateStr = timeFormat('%Y-%m-%d')(element.calendarDate);
            return element;
        });
    // if dailyAcuteChronicWorkloadRatio is null set to dailyTrainingLoadAcute / dailyTrainingLoadChronic
    groupedData = groupedData.map(
        (element) => {
            if (element.dailyAcuteChronicWorkloadRatio == null) {
                element.dailyAcuteChronicWorkloadRatio = element.dailyTrainingLoadAcute / element.dailyTrainingLoadChronic;
            }
            return element;
        });

    
    return sortData(groupedData, 'calendarDate');
    }

/**
 * Processes the activities data.
 *
 * @param {Object[]} activitiesData - The activities data to be processed.
 * @param {string} activitiesData[].activityType - The type of activity.
 * ...
 * @returns {{Object.<string, Array>}} - The processed activities data.
 */
export function processActivitiesData(activitiesData) {
    activitiesData = activitiesData[0].summarizedActivitiesExport;
    activitiesData = sortData(activitiesData, 'calendarDate');
    activitiesData = activitiesData.map(
        (element) => {
            element.distance_km = element.distance / 100000;
            element.duration_min = element.duration / 60000;
            element.pace_minkm = element.duration_min / element.distance_km;
            element.speed_kmh = element.distance_km / (element.duration_min / 60);
            element.elevationGain_m = element.elevationGain / 100 ?? 0;
            element.elevationLoss_m = element.elevationLoss / 100 ?? 0;
            element.homolElGain_m = element.elevationGain_m - element.elevationLoss_m;
            element.calendarDate = new Date(element.beginTimestamp);
            return element;
        });
    // filter out paces > 100 min/km
    activitiesData = activitiesData.filter(
        (element) => element.pace_minkm < 100);
    // filter out speeds > 150 km/h 
    activitiesData = activitiesData.filter(
        (element) => element.speed_kmh < 150);
    // keep only elements

    const activitiesObj = {};

    activitiesData.forEach((activity) => {
        const { activityType } = activity;

        if (!activitiesObj[activityType]) {
            activitiesObj[activityType] = [];
        }

        activitiesObj[activityType].push(activity);
    });
    return activitiesObj;  
}

export function processHRVFromTrainingReadiness(trainingReadinessData) {
    // remove days without hrv data
    trainingReadinessData = trainingReadinessData.filter(
        (element) => element.hrvWeeklyAverage != null);
    
    return sortData(trainingReadinessData, 'calendarDate');
}

function calculateWeeklyTotals(data) {
    // Helper function to get the Monday of the week for a given date
    function getMonday(d) {
      d = new Date(d);
      const day = d.getDay(); // Get the day (0 for Sunday, 1 for Monday, etc.)
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      return new Date(d.setDate(diff));
    }
  
    // Group data by week start date
    const weeks = new Map();
  
    data.forEach((entry) => {
      const date = new Date(entry.calendarDate);
      const weekStart = getMonday(date).toISOString().split('T')[0]; // Use ISO string for unique week identifier
      const calendarDate = new Date(getMonday(date).setDate(getMonday(date).getDate() + 6)).toISOString().split('T')[0];
  
      if (!weeks.has(weekStart)) {
        weeks.set(weekStart, { 
          moderateIntensityMinutes: 0, 
          vigorousIntensityMinutes: 0, 
          allIntensityMinutes: 0 
        });
      }
  
      // Accumulate the values
      weeks.get(weekStart).moderateIntensityMinutes += entry.moderateIntensityMinutes || 0;
      weeks.get(weekStart).vigorousIntensityMinutes += entry.vigorousIntensityMinutes || 0;
      weeks.get(weekStart).allIntensityMinutes += entry.allIntensityMinutes || 0;
      weeks.get(weekStart).calendarDate = new Date(calendarDate);
    });
  
    // Convert the Map to an array
    const result = Array.from(weeks.entries()).map(([weekStart, totals]) => ({
      weekStart,
      ...totals,
    }));
  
    return result;
  }

export function processActiveMinutesData(activeMinutesData) {
    activeMinutesData = activeMinutesData.map(
        (element) => {
            element.allIntensityMinutes = element.moderateIntensityMinutes + 2 * element.vigorousIntensityMinutes;
            element.calendarDate = new Date(element.calendarDate);
            return element;
        }
    )
    activeMinutesData = calculateWeeklyTotals(activeMinutesData);
    activeMinutesData = activeMinutesData.map(
        (element) => {
            element.doubleVigorousIntensityMinutes = 2 * element.vigorousIntensityMinutes;
            return element;
        }
    )
    return sortData(activeMinutesData, 'calendarDate');
}

// ** Aggregation functions ** //


/**
 * Selects the first date of a given frequency from a provided date.
 *
 * @param {string} date - The date to select from.
 * @param {string} frequency - The frequency to select (day, week, month, year).
 * @returns {Date} - The selected date as a JavaScript Date object.
 */
export function selectFirstOf(date, frequency, latestDate) {
    const parseDate = timeParse('%Y-%m-%d');
    const formatDate = timeFormat('%Y-%m-%d');
    const parsedDate = moment(date);

    let adjustedDate;

    switch (frequency) {
        case 'day':
            adjustedDate = parsedDate;
            break;
        case 'week':
            if (parsedDate.endOf('week').isAfter(latestDate)) {
                adjustedDate = latestDate;
            }
            else {
                adjustedDate = parsedDate.endOf('week');
            }
            break;
        case 'month':
            if (parsedDate.endOf('month').isAfter(latestDate)) {
                adjustedDate = latestDate;
            }
            else {
                adjustedDate = parsedDate.endOf('month');
            }
            break;
        case 'year':
            if (parsedDate.endOf('year').isAfter(latestDate)) {
                adjustedDate = latestDate;
            }
            else {
                adjustedDate = parsedDate.endOf('year');
            }
            break;
        default:
            adjustedDate = parsedDate;
            break;
    }

    // Format the adjusted date to a string and then parse it back to a D3 date object
    const formattedDate = formatDate(adjustedDate.toDate());
    return parseDate(formattedDate);
}

export function selectDaysAgo(date, frequency, latestDate) {
    const parsedDate = moment(date);
    const parsedLatestDate = moment(latestDate);
    let freqAgo;
    let adjustedDate;

    // calculate how many days ago the date is
    const daysAgo = parsedLatestDate.diff(parsedDate, 'days');

    switch (frequency) {
        case 'day':
            adjustedDate = parsedDate;
            break;
        case 'week':
            freqAgo = Math.floor(daysAgo / 7);
            adjustedDate = parsedLatestDate.subtract(freqAgo, 'weeks');
            break;
        case 'month':
            freqAgo = Math.floor(daysAgo / 30);
            adjustedDate = parsedLatestDate.subtract(freqAgo * 30, 'days');
            break;
        default:
            adjustedDate = parsedDate;
            break;
    }  
    return adjustedDate.toDate();
}

function getDataGroups(data, frequency, groupFunction) {
    const latestDate = moment(data[data.length - 1].calendarDate);
    const groupedData = data.reduce((accumVal, curVal) => {
        const adjustedDate = groupFunction(
            curVal.calendarDate, 
            frequency, 
            latestDate
        );
        // Convert date object to ISO string for unique key
        const adjustedDateStr = adjustedDate.toISOString(); 

        if (!accumVal[adjustedDateStr]) {
            accumVal[adjustedDateStr] = [];
        }
        accumVal[adjustedDateStr].push(curVal);
        return accumVal;
    }, {});
    return groupedData;
}


export function aggregateData(data, frequency, keys, groupFunction, aggFn) {
    if (data.length === 0) {
        return [];
    }
    const groupedData = getDataGroups(data, frequency, groupFunction);
    const aggregatedData = Object.keys(groupedData).map((key) => {
        const group = groupedData[key];
        const aggregatedObj = {
            calendarDate: new Date(key),
        };
        keys.forEach((k) => {
            aggregatedObj[k] = aggFn(group, k);
        });
        return aggregatedObj;
    });

    return aggregatedData;
}


function calculateRollingAverage(data, dateKey, valueKey, rollingDays) {
    const rollingAverages = [];
    let windowSum = 0;
    let windowEnd = data.length - 1;

    for (let i = data.length - 1; i >= 0; i--) {
        const currentDate = moment(data[i][dateKey]);
        const value = data[i][valueKey];

        windowSum += value;

        while (moment(data[windowEnd][dateKey]).diff(currentDate, 'days') >= rollingDays) {
            windowSum -= data[windowEnd][valueKey];
            windowEnd--;
        }

        const windowSize = windowEnd - i + 1;
        const rollingAvg = windowSum / windowSize;

        rollingAverages.unshift({
            ...data[i],
            [`${valueKey}_rollingAvg`]: rollingAvg,
        });
    }

    return rollingAverages;
}


export function calculateRollingWeeklyAverage(data, dateKey, valueKey) {
    const rollingDays = 7;  // 7 days for a weekly rolling average
    return calculateRollingAverage(data, dateKey, valueKey, rollingDays);
}

export function calculateRollingMonthlyAverage(data, dateKey, valueKey) {
    const rollingDays = 30;  // 30 days for a monthly rolling average
    return calculateRollingAverage(data, dateKey, valueKey, rollingDays);
}
