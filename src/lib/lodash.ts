import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import each from 'lodash/each';
import flattenDeep from 'lodash/flattenDeep';
import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';
import keyBy from 'lodash/keyBy';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';
import set from 'lodash/set';
import remove from 'lodash/remove';
import merge from 'lodash/merge';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import orderBy from 'lodash/orderBy';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

export const _ = {
  throttle,
  debounce,
  each,
  flattenDeep,
  omitBy,
  isNil,
  keyBy,
  mergeWith,
  cloneDeep,
  groupBy,
  get,
  set,
  remove,
  merge,
  isEqual,
  uniqWith,
  orderBy,
  upperFirst,
  camelCase,
};
