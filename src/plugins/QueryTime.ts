import { defineDynamometerPlugin } from '../utils/defineDynamometerPlugin';

export const QueryTime = defineDynamometerPlugin(dynamometer => {
  dynamometer.hooks.hook('put:before', args => {
    console.time('put');
  });
  dynamometer.hooks.hook('put:after', args => {
    console.timeEnd('put');
  });
  dynamometer.hooks.hook('delete:before', args => {
    console.time('delete');
  });
  dynamometer.hooks.hook('delete:after', args => {
    console.timeEnd('delete');
  });
  dynamometer.hooks.hook('get:before', args => {
    console.time('get');
  });
  dynamometer.hooks.hook('get:before', args => {
    console.timeEnd('get');
  });
  dynamometer.hooks.hook('query:before', args => {
    console.time('query');
  });
  dynamometer.hooks.hook('query:after', args => {
    console.timeEnd('query');
  });
});
