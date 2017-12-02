import * as moment from 'moment';

export const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

export class CommonUtils {
  static mapObject(obj, func): Array<any> {
    return Object.keys(obj).map((value, index) => {
      return func(obj[value], value);
    }).filter(x => x);
  }

  static filterObject(obj, predicate) {
    let result = {};

    for (let key in obj) {
      if (obj.hasOwnProperty(key) && predicate(obj[key])) {
        result[key] = obj[key];
      }
    }

    return result;
  }

  static utcDateStringToLocalDate(dateString: string) {
    return moment.utc(dateString, DATE_FORMAT).toDate();
  }

  static utcDateStringToLocalDateString(dateString: string) {
    return moment.utc(dateString, DATE_FORMAT).local().format(DATE_FORMAT);
  }

  static localDateToUtcDateString(dateString: string) {
    return moment(dateString, DATE_FORMAT).utc().format(DATE_FORMAT);
  }

  static getObjectProperty(path: string, object: any) {
    if (!path) { return object; }
    return path.split('.').reduce(function(prev, curr) {
      return prev ? prev[curr] : undefined
    }, object);
  }

  static getObjectWithoutKey(object, keyToOmit) {
    return Object.keys(object).reduce((result, key) => {
      if(key !== keyToOmit) {
        result[key] = object[key];
      }
      return result;
    }, {});
  }

  static areObjectsDifferent(obj1, obj2) {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
  }

  static declension(number, expressions) {
    var result;
    var count = number % 100;
    if (count >= 5 && count <= 20) {
      result = expressions['2'];
    } else {
      count = count % 10;
      if (count == 1) {
        result = expressions['0'];
      } else if (count >= 2 && count <= 4) {
        result = expressions['1'];
      } else {
        result = expressions['2'];
      }
    }
    return result;
  }
}
