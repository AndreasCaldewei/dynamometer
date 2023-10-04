import { defineDynamometerPlugin } from '../utils/defineDynamometerPlugin';

export const LoggerPlugin = defineDynamometerPlugin(dynamometer => {
  dynamometer.hooks.hook('put:before', args => {
    console.log(args);
  });
  dynamometer.hooks.hook('put:after', args => {
    console.log(args);
  });
  dynamometer.hooks.hook('delete:before', args => {
    console.log(args);
  });
  dynamometer.hooks.hook('delete:after', args => {
    console.log(args);
  });
  dynamometer.hooks.hook('get:before', args => {
    console.log(args);
  });
  dynamometer.hooks.hook('get:before', args => {
    console.log(args);
  });
  dynamometer.hooks.hook('query:before', args => {
    console.log(args);
  });
  dynamometer.hooks.hook('query:after', args => {
    console.log(args);
  });
});
