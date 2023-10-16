import ncp from 'ncp';

ncp('./package.json', './src/package.json', function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('package.json has been copied to src/');
});
